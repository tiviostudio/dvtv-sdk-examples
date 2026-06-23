import './tivioSharedExtras'

import { LangCode, TivioProvider, useTivioData } from '@tivio/sdk-react'
import { createRoot } from 'react-dom/client'
import type { ReactNode } from 'react'

import App from './App'
import { getTivioApplicationId, getTivioSecret } from './config'
import './index.css'

import type { Config } from '@tivio/sdk-react'

const secret = getTivioSecret()
const applicationId = getTivioApplicationId()

function MissingConfig() {
    return (
        <div style={{ padding: 24, maxWidth: 560 }}>
            <h1>Configuration required</h1>
            <p>
                Copy <code>.env.example</code> to <code>.env</code> and set:
            </p>
            <ul>
                <li>
                    <code>VITE_TIVIO_SECRET</code> — web SDK secret from Tivio
                </li>
                <li>
                    <code>VITE_TIVIO_APPLICATION_ID</code> — application id for the same organization
                </li>
            </ul>
            <p style={{ marginTop: 16 }}>
                Both values must belong to the same organization. Tivio will provide them separately.
            </p>
        </div>
    )
}

function SdkReadyGate({ children }: { children: ReactNode }) {
    const bundle = useTivioData()

    if (bundle.state === 'loading') {
        return (
            <div style={{ padding: 24 }}>
                <p>Loading Tivio SDK…</p>
            </div>
        )
    }

    if (bundle.state === 'error') {
        const isApplicationNotFound = bundle.error?.includes('Application not found')

        return (
            <div style={{ padding: 24, maxWidth: 560 }}>
                <h1>SDK failed to load</h1>
                <p style={{ color: 'crimson' }}>{bundle.error}</p>
                {isApplicationNotFound && (
                    <p style={{ marginTop: 16 }}>
                        Check that <code>VITE_TIVIO_SECRET</code> and{' '}
                        <code>VITE_TIVIO_APPLICATION_ID</code> in <code>.env</code> belong to the same
                        organization.
                    </p>
                )}
            </div>
        )
    }

    return children
}

const container = document.getElementById('root')
const root = createRoot(container!)

if (!secret || !applicationId) {
    root.render(<MissingConfig />)
} else {
    const tivioConf: Config = {
        secret,
        applicationId,
        verbose: true,
        deviceCapabilities: [],
        currency: 'CZK',
        language: LangCode.CS,
        cmp: 'none',
    }

    root.render(
        <TivioProvider conf={tivioConf}>
            <SdkReadyGate>
                <App />
            </SdkReadyGate>
        </TivioProvider>,
    )
}
