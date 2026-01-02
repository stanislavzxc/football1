import { useEffect, useState } from 'react'
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

export default function MatchHistory() {
	const [matches, setMatches] = useState<Match[]>([])
	const [allMatches, setAllMatches] = useState<Match[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedMonth, setSelectedMonth] = useState<Date | null>(null)
	const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
	const [failedImages, setFailedImages] = useState<Set<number>>(new Set())

	useEffect(() => {
		const fetchMatches = async () => {
			try {
				setLoading(true)
				const data = await api.getMatchHistory()
				const allMatchesData = Array.isArray(data) ? data : []
				console.log('API данные:', allMatchesData)
				
				if (allMatchesData.length === 0) {
					console.warn('No match history data received from API')
				}
				
				setAllMatches(allMatchesData)

				const availableMonths = getAvailableMonthsFromData(allMatchesData)
				
				if (availableMonths.length > 0) {
					// По умолчанию показываем последний месяц (самый свежий)
					const currentMonth = availableMonths[availableMonths.length - 1]
					setSelectedMonth(currentMonth)
					
					// Находим индекс группы для этого месяца
					const groups = groupMonths(availableMonths)
					const currentGroupIdx = groups.findIndex(group => 
						group.some(month => 
							month.getTime() === currentMonth.getTime()
						)
					)
					
					if (currentGroupIdx >= 0) {
						setCurrentGroupIndex(currentGroupIdx)
					}
				} else {
					// Если нет матчей, показываем текущий месяц
					const now = new Date()
					const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
					setSelectedMonth(currentMonth)
				}

				if (selectedMonth) {
					const filtered = allMatchesData.filter((match: Match) => {
						try {
							const matchDate = new Date(match.start_time)
							return (
								!isNaN(matchDate.getTime()) &&
								matchDate.getFullYear() === selectedMonth.getFullYear() &&
								matchDate.getMonth() === selectedMonth.getMonth()
							)
						} catch {
							return false
						}
					})
					setMatches(filtered)
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
						matchDate.getFullYear() === selectedMonth.getFullYear() &&
						matchDate.getMonth() === selectedMonth.getMonth()
					)
				} catch {
					return false
				}
			})
			setMatches(filtered)
		} else if (selectedMonth) {
			setMatches([])
		}
	}, [selectedMonth, allMatches])

	// Функция для создания прокси URL для обхода CORS
	const getImageUrl = (url: string | undefined, matchId: number): string => {
		if (!url) return getFallbackImage()
		
		// Если изображение уже не загрузилось ранее, используем fallback
		if (failedImages.has(matchId)) {
			return getFallbackImage()
		}
		
		// Исправляем опечатки в протоколе
		let fixedUrl = url.replace(/^hhttps:/, 'https:')
		
		// Используем CORS прокси для обхода ограничений
		return `https://images.weserv.nl/?url=${encodeURIComponent(fixedUrl)}&w=120&h=120&fit=cover`
	}

	// Функция для создания fallback изображения
	const getFallbackImage = (): string => {
		return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+0KDQsNCx0L48L3RleHQ+Cjwvc3ZnPg=='
	}

	const handleImageError = (matchId: number) => {
		console.log('Image failed to load for match:', matchId)
		setFailedImages(prev => new Set(prev).add(matchId))
	}

	const getAvailableMonths = () => {
		if (allMatches.length === 0) return []
		
		const months = new Map<string, Date>()
		allMatches.forEach((match: Match) => {
			try {
				const matchDate = new Date(match.start_time)
				if (!isNaN(matchDate.getTime())) {
					const monthKey = `${matchDate.getFullYear()}-${matchDate.getMonth()}`
					const monthStart = new Date(
						matchDate.getFullYear(),
						matchDate.getMonth(),
						1
					)
					months.set(monthKey, monthStart)
				}
			} catch {
				// Пропускаем невалидные даты
			}
		})

		return Array.from(months.values()).sort((a, b) => a.getTime() - b.getTime())
	}

	const getAvailableMonthsFromData = (data: Match[]) => {
		if (data.length === 0) return []
		
		const months = new Map<string, Date>()
		data.forEach((match: Match) => {
			try {
				const matchDate = new Date(match.start_time)
				if (!isNaN(matchDate.getTime())) {
					const monthKey = `${matchDate.getFullYear()}-${matchDate.getMonth()}`
					const monthStart = new Date(
						matchDate.getFullYear(),
						matchDate.getMonth(),
						1
					)
					months.set(monthKey, monthStart)
				}
			} catch {
				// Пропускаем невалидные даты
			}
		})

		return Array.from(months.values()).sort((a, b) => a.getTime() - b.getTime())
	}

	const groupMonths = (months: Date[]) => {
		const groups: Date[][] = []
		for (let i = 0; i < months.length; i += 3) {
			groups.push(months.slice(i, i + 3))
		}
		return groups
	}

	const availableMonths = getAvailableMonths()
	const monthGroups = groupMonths(availableMonths)
	const currentGroup = monthGroups[currentGroupIndex] || []

	const handlePreviousGroup = () => {
		if (currentGroupIndex > 0) {
			const newIndex = currentGroupIndex - 1
			setCurrentGroupIndex(newIndex)
			
			// Устанавливаем первый месяц новой группы как выбранный
			const newGroup = monthGroups[newIndex]
			if (newGroup && newGroup.length > 0) {
				setSelectedMonth(newGroup[0])
			}
		}
	}

	const handleNextGroup = () => {
		if (currentGroupIndex < monthGroups.length - 1) {
			const newIndex = currentGroupIndex + 1
			setCurrentGroupIndex(newIndex)
			
			// Устанавливаем первый месяц новой группы как выбранный
			const newGroup = monthGroups[newIndex]
			if (newGroup && newGroup.length > 0) {
				setSelectedMonth(newGroup[0])
			}
		}
	}

	const getMonthName = (date: Date) => {
		return date.toLocaleDateString('ru-RU', { month: 'long' })
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
			
			return date.toLocaleDateString('ru-RU', { weekday: 'short' })
		} catch {
			return ''
		}
	}

	const getWinnerName = (winningTeam?: string) => {
		if (!winningTeam) return 'Результат не известен'
		
		switch (winningTeam) {
			case 'red':
				return '🔴Красные'
			case 'green':
				return '🟢Зеленые'
			case 'blue':
				return '🔵Синие'
			case 'draw':
				return 'Ничья'
			default:
				return 'Результат не известен'
		}
	}

	const getWinnerIcon = (winningTeam?: string) => {
		if (!winningTeam) return ' '
		return ''
	}

	if (loading) {
		return (
			<div className='w-full items-center flex flex-col bg-[#fff] dark:bg-[#1A1F25] min-h-screen'>
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

	const currentMonthName = selectedMonth 
		? getMonthName(selectedMonth)
		: 'Текущий месяц'

	return (
		<div
			className={`w-full items-center flex flex-col bg-[#fff] dark:bg-[#1A1F25] min-h-screen`}
		>
			<div className='w-full border-b border-b-[2px] border-[#C3C3C3] dark:border-[#575757] py-[20px]'>
				<h3 className='text-[24px] text-[#000] dark:text-[#fff] px-[16px] roboto font-bold'>
					История игр
				</h3>
			</div>
			
			{/* Выбор месяца - упрощенный вариант */}
			<div className='flex flex-col w-full px-[15px] mt-[12px]'>
				<div className='flex items-center justify-center gap-[12px] mb-[12px]' style={{display:'flex', justifyContent:'space-between',}}>
					{/* Стрелка влево */}
					<button
						onClick={handlePreviousGroup}
						disabled={currentGroupIndex === 0}
						className={`p-[8px] ${currentGroupIndex === 0 ? 'opacity-30' : 'opacity-100'}`}
					>
						<svg
							width='24'
							height='24'
							viewBox='0 0 30 30'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M15 30C23.265 30 30 23.265 30 15C30 6.735 23.265 0 15 0C6.735 0 0 6.735 0 15C0 23.265 6.735 30 15 30ZM10.815 14.205L16.11 8.91C16.335 8.685 16.62 8.58 16.905 8.58C17.19 8.58 17.475 8.685 17.7 8.91C18.135 9.345 18.135 10.065 17.7 10.5L13.2 15L17.7 19.5C18.135 19.935 18.135 20.655 17.7 21.09C17.265 21.525 16.545 21.525 16.11 21.09L10.815 15.795C10.365 15.36 10.365 14.64 10.815 14.205Z'
								fill='#697281'
							/>
						</svg>
					</button>
					{/* Название текущего месяца в рамке */}
					<div className='flex-1 bg-[#3D82FF] dark:bg-[#6FBBE5] rounded-[17px] grid place-content-center text-[15px] font-bold text-white py-[5px] px-[16px]' style={{maxWidth:'40%', display:'flex'}}>
						{currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)} {selectedMonth?.getFullYear()}
					</div>

					{/* Стрелка вправо */}
					<button
						onClick={handleNextGroup}
						disabled={currentGroupIndex >= monthGroups.length - 1}
						className={`p-[8px] ${currentGroupIndex >= monthGroups.length - 1 ? 'opacity-30' : 'opacity-100'}`}
					>
						<svg
							width='24'
							height='24'
							viewBox='0 0 30 30'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M15 0C6.735 0 0 6.735 0 15C0 23.265 6.735 30 15 30C23.265 30 30 23.265 30 15C30 6.735 23.265 0 15 0ZM19.185 15.795L13.89 21.09C13.665 21.315 13.38 21.42 13.095 21.42C12.81 21.42 12.525 21.315 12.3 21.09C11.865 20.655 11.865 19.935 12.3 19.5L16.8 15L12.3 10.5C11.865 10.065 11.865 9.345 12.3 8.91C12.735 8.475 13.455 8.475 13.89 8.91L19.185 14.205C19.635 14.64 19.635 15.36 19.185 15.795Z'
								fill='#697281'
							/>
						</svg>
					</button>
				</div>

			</div>
			
			{/* Список матчей */}
			<div className='flex flex-col h-[calc(100vh-78px-73px-80px)] overflow-y-scroll w-full'>
				{matches && matches.length > 0 ? (
					matches.map((match) => {
						const winnerName = getWinnerName(match.results?.winning_team)
						const imageUrl = getImageUrl(match.venue?.image_url, match.id)
						
						return (
							<div
								className='grid grid-rows-[120px] grid-cols-[120px_1fr] gap-[15px] p-[15px] border-b border-[#C3C3C3] dark:border-[#575757] items-center'
								key={match.id}
							>
								{/* Изображение арены */}
								<div className='relative rounded-[20px] size-full overflow-hidden'>
									<img 
										src={imageUrl}
										alt={match.venue?.name || 'Арена'}
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
					})
				) : (
					<div className='grid place-content-center h-[calc(100vh-78px-73px-80px)] text-[#2C2F34] dark:text-white text-[20px] text-center px-[20px]'>
						{allMatches.length === 0 
							? 'История матчей пуста'
							: `Матчей в ${currentMonthName.toLowerCase()} нет.`
						}
					</div>
				)}
			</div>
			<Navbar />
		</div>
	)
}