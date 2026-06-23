import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

import { patchSdkReactSharedDeps } from './vite-plugin-patch-sdk-react'

export default defineConfig({
    plugins: [patchSdkReactSharedDeps(), react()],
    build: {
        outDir: 'build',
        commonjsOptions: {
            transformMixedEsModules: true,
            include: [/node_modules/],
        },
    },
    optimizeDeps: {
        include: [
            '@tivio/sdk-react',
            'i18next',
            'react-i18next',
            'react-spring',
        ],
    },
})
