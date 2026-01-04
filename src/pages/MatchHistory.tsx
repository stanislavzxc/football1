import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { LoadingSpinner } from '../components/LoadingSpinner'
import Navbar from '../components/Navbar'
import { api } from '../services/api'
import { showNotification } from '../utils/api'

interface Match {
	id: number
	start_time: string
	end_time: string
	venue?: {
		id: number
		name: string
		address: string
		image_url: string
	}
	results?: {
		id: number
		match_id: number
		winning_team: string
		red_team_score: number
		green_team_score: number
		blue_team_score: number
	}
	status: string
	date: string
	max_players: number
	price: string
	description: string
}

interface MonthData {
	date: Date // Первое число месяца
	year: number
	month: number // 0-11
	name: string // Название месяца
	key: string // Уникальный ключ вида "2024-12"
}

export default function MatchHistory() {
	const [matches, setMatches] = useState<Match[]>([])
	const [allMatches, setAllMatches] = useState<Match[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null)
	const [availableMonths, setAvailableMonths] = useState<MonthData[]>([])
	const [failedImages, setFailedImages] = useState<Set<number>>(new Set())
	const navigate = useNavigate()

	useEffect(() => {
		const fetchMatches = async () => {
			try {
				setLoading(true)
				const data = await api.getMatchHistory()
				const allMatchesData = Array.isArray(data) ? data : []
				
				console.log('Всего матчей получено:', allMatchesData.length)
				
				setAllMatches(allMatchesData)

				// Получаем все уникальные месяцы из данных
				const months = extractUniqueMonths(allMatchesData)
				setAvailableMonths(months)
				
				console.log('Извлеченные месяцы:', months.map(m => m.key))

				if (months.length > 0) {
					// По умолчанию показываем последний месяц (самый свежий)
					const defaultMonth = months[months.length - 1]
					setSelectedMonth(defaultMonth)
				} else {
					// Если нет матчей, показываем текущий месяц
					const now = new Date()
					const currentMonth: MonthData = {
						date: new Date(now.getFullYear(), now.getMonth(), 1),
						year: now.getFullYear(),
						month: now.getMonth(),
						name: getMonthName(new Date(now.getFullYear(), now.getMonth(), 1)),
						key: `${now.getFullYear()}-${now.getMonth().toString().padStart(2, '0')}`
					}
					setSelectedMonth(currentMonth)
					setAvailableMonths([currentMonth])
				}
			} catch (error) {
				console.error('Error fetching match history:', error)
				showNotification('Ошибка загрузки истории матчей', 'error')
			} finally {
				setLoading(false)
			}
		}

		fetchMatches()
	}, [])

	useEffect(() => {
		if (selectedMonth && allMatches.length > 0) {
			const filtered = allMatches.filter((match: Match) => {
				try {
					const matchDate = new Date(match.start_time)
					return (
						!isNaN(matchDate.getTime()) &&
						matchDate.getFullYear() === selectedMonth.year &&
						matchDate.getMonth() === selectedMonth.month
					)
				} catch {
					return false
				}
			})
			console.log(`Фильтрация для ${selectedMonth.key}:`, {
				selectedMonth: selectedMonth.key,
				найдено: filtered.length
			})
			setMatches(filtered)
		} else if (selectedMonth) {
			setMatches([])
		}
	}, [selectedMonth, allMatches])

	// Функция для извлечения уникальных месяцев из данных
	const extractUniqueMonths = (matches: Match[]): MonthData[] => {
		if (matches.length === 0) return []
		
		const monthMap = new Map<string, MonthData>()
		
		matches.forEach((match) => {
			try {
				const matchDate = new Date(match.start_time)
				if (!isNaN(matchDate.getTime())) {
					const year = matchDate.getFullYear()
					const month = matchDate.getMonth()
					const key = `${year}-${month.toString().padStart(2, '0')}`
					
					if (!monthMap.has(key)) {
						monthMap.set(key, {
							date: new Date(year, month, 1),
							year,
							month,
							name: getMonthName(new Date(year, month, 1)),
							key
						})
					}
				}
			} catch (error) {
				console.error('Ошибка при обработке даты матча:', error)
			}
		})
		
		// Сортируем по дате (от старых к новым)
		const sortedMonths = Array.from(monthMap.values()).sort((a, b) => {
			if (a.year !== b.year) return a.year - b.year
			return a.month - b.month
		})
		
		return sortedMonths
	}

	// Функция для навигации к деталям матча
	const handleMatchClick = (matchId: number) => {
		navigate(`/match/${matchId}/result`)
	}

	// Функция для создания прокси URL для обхода CORS
	const getImageUrl = (url: string | undefined, matchId: number): string => {
		if (!url) return getFallbackImage()
		
		if (failedImages.has(matchId)) {
			return getFallbackImage()
		}
		
		let fixedUrl = url.replace(/^hhttps:/, 'https:')
		return `https://images.weserv.nl/?url=${encodeURIComponent(fixedUrl)}&w=120&h=120&fit=cover`
	}

	// Функция для создания fallback изображения
	const getFallbackImage = (): string => {
		return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+0KDQsNCx0L48L3RleHQ+Cjwvc3ZnPg=='
	}

	const handleImageError = (matchId: number) => {
		setFailedImages(prev => new Set(prev).add(matchId))
	}

	const getMonthName = (date: Date) => {
		return date.toLocaleDateString('ru-RU', { 
			month: 'long',
			// year: 'numeric'
		})
	}

	const formatMatchDate = (match: Match) => {
		try {
			const date = new Date(match.start_time)
			if (isNaN(date.getTime())) return 'Дата не указана'
			
			return date.toLocaleDateString('ru-RU', {
				day: 'numeric',
				month: 'long',
			})
		} catch {
			return 'Дата не указана'
		}
	}

	const formatMatchTime = (match: Match) => {
		try {
			const startTime = new Date(match.start_time).toLocaleTimeString('ru-RU', {
				hour: '2-digit',
				minute: '2-digit',
			})
			const endTime = new Date(match.end_time).toLocaleTimeString('ru-RU', {
				hour: '2-digit',
				minute: '2-digit',
			})
			return `${startTime}-${endTime}`
		} catch {
			return 'Время не указано'
		}
	}

	const getDayOfWeek = (match: Match) => {
		try {
			const date = new Date(match.start_time)
			if (isNaN(date.getTime())) return ''
			
			return date.toLocaleDateString('ru-RU', { 
				weekday: 'short' 
			}).replace('.', '')
		} catch {
			return ''
		}
	}

	const getWinnerName = (winningTeam?: string) => {
		if (!winningTeam) return 'Результат не известен'
		
		switch (winningTeam) {
			case 'red':
				return '🔴 Красные'
			case 'green':
				return '🟢 Зеленые'
			case 'blue':
				return '🔵 Синие'
			case 'draw':
				return '🟡 Ничья'
			default:
				return 'Результат не известен'
		}
	}

	// Функция для перехода к предыдущему месяцу
	const handlePreviousMonth = () => {
		if (!selectedMonth || availableMonths.length === 0) return
		
		const currentIndex = availableMonths.findIndex(m => m.key === selectedMonth.key)
		if (currentIndex > 0) {
			const previousMonth = availableMonths[currentIndex - 1]
			setSelectedMonth(previousMonth)
		}
	}

	// Функция для перехода к следующему месяцу
	const handleNextMonth = () => {
		if (!selectedMonth || availableMonths.length === 0) return
		
		const currentIndex = availableMonths.findIndex(m => m.key === selectedMonth.key)
		if (currentIndex < availableMonths.length - 1) {
			const nextMonth = availableMonths[currentIndex + 1]
			setSelectedMonth(nextMonth)
		}
	}

	// Проверяем, есть ли предыдущий месяц
	const hasPreviousMonth = () => {
		if (!selectedMonth || availableMonths.length === 0) return false
		const currentIndex = availableMonths.findIndex(m => m.key === selectedMonth.key)
		return currentIndex > 0
	}

	// Проверяем, есть ли следующий месяц
	const hasNextMonth = () => {
		if (!selectedMonth || availableMonths.length === 0) return false
		const currentIndex = availableMonths.findIndex(m => m.key === selectedMonth.key)
		return currentIndex < availableMonths.length - 1
	}

	if (loading) {
		return (
			<div className='w-full items-center flex flex-col bg-[#fff] dark:bg-[#1A1F25] min-h-screen' >
				<div className='w-full border-b border-b-[2px] border-[#C3C3C3] dark:border-[#575757] py-[20px]'>
					<h3 className='text-[24px] text-[#000] dark:text-[#fff] px-[16px] roboto font-bold'>
						История игр
					</h3>
				</div>
				<div className='flex items-center justify-center h-[calc(100vh-78px-73px)]'>
					<LoadingSpinner message='Загрузка истории матчей...' />
				</div>
			</div>
		)
	}

	return (
		<div className='w-full items-center flex flex-col bg-[#fff] dark:bg-[#1A1F25] min-h-screen'>
			<div className='w-full border-b border-b-[2px] border-[#C3C3C3] dark:border-[#575757] py-[20px]'>
				<h3 className='text-[24px] text-[#000] dark:text-[#fff] px-[16px] roboto font-bold'>
					История игр
				</h3>
			</div>
			
			{/* Выбор месяца */}
			<div className='w-full px-4 mt-4'>
				<div className='flex items-center justify-between gap-2 mb-4'>
					<button
						onClick={handlePreviousMonth}
						disabled={!hasPreviousMonth()}
						className={`p-2 ${!hasPreviousMonth() ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
					>
						<svg width='24' height='24' viewBox='0 0 30 30' fill='none'>
							<path
								d='M15 30C23.265 30 30 23.265 30 15C30 6.735 23.265 0 15 0C6.735 0 0 6.735 0 15C0 23.265 6.735 30 15 30ZM10.815 14.205L16.11 8.91C16.335 8.685 16.62 8.58 16.905 8.58C17.19 8.58 17.475 8.685 17.7 8.91C18.135 9.345 18.135 10.065 17.7 10.5L13.2 15L17.7 19.5C18.135 19.935 18.135 20.655 17.7 21.09C17.265 21.525 16.545 21.525 16.11 21.09L10.815 15.795C10.365 15.36 10.365 14.64 10.815 14.205Z'
								fill='#697281'
							/>
						</svg>
					</button>

					{/* Только текущий месяц */}
					<div className='flex-1 flex justify-center' >
						{selectedMonth && (
							<div className='bg-[#3D82FF] dark:bg-[#6FBBE5] rounded-[17px] px-6 py-2 text-center' style={{width:'80%', padding:'5px'}}>
								<div className='text-[15px] font-bold text-white'>
									{selectedMonth.name}
								</div>
							</div>
						)}
					</div>

					<button
						onClick={handleNextMonth}
						disabled={!hasNextMonth()}
						className={`p-2 ${!hasNextMonth() ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
					>
						<svg width='24' height='24' viewBox='0 0 30 30' fill='none'>
							<path
								d='M15 0C6.735 0 0 6.735 0 15C0 23.265 6.735 30 15 30C23.265 30 30 23.265 30 15C30 6.735 23.265 0 15 0ZM19.185 15.795L13.89 21.09C13.665 21.315 13.38 21.42 13.095 21.42C12.81 21.42 12.525 21.315 12.3 21.09C11.865 20.655 11.865 19.935 12.3 19.5L16.8 15L12.3 10.5C11.865 10.065 11.865 9.345 12.3 8.91C12.735 8.475 13.455 8.475 13.89 8.91L19.185 14.205C19.635 14.64 19.635 15.36 19.185 15.795Z'
								fill='#697281'
							/>
						</svg>
					</button>
				</div>
			</div>
			
			{/* Список матчей */}
			<div className='flex-1 overflow-y-auto w-full pb-20'>
				{matches.length > 0 ? (
					<div>
						{matches.map((match) => {
							const winnerName = getWinnerName(match.results?.winning_team)
							const imageUrl = getImageUrl(match.venue?.image_url, match.id)
							
							return (
								<div
									className='grid grid-rows-[120px] grid-cols-[120px_1fr] gap-[15px] p-[15px] border-b border-[#C3C3C3] dark:border-[#575757] items-center'
									key={match.id}
									onClick={() => handleMatchClick(match.id)}
									style={{ cursor: 'pointer' }}
								>
									<div className='relative rounded-[20px] size-full overflow-hidden'>
										<img 
											src={imageUrl}
											alt={'матч'}
											className='w-full h-full object-cover'
											onError={() => handleImageError(match.id)}
										/>
									</div>
									
									<div className='flex flex-col'>
										<p className='text-[#2C2F34] font-[600] text-[16px] dark:text-white leading-[16px] mt-[10px]'>
											{getDayOfWeek(match)}, {formatMatchDate(match)}
										</p>
										<p className='text-[#2C2F34] font-[600] text-[16px] dark:text-white mt-[4px]'>
											{formatMatchTime(match)}
										</p>
										<p className='text-[14px] font-[400] text-[#2C2F34] dark:text-white mt-[4px] mb-[6px]'>
											{match.venue?.name || 'Место не указано'}
											{match.venue?.address && `, ${match.venue.address}`}
										</p>
										<div className='flex items-center gap-[8px]'>
											<span className='text-[#2C2F34] dark:text-white font-bold text-[16px]'>
												Победители:
											</span>
											<p className='flex items-center text-[16px] text-[#2C2F34] font-bold dark:text-white'>
												{winnerName}
											</p>
										</div>
									</div>
								</div>
							)
						})}
					</div>
				) : (
					<div className='grid place-content-center h-[200px] text-[#2C2F34] dark:text-white text-[18px] text-center px-[20px]'>
						{allMatches.length === 0 
							? 'История матчей пуста'
							: `В ${selectedMonth?.name.toLowerCase()} матчей нет.`
						}
					</div>
				)}
			</div>
			
			<Navbar />
		</div>
	)
}