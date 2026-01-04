import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useTelegram } from './hooks/useTelegram'
import { viewportManager } from './utils/viewport'

import FAQ from './pages/FAQ'
import GameRegister from './pages/GameRegister'
import MainPage from './pages/MainPage'
import MatchDetails from './pages/MatchDetails'
import MatchHistory from './pages/MatchHistory'
import MyProfile from './pages/MyProfile'
import MyRegistrations from './pages/MyRegistrations'
import NoFreePlaces from './pages/NoFreePlaces'
import PaymentInstructions from './pages/PaymentInstructions'
import PlayerStats from './pages/PlayerStats'
import RegisteredList from './pages/RegisteredList'
import SuccessfulRegister from './pages/SuccessfulRegister'
import Venues from './pages/Venues'

import { CancelNotification } from './components/CancelNotification'
import BookingCancelled from './pages/BookingCancelled'
import CancelSuccess from './pages/CancelSuccess'
import LoadingScreen from './pages/LoadingScreen'
import MatchResult from './pages/MatchResult'
import PaymentError from './pages/PaymentError'

// Admin routes component
import { AdminRoutes } from './components/AdminRoutes'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
	const { isReady, viewportHeight, viewportStableHeight, webApp } =
		useTelegram()
	const [currentViewportHeight, setCurrentViewportHeight] = useState(
		viewportManager.getCurrentHeight()
	)

	// Используем новый viewport manager для лучшей поддержки iPhone
	useEffect(() => {
		const handleHeightChange = (height: number) => {
			setCurrentViewportHeight(height)

			// Дополнительные настройки для Telegram WebApp
			if (webApp && webApp.expand) {
				webApp.expand()
			}

			// Сбрасываем скролл
			window.scrollTo(0, 0)
		}

		// Подписываемся на изменения высоты viewport
		viewportManager.onHeightChange(handleHeightChange)

		// Принудительно обновляем viewport при инициализации
		viewportManager.forceUpdate()

		return () => {
			viewportManager.offHeightChange(handleHeightChange)
		}
	}, [webApp])

	if (!isReady) {
		return (
			<div
				style={{
					width: '100vw',
					height: '100vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background:
						'linear-gradient(180deg, #4A90E2 0%, #2E5BBA 50%, #1E3A8A 100%)',
					color: 'white',
					fontSize: '1.2rem',
					fontFamily: 'Inter, sans-serif',
				}}
			>
				Инициализация...
			</div>
		)
	}

	return (
		<div
			className='telegram-mini-app'
			style={{
				width: '100vw',
				height: `${
					currentViewportHeight || viewportStableHeight || viewportHeight
				}px`,
				maxHeight: `${
					currentViewportHeight || viewportStableHeight || viewportHeight
				}px`,
				minHeight: `${
					currentViewportHeight || viewportStableHeight || viewportHeight
				}px`,
				overflow: 'auto',
				fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
				position: 'fixed',
				top: 0,
				left: 0,
			}}
		>
			<ThemeProvider>
				<Routes>
					<Route path='/' element={<MyProfile />} />
					<Route path='/loading' element={<LoadingScreen />} />

					<Route path='/register' element={<GameRegister />} />
					<Route path='/venues' element={<Venues />} />
					<Route path='/match/:matchId' element={<MatchDetails />} />
					<Route path='/match/:matchId/players' element={<RegisteredList />} />
					<Route path='/profile' element={<MyProfile />} />
					<Route path='/my-registrations' element={<MyRegistrations />} />

					<Route path='/profile/stats' element={<PlayerStats />} />
					<Route path='/matches' element={<MatchHistory />} />
					<Route path='/faq' element={<FAQ />} />
					<Route
						path='/payment-instructions'
						element={<PaymentInstructions />}
					/>
					<Route
						path='/success/:registrationId'
						element={<SuccessfulRegister />}
					/>
					<Route path='/no-places/:matchId' element={<NoFreePlaces />} />
					<Route path='/cancel-success' element={<CancelNotification />} />
					<Route path='/cancel-registration' element={<CancelSuccess />} />
					<Route path='/booking-cancelled' element={<BookingCancelled />} />
					<Route path='/payment-error' element={<PaymentError />} />
					<Route path='/match/:matchId/result' element={<MatchResult />} />

					{/* Admin routes */}
					<Route path='/admin/*' element={<AdminRoutes />} />
				</Routes>
			</ThemeProvider>
		</div>
	)
}

export default App
