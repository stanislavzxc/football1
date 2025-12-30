import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import Navbar from '../components/Navbar'
import { useTheme } from '../contexts/ThemeContext'
import { api } from '../services/api'

interface Match {
	id: number
	date: string
	start_time: string
	end_time: string
	venue_id: number
	max_players: number
	price: number
	status: string
	description?: string
	venue?: {
		id: number
		name: string
		address: string
	}
}

export default function GameRegister() {
	const { isDarkMode } = useTheme()
	const [matches, setMatches] = useState<Match[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchMatches = async () => {
			try {
				setError(null)
				const data = await api.getMatches()
				setMatches(data || [])
			} catch (error: any) {
				console.error('Error fetching matches:', error)
				setError(
					'Ошибка при загрузке матчей. Проверьте подключение к интернету.'
				)
				setMatches([])
			} finally {
				setLoading(false)
			}
		}

		fetchMatches()
	}, [])

	const formatTime = (dateTime: string) => {
		const date = new Date(dateTime)
		return date.toLocaleTimeString('ru-RU', {
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	if (loading) {
		return (
			<Layout title='Площадки' showBackButton>
				<div
					style={{
						color: 'white',
						fontSize: '1.2rem',
						textAlign: 'center',
						marginTop: '50px',
					}}
				>
					Загрузка площадок...
				</div>
			</Layout>
		)
	}

	return (
		<div
			className={`w-full items-center flex flex-col bg-[#fff] dark:bg-[#1A1F25] min-h-screen`}
		>
			<div className='w-full border-b border-b-[2px] border-[#C3C3C3] dark:border-[#575757] py-[20px]'>
				<h3 className='text-[24px] text-[#000] dark:text-[#fff] px-[16px] roboto font-bold'>
					Ближайшие матчи
				</h3>
			</div>
			<div className='flex flex-col h-[calc(100vh-78px-73px)] overflow-y-scroll w-full'>
				{new Array(10).fill(' ').map((_, index) => {
					return (
						<div
							className='grid grid-rows-[120px] grid-cols-[120px_1fr] gap-[15px] p-[15px] border-b border-[#C3C3C3] dark:border-[#575757] items-center'
							key={index}
						>
							<div className='bg-[#9C4E4E] rounded-[20px] size-full'></div>
							<div className='flex flex-col'>
								<h2 className='font-bold text-[26px] text-[#2C2F34] dark:text-white'>
									УниЛига-Арена
								</h2>
								<p className='text-[14px] font-[400] text-[#2C2F34] dark:text-white'>
									ул. Наговицыной-Икрянистовой. 6
								</p>
								<p className='text-[#2C2F34] font-[600] text-[16px] dark:text-white leading-[16px] mt-[10px]'>
									вт, 9 декабря
								</p>
								<p className='text-[#2C2F34] font-[600] text-[16px] dark:text-white'>
									20:30-21:30
								</p>
							</div>
						</div>
					)
				})}
			</div>
			<Navbar />
		</div>
	)
}
