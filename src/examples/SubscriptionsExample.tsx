import { useOrganizationSubscriptions, usePurchaseSubscription, PurchaseStatus } from '@tivio/sdk-react'
import { useState } from 'react'

import { dvtvConfig } from '../config'

export function SubscriptionsExample() {
    const { subscriptions } = useOrganizationSubscriptions()
    const [selectedId, setSelectedId] = useState(dvtvConfig.sampleMonetizationId || subscriptions[0]?.id || '')

    const {
        paymentInfo,
        paymentStatus,
        paymentError,
        isLoading,
    } = usePurchaseSubscription(selectedId)

    return (
        <div className="example">
            <h2>Subscriptions</h2>
            <p className="example-muted">
                <code>useOrganizationSubscriptions</code>, <code>usePurchaseSubscription</code>
            </p>

            <div className="example-actions">
                <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    style={{ flex: 1, padding: '0.45rem' }}
                >
                    <option value="">— select subscription —</option>
                    {subscriptions.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.id})</option>
                    ))}
                </select>
            </div>

            {selectedId && (
                <>
                    <p>Payment status: {paymentStatus ?? '—'}</p>
                    {isLoading && <p>Loading payment info…</p>}
                    {paymentError && <p className="example-error">{paymentError}</p>}
                    {paymentInfo && (
                        <pre>{JSON.stringify(paymentInfo, null, 2)}</pre>
                    )}
                    {paymentStatus === PurchaseStatus.PAID && (
                        <p>Subscription active — use Qerko payment flow in your app UI.</p>
                    )}
                </>
            )}

            {subscriptions.length === 0 && (
                <p className="example-muted">No subscriptions returned. Is SDK initialized?</p>
            )}
        </div>
    )
}
