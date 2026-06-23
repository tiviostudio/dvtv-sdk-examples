import './tivioSharedExtras'

import { LangCode, TivioProvider, useTivioData } from '@tivio/sdk-react'
import { createRoot } from 'react-dom/client'
import type { ReactNode } from 'react'

import App from './App'
import { getSecretApplicationIdHint, getTivioApplicationId, getTivioSecret } from './config'
import './index.css'

import type { Config } from '@tivio/sdk-react'

const secret = getTivioSecret()
const applicationId = getTivioApplicationId(secret)

const tivioConf: Config = {
    secret,
    ...(applicationId ? { applicationId } : {}),
    verbose: true,
    deviceCapabilities: [],
    currency: 'CZK',
    language: LangCode.CS,
    cmp: 'none',
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
            <div style={{ padding: 24 }}>
                <h1>SDK failed to load</h1>
                <p style={{ color: 'crimson' }}>{bundle.error}</p>
                {isApplicationNotFound && (
                    <p style={{ marginTop: 16 }}>
                        Secret <code>{secret}</code> and <code>applicationId</code> must belong to the same
                        organization. {getSecretApplicationIdHint(secret)}
                    </p>
                )}
            </div>
        )
    }

    return children
}

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
    <TivioProvider conf={tivioConf}>
        <SdkReadyGate>
            <App />
        </SdkReadyGate>
    </TivioProvider>,
)
