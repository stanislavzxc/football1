import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { LoadingSpinner } from '../components/LoadingSpinner'
import Navbar from '../components/Navbar'
import { api } from '../services/api'

interface Match {
	id: number
	start_time: string
	end_time: string
	venue?: {
		name: string
		address: string
	}
	results?: {
		winning_team: string
		red_team_score: number
		green_team_score: number
		blue_team_score: number
	}
}

export default function MatchHistory() {
	const [matches, setMatches] = useState<Match[]>([])
	const [allMatches, setAllMatches] = useState<Match[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedMonth, setSelectedMonth] = useState<Date | null>(null)
	const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
	const [nextGroupIndex, setNextGroupIndex] = useState<number | null>(null)
	const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(
		null
	)

	useEffect(() => {
		const fetchMatches = async () => {
			try {
				// Получаем все завершенные матчи в системе
				const data = await api.getMatchHistory()
				const allMatchesData = data || []
				setAllMatches(allMatchesData)

				// По умолчанию показываем текущий месяц
				const now = new Date()
				const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
				setSelectedMonth(currentMonth)

				// Находим группу, в которой находится текущий месяц
				const months = new Map<string, Date>()
				allMatchesData.forEach((match: Match) => {
					const matchDate = new Date(match.start_time)
					const monthKey = `${matchDate.getFullYear()}-${matchDate.getMonth()}`
					const monthStart = new Date(
						matchDate.getFullYear(),
						matchDate.getMonth(),
						1
					)
					months.set(monthKey, monthStart)
				})
				const sortedMonths = Array.from(months.values()).sort(
					(a, b) => a.getTime() - b.getTime()
				)
				const groups: Date[][] = []
				for (let i = 0; i < sortedMonths.length; i += 3) {
					groups.push(sortedMonths.slice(i, i + 3))
				}

				// Находим индекс группы с текущим месяцем
				const currentGroupIdx = groups.findIndex(group =>
					group.some(
						month =>
							month.getFullYear() === currentMonth.getFullYear() &&
							month.getMonth() === currentMonth.getMonth()
					)
				)

				if (currentGroupIdx >= 0) {
					setCurrentGroupIndex(currentGroupIdx)
				}

				// Фильтруем по текущему месяцу
				const filtered = allMatchesData.filter((match: Match) => {
					const matchDate = new Date(match.start_time)
					return (
						matchDate.getFullYear() === currentMonth.getFullYear() &&
						matchDate.getMonth() === currentMonth.getMonth()
					)
				})
				setMatches(filtered)
			} catch (error) {
				console.error('Error fetching match history:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchMatches()
	}, [])

	useEffect(() => {
		if (selectedMonth && allMatches.length > 0) {
			const filtered = allMatches.filter((match: Match) => {
				const matchDate = new Date(match.start_time)
				return (
					matchDate.getFullYear() === selectedMonth.getFullYear() &&
					matchDate.getMonth() === selectedMonth.getMonth()
				)
			})
			setMatches(filtered)
		}
	}, [selectedMonth, allMatches])

	// Получаем уникальные месяцы из всех матчей, сортированные по возрастанию
	const getAvailableMonths = () => {
		const months = new Map<string, Date>()
		allMatches.forEach((match: Match) => {
			const matchDate = new Date(match.start_time)
			const monthKey = `${matchDate.getFullYear()}-${matchDate.getMonth()}`
			const monthStart = new Date(
				matchDate.getFullYear(),
				matchDate.getMonth(),
				1
			)
			months.set(monthKey, monthStart)
		})

		// Сортируем по возрастанию (старые месяцы первыми)
		return Array.from(months.values()).sort((a, b) => a.getTime() - b.getTime())
	}

	// Группируем месяцы по тройкам (сезоны)
	const getMonthGroups = () => {
		const months = getAvailableMonths()
		const groups: Date[][] = []
		for (let i = 0; i < months.length; i += 3) {
			groups.push(months.slice(i, i + 3))
		}
		return groups
	}

	const monthGroups = getMonthGroups()
	const currentMonths = monthGroups[currentGroupIndex] || []

	const handlePreviousGroup = () => {
		if (currentGroupIndex > 0) {
			const newIndex = currentGroupIndex - 1
			setNextGroupIndex(newIndex)
			setSlideDirection('right')
			// Ждем начала анимации, затем устанавливаем финальную позицию новой группы
			setTimeout(() => {
				const nextGroupEl = document.querySelector(
					'.sliding-group'
				) as HTMLElement
				if (nextGroupEl) {
					nextGroupEl.style.transform = 'translateX(0)'
				}
			}, 10)
			// После завершения анимации переключаемся на новую группу
			setTimeout(() => {
				setCurrentGroupIndex(newIndex)
				setNextGroupIndex(null)
				setSlideDirection(null)
			}, 300)
		}
	}

	const handleNextGroup = () => {
		if (currentGroupIndex < monthGroups.length - 1) {
			const newIndex = currentGroupIndex + 1
			setNextGroupIndex(newIndex)
			setSlideDirection('left')
			// Ждем начала анимации, затем устанавливаем финальную позицию новой группы
			setTimeout(() => {
				const nextGroupEl = document.querySelector(
					'.sliding-group'
				) as HTMLElement
				if (nextGroupEl) {
					nextGroupEl.style.transform = 'translateX(0)'
				}
			}, 10)
			// После завершения анимации переключаемся на новую группу
			setTimeout(() => {
				setCurrentGroupIndex(newIndex)
				setNextGroupIndex(null)
				setSlideDirection(null)
			}, 300)
		}
	}

	const getMonthName = (date: Date) => {
		return date.toLocaleDateString('ru-RU', { month: 'long' })
	}

	const formatMatchDate = (match: Match) => {
		const date = new Date(match.start_time)
		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
		})
	}

	const formatMatchTime = (match: Match) => {
		const startTime = new Date(match.start_time).toLocaleTimeString('ru-RU', {
			hour: '2-digit',
			minute: '2-digit',
		})
		const endTime = new Date(match.end_time).toLocaleTimeString('ru-RU', {
			hour: '2-digit',
			minute: '2-digit',
		})
		return `${startTime}-${endTime}`
	}

	const getWinnerName = (winningTeam: string) => {
		switch (winningTeam) {
			case 'red':
				return 'Красные'
			case 'green':
				return 'Зеленые'
			case 'blue':
				return 'Синие'
			case 'draw':
				return 'Ничья'
			default:
				return 'Неизвестно'
		}
	}

	const getWinnerIcon = (winningTeam: string) => {
		switch (winningTeam) {
			case 'red':
				return '🔴'
			case 'green':
				return '🟢'
			case 'blue':
				return '🔵'
			case 'draw':
				return '🤝'
			default:
				return '⚽'
		}
	}

	if (loading) {
		return (
			<Layout title='История матчей' showBackButton>
				<LoadingSpinner message='Загрузка истории матчей...' />
			</Layout>
		)
	}

	return (
		<div
			className={`w-full items-center flex flex-col bg-[#fff] dark:bg-[#1A1F25] min-h-screen`}
		>
			<div className='w-full border-b border-b-[2px] border-[#C3C3C3] dark:border-[#575757] py-[20px]'>
				<h3 className='text-[24px] text-[#000] dark:text-[#fff] px-[16px] roboto font-bold'>
					История игр
				</h3>
			</div>
			<div className='grid grid-cols-[30px_200px_30px] grid-rows-[30px] w-full justify-between mt-[12px] px-[15px]'>
				<svg
					width='30'
					height='30'
					viewBox='0 0 30 30'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path
						d='M15 30C23.265 30 30 23.265 30 15C30 6.735 23.265 0 15 0C6.735 0 0 6.735 0 15C0 23.265 6.735 30 15 30ZM10.815 14.205L16.11 8.91C16.335 8.685 16.62 8.58 16.905 8.58C17.19 8.58 17.475 8.685 17.7 8.91C18.135 9.345 18.135 10.065 17.7 10.5L13.2 15L17.7 19.5C18.135 19.935 18.135 20.655 17.7 21.09C17.265 21.525 16.545 21.525 16.11 21.09L10.815 15.795C10.365 15.36 10.365 14.64 10.815 14.205Z'
						fill='#697281'
					/>
				</svg>

				<div className='size-full bg-[#3D82FF] dark:bg-[#6FBBE5] rounded-[17px] grid place-content-center text-[20px] font-bold text-white'>
					Ноябрь
				</div>
				<svg
					width='30'
					height='30'
					viewBox='0 0 30 30'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path
						d='M15 0C6.735 0 0 6.735 0 15C0 23.265 6.735 30 15 30C23.265 30 30 23.265 30 15C30 6.735 23.265 0 15 0ZM19.185 15.795L13.89 21.09C13.665 21.315 13.38 21.42 13.095 21.42C12.81 21.42 12.525 21.315 12.3 21.09C11.865 20.655 11.865 19.935 12.3 19.5L16.8 15L12.3 10.5C11.865 10.065 11.865 9.345 12.3 8.91C12.735 8.475 13.455 8.475 13.89 8.91L19.185 14.205C19.635 14.64 19.635 15.36 19.185 15.795Z'
						fill='#697281'
					/>
				</svg>
			</div>
			<div className='flex flex-col h-[calc(100vh-78px-73px)] overflow-y-scroll w-full'>
				{matches && matches.length ? (
					new Array(10).fill(' ').map((_, index) => {
						return (
							<div
								className='grid grid-rows-[120px] grid-cols-[120px_1fr] gap-[15px] p-[15px] border-b border-[#C3C3C3] dark:border-[#575757] items-center'
								key={index}
							>
								<div className='bg-[#9C4E4E] rounded-[20px] size-full'></div>
								<div className='flex flex-col'>
									<p className='text-[#2C2F34] font-[600] text-[16px] text-[#2C2F34] dark:text-white leading-[16px] mt-[10px]'>
										вт, 9 декабря
									</p>
									<p className='text-[#2C2F34] font-[600] text-[16px] text-[#2C2F34] dark:text-white'>
										20:30-21:30
									</p>
									<p className='text-[14px] font-[400] text-[#2C2F34] dark:text-white mt-[4px] mb-[6px]'>
										УниЛига-Арена
									</p>
									<div className='flex items-center'>
										<span className='text-[#2C2F34] dark:text-white font-bold text-[20px] flex items-center'>
											Победители:
										</span>
										<p className='flex items-center text-[20px] text-[#2C2F34] font-bold dark:text-[#fff]'>
											{getWinnerIcon('red') + ' ' + getWinnerName('red')}
										</p>
									</div>
								</div>
							</div>
						)
					})
				) : (
					<div className='grid place-content-center h-[calc(100vh-78px-73px)] dark:text-white text-[#2C2F34] dark:text-white text-[20px]'>
						Матчей в этом месяце нет.
					</div>
				)}
			</div>
			<Navbar />
		</div>
	)
}
