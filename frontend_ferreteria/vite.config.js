import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Permite conexiones de tu red local (celular)
    port: 5173,
    proxy: {
      // Redirige al backend solo las peticiones que empiecen con /productos, /login, /usuarios, etc.
      // O puedes apuntar a rutas específicas de tu API de FastAPI:
      '/productos': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/login': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/usuarios': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      // (O si tu backend usa algún otro prefijo, lo agregas aquí)
    }
  }
})