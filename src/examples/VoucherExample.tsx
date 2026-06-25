import { useVoucher } from '@tivio/sdk-react'
import { useState } from 'react'

import { resolveTranslation } from '../utils/resolveTranslation'

export function VoucherExample() {
    const [code, setCode] = useState('')
    const [submittedCode, setSubmittedCode] = useState('')
    const { activate, voucher, error, activationSuccess } = useVoucher(submittedCode)

    const reason = (error as { details?: { reason?: string } } | null)?.details?.reason

    return (
        <div className="example">
            <h2>Voucher</h2>
            <p className="example-muted">
                <code>useVoucher</code> → <code>activate()</code> calls cloud function <code>activateVoucher</code>
            </p>

            <div className="example-actions">
                <input
                    value={code}
                    placeholder="Voucher code"
                    onChange={(e) => setCode(e.target.value)}
                />
                <button onClick={() => setSubmittedCode(code.trim().toUpperCase())}>
                    Load
                </button>
                <button
                    className="primary"
                    disabled={!voucher?.isInitialized || !submittedCode}
                    onClick={() => activate()}
                >
                    Activate
                </button>
            </div>

            <p>Code: {submittedCode || '—'}</p>
            <p>Initialized: {String(voucher?.isInitialized ?? false)}</p>
            <p>Success: {String(activationSuccess)}</p>
            {error && <p className="example-error">{error.message}{reason ? ` (${reason})` : ''}</p>}

            {voucher?.subscriptionsToShow?.length ? (
                <p>Subscriptions to show: {voucher.subscriptionsToShow.map((s) => resolveTranslation(s.name, s.id)).join(', ')}</p>
            ) : null}

            <pre>{JSON.stringify(voucher?.voucherInfo ?? null, null, 2)}</pre>
        </div>
    )
}
