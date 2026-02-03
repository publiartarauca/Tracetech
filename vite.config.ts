import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carga variables de entorno desde .env o el sistema (hosting)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: './', // Crucial para hostings compartidos (cpanel/hostinger)
    define: {
      // Polyfill para que el SDK de Gemini encuentre la API Key
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'esbuild',
      target: 'es2020' // Asegura compatibilidad con navegadores modernos
    }
  };
});