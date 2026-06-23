import { LangCode, TivioProvider } from '@tivio/sdk-react'
import { createRoot } from 'react-dom/client'

import App from './App'
import { getTivioSecret } from './config'
import './index.css'

import type { Config } from '@tivio/sdk-react'

const secret = getTivioSecret()

const tivioConf: Config | null = secret
    ? {
        secret,
        verbose: true,
        deviceCapabilities: [],
        currency: 'CZK',
        language: LangCode.CS,
        cmp: 'none',
    }
    : null

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
    tivioConf
        ? (
            <TivioProvider conf={tivioConf}>
                <App />
            </TivioProvider>
        )
        : (
            <div style={{ padding: 24 }}>
                <h1>Missing Tivio secret</h1>
                <p>
                    Set <code>VITE_TIVIO_SECRET</code> in <code>.env</code> or open{' '}
                    <code>?secret=&lt;tivioClientSecret&gt;</code> in the URL.
                </p>
            </div>
        ),
)
