import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'build',
        commonjsOptions: {
            transformMixedEsModules: true,
            include: [/node_modules/],
        },
    },
    optimizeDeps: {
        include: ['@tivio/sdk-react'],
    },
})
