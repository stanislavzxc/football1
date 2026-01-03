import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useTelegram } from '../hooks/useTelegram'

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

	return (
		<div
			className={`telegram-mini-app-container ${className}`}
			style={{
						inset:0,

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
				background:
					'linear-gradient(180deg, #4A90E2 0%, #2E5BBA 50%, #1E3A8A 100%)',
				fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
				overflow: 'hidden',
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

			{/* Затемняющий слой */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					// background: 'rgba(25, 32, 40, 0.4)',
					zIndex: 1,
					margin: 0,
					padding: 0,
						inset:0,

				}}
			/>

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
						inset:0,

					}}
				>
					<div
						style={{
							fontFamily: 'EdoSZ, sans-serif',
							fontSize: '1.8rem',
							color: 'white',
							textShadow: '0 0 5px rgba(255,255,255,0.3)',
							transform: 'rotate(-2deg)',
							lineHeight: 1,
							margin: 0,
							padding: 0,
						inset:0,

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
					
					inset:'0px',
					top: title ? '120px' : '40px',
					left: 0,
					right: 0,
					bottom: 0,
					zIndex: 2,
					overflowY: 'auto',
					overflowX: 'hidden',
					padding: 0, // Убрал паддинги здесь
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
						padding: 0, // Убрал паддинги здесь
						margin: 0,
						inset:0,
					}}
				>
					{children}
				</div>
			</div>
		</div>
	)
}