import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [react()],
	build: {
		rollupOptions: {
			output: {
				assetFileNames: assetInfo => {
					// Добавляем хеш к именам файлов для предотвращения кеширования
					if (assetInfo.name?.endsWith('.svg')) {
						return 'assets/[name]-[hash][extname]'
					}
					return 'assets/[name]-[hash][extname]'
				},
			},
		},
	},
	server: {
		port: 8001,
		host: '0.0.0.0',
		watch: { usePolling: true },
		proxy: {
			// Проксируем все API запросы к бэкенду
			'/public': {
				target: process.env.VITE_API_URL || 'http://localhost:8000',
				changeOrigin: true,
			},
			'/admin': {
				target: process.env.VITE_API_URL || 'http://localhost:8000',
				changeOrigin: true,
			},
			'/api': {
				target: process.env.VITE_API_URL || 'http://localhost:8000',
				changeOrigin: true,
			},
		},
	},
	preview: {
		port: 8001,
		host: '0.0.0.0',
	},
})
