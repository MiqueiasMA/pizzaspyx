import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Injeta a API KEY do ambiente da Vercel no código final
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    // Define process.env como um objeto vazio para evitar erros em bibliotecas legadas
    'process.env': {}
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});