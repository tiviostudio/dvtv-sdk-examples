import react from '@vitejs/plugin-react-swc'
import { createReadStream } from 'node:fs'
import { defineConfig, loadEnv, type Plugin } from 'vite'

import { patchSdkReactSharedDeps } from './vite-plugin-patch-sdk-react'

export default defineConfig(({ mode }) => {
    const localBundlePath = loadEnv(mode, process.cwd(), '').TIVIO_LOCAL_BUNDLE_PATH
    const localBundle: Plugin = {
        name: 'local-tivio-bundle',
        configureServer(server) {
            if (!localBundlePath) return
            server.middlewares.use('/__tivio-local-bundle.js', (_request, response) => {
                response.setHeader('Content-Type', 'text/javascript')
                response.setHeader('Cache-Control', 'no-store')
                const stream = createReadStream(localBundlePath)
                stream.on('error', () => {
                    response.statusCode = 500
                    response.end('Local Tivio bundle is unavailable.')
                })
                stream.pipe(response)
            })
        },
    }
    return {
        plugins: [patchSdkReactSharedDeps(), localBundle, react()],
        build: {
            outDir: 'build',
            commonjsOptions: {
                transformMixedEsModules: true,
                include: [/node_modules/],
            },
        },
        optimizeDeps: {
            include: ['@tivio/sdk-react', 'i18next', 'react-i18next', 'react-spring'],
        },
    }
})
