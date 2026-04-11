import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/lunch-party/',
  plugins: [react()],
  server: {
    headers: {
      // Firebase signInWithPopup이 window.closed를 호출할 때
      // COOP 정책 때문에 콘솔 경고가 뜨는 것을 방지
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})
