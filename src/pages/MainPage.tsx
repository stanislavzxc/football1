import React, { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { TelegramButton } from '../components/TelegramButton'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../services/api'

const MainPage: React.FC = () => {
	const { isReady, user, isInTelegram, userId } = useTelegram()
	const [isAdmin, setIsAdmin] = useState(false)
	const [checkingAdmin, setCheckingAdmin] = useState(true)

	useEffect(() => {
		// Создаем или получаем пользователя при загрузке
		const initUser = async () => {
			if (isReady && isInTelegram && user) {
				try {
					await api.createOrGetUser()
				} catch (error) {
					console.error('Error creating/getting user:', error)
				}
			}
		}

		initUser()
	}, [isReady, isInTelegram, user])

	useEffect(() => {
		// Проверяем, является ли пользователь администратором
		const checkAdmin = async () => {
			if (isReady && userId) {
				try {
					setCheckingAdmin(true)
					const result = await api.checkAdminStatus(userId)
					setIsAdmin(result.is_admin || false)
				} catch (error) {
					console.error('Error checking admin status:', error)
					setIsAdmin(false)
				} finally {
					setCheckingAdmin(false)
				}
			} else {
				setCheckingAdmin(false)
			}
		}

		checkAdmin()
	}, [isReady, userId])

	return (
		<Layout isMainPage={true}>
			{/* Кнопки навигации */}
			<div
				style={{
					position: 'absolute',
					top: '28%',
					left: '50%',
					transform: 'translateX(-50%)',
					display: 'flex',
					flexDirection: 'column',
					gap: '12px',
					zIndex: 2,
					width: '85%',
					maxWidth: '320px',
					alignItems: 'center',
				}}
			>
				<TelegramButton to='/register'>Записаться на игру</TelegramButton>

				<TelegramButton to='/profile'>Мой профиль</TelegramButton>

				<TelegramButton to='/matches'>История матчей</TelegramButton>

				<TelegramButton to='/faq' style={{ fontSize: '0.9rem' }}>
					FAQ и задать вопрос
				</TelegramButton>
			</div>

			{/* Отдельная кнопка админки пониже - показываем только если пользователь админ */}
			{isAdmin && !checkingAdmin && (
				<div
					style={{
						position: 'absolute',
						top: '75%',
						left: '50%',
						transform: 'translateX(-50%)',
						zIndex: 2,
						width: '85%',
						maxWidth: '320px',
						display: 'flex',
						justifyContent: 'center',
					}}
				>
					<TelegramButton to='/admin' variant='admin'>
						🔧 Админ панель
					</TelegramButton>
				</div>
			)}

			{/* Фоновые декоративные элементы - упрощенные */}
			{/* <div
        style={{
          position: "absolute",
          top: "68%",
          right: "10%",
          transform: "rotate(-15deg)",
          opacity: 0.3,
          fontFamily: "EdoSZ, Inter, sans-serif",
          fontSize: "1rem",
          color: "white",
          zIndex: 1,
          pointerEvents: "none",
          textShadow: "0 0 5px rgba(255,255,255,0.3)",
        }}
      >
        зови друзей
      </div> */}

			{/* <div
				style={{
					position: 'absolute',
					bottom: '15%',
					left: '15%',
					transform: 'rotate(10deg)',
					opacity: 0.3,
					fontFamily: 'EdoSZ, Inter, sans-serif',
					fontSize: '0.8rem',
					color: 'white',
					zIndex: 1,
					pointerEvents: 'none',
					textShadow: '0 0 5px rgba(255,255,255,0.3)',
				}}
			>
				goal
			</div> */}

			{/* <div
				style={{
					position: 'absolute',
					top: '70%',
					left: '8%',
					transform: 'rotate(-12deg)',
					opacity: 0.3,
					fontFamily: 'EdoSZ, Inter, sans-serif',
					fontSize: '1.2rem',
					color: 'white',
					zIndex: 1,
					pointerEvents: 'none',
					textShadow: '0 0 5px rgba(255,255,255,0.3)',
				}}
			>
				FÚTBOL
			</div> */}
		</Layout>
	)
}

export default MainPage
