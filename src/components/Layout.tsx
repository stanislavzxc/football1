import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useTelegram } from '../hooks/useTelegram'
import { useTheme } from '../contexts/ThemeContext' // Добавляем импорт контекста темы

interface LayoutProps {
	children: React.ReactNode
	title?: string
	showBackButton?: boolean
	onBackClick?: () => void
	className?: string
	isMainPage?: boolean
}

export function Layout({
	children,
	title,
	showBackButton = false,
	onBackClick,
	className = '',
	isMainPage = false,
}: LayoutProps) {
	const { webApp, viewportHeight, viewportStableHeight, isInTelegram } =
		useTelegram()
	const { isDarkMode } = useTheme() // Получаем состояние темы
	const location = useLocation()
	const navigate = useNavigate()
	const handleBackClick = useCallback(() => {
		if (onBackClick) {
			onBackClick()
		} else {
			navigate(-1)
		}
	}, [onBackClick, navigate])

	useEffect(() => {
		if (isInTelegram) {
			if (showBackButton) {
				webApp.showBackButton(handleBackClick)
			} else {
				webApp.hideBackButton()
			}
		}

		return () => {
			if (isInTelegram) {
				webApp.hideBackButton()
			}
		}
	}, [showBackButton, handleBackClick, webApp, isInTelegram])

	// Используем стабильную высоту viewport для лучшей производительности
	const containerHeight = isInTelegram ? viewportStableHeight : viewportHeight

	// Определяем цвет фона в зависимости от темы
	const backgroundColor = isDarkMode 
		? 'rgb(26 31 37 / var(--tw-bg-opacity, 1))' 
		: '#FFFFFF'
	
	// Определяем цвет текста в зависимости от темы
	const textColor = isDarkMode ? 'white' : '#1A1F25'

	return (
		<div
			className={`telegram-mini-app-container ${className}`}
			style={{
				overflow: 'auto',
				width: '100vw',
				height: `${containerHeight}px`,
				maxHeight: `${containerHeight}px`,
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				margin: 0,
				padding: 0,
				background: backgroundColor, // Используем переменную фона
				fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
				touchAction: 'pan-y',
				overscrollBehavior: 'none',
				boxSizing: 'border-box',
			}}
		>
			{/* Фоновое изображение - оптимизировано */}
			{/* <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/Фон.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3,
          zIndex: 0
        }}
      /> */}

			{/* Затемняющий слой - теперь с проверкой темы */}
			{isDarkMode && (
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						// background: 'rgba(25, 32, 40, 0.4)', // Можно убрать или оставить для темной темы
						zIndex: 1,
						margin: 0,
						padding: 0,
						inset: 0,
					}}
				/>
			)}

			{/* Лого - яркое на главной, затемненное на остальных */}
			{/* <div
				style={{
					position: 'absolute',
					top: '2%',
					left: '50%',
					transform: 'translateX(-50%)',
					textAlign: 'center',
					zIndex: isMainPage ? 2 : 1,
					opacity: isMainPage ? 1 : 0.15,
					pointerEvents: 'none',
				}}
			>
				<img
					src={getLogoUrl()}
					alt='Football Ivanovo Logo'
					style={{
						width: isMainPage ? '160px' : '180px',
						height: 'auto',
						filter: isMainPage ? 'none' : 'grayscale(70%) opacity(0.5)',
						transform: isMainPage ? 'none' : 'rotate(-8deg)',
					}}
				/>
			</div> */}

			{/* Заголовок страницы */}
			{title && (
				<div
					style={{
						position: 'absolute',
						top: '60px',
						left: '50%',
						transform: 'translateX(-50%)',
						textAlign: 'center',
						zIndex: 3,
						width: '90%',
						margin: 0,
						padding: 0,
						inset: 0,
					}}
				>
					<div
						style={{
							fontFamily: 'EdoSZ, sans-serif',
							fontSize: '1.8rem',
							color: textColor, // Используем переменную цвета текста
							textShadow: isDarkMode ? '0 0 5px rgba(255,255,255,0.3)' : '0 0 5px rgba(0,0,0,0.1)', // Разные тени для темной и светлой темы
							transform: 'rotate(-2deg)',
							lineHeight: 1,
							margin: 0,
							padding: 0,
							inset: 0,
						}}
					>
						{title}
					</div>
				</div>
			)}

			{/* Контент - с прокруткой и защитой от выхода за границы */}
			<div
				style={{
					position: 'absolute',
					inset: '0px',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					zIndex: 2,
					overflowY: 'auto',
					overflowX: 'hidden',
					padding: 0,
					margin: 0,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					WebkitOverflowScrolling: 'touch',
					touchAction: 'pan-y',
					overscrollBehavior: 'contain',
					maxWidth: '100vw',
					boxSizing: 'border-box',
					scrollBehavior: 'smooth',
					backgroundColor: 'transparent', // Делаем фон прозрачным
				}}
				onScroll={e => {
					// Предотвращаем горизонтальную прокрутку
					const target = e.target as HTMLElement
					if (target.scrollLeft !== 0) {
						target.scrollLeft = 0
					}
				}}
			>
				<div
					style={{
						width: '100%',
						maxWidth: '100%',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						minHeight: 'fit-content',
						boxSizing: 'border-box',
						padding: 0,
						margin: 0,
						inset: 0,
						backgroundColor: 'transparent', // Делаем фон прозрачным
					}}
				>
					{children}
				</div>
			</div>
		</div>
	)
}