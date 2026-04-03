import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'https://8866a595919b.ngrok-free.app/digitalinvitations',   // your backend
  //       changeOrigin: true,                // avoids CORS issues
  //       secure: true,                     // allow http or self-signed
  //     }
  //   }
  // }
})

