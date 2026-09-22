import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // O site é servido em https://tldevstudio.github.io/TLGestao/ (nome
  // do repositório como subpasta) — sem isso, os arquivos gerados no
  // build apontam pra raiz do domínio errada e a página fica em branco.
  base: '/TLGestao/',
  plugins: [react()],
  test: {
    // Testes de lógica pura (services/*Calculations.js) — não precisam
    // de DOM, então o ambiente "node" é suficiente e mais rápido.
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
