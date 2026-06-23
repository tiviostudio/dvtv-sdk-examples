import { useOrganizationSubscriptions, usePurchaseSubscription, PurchaseStatus } from '@tivio/sdk-react'
import { useEffect, useState } from 'react'

import { dvtvConfig } from '../config'

function SubscriptionPurchasePanel({ monetizationId }: { monetizationId: string }) {
    const {
        paymentInfo,
        paymentStatus,
        paymentError,
        isLoading,
    } = usePurchaseSubscription(monetizationId)

    return (
        <>
            <p>Payment status: {paymentStatus ?? '—'}</p>
            {isLoading && <p>Loading payment info…</p>}
            {paymentError && <p className="example-error">{paymentError}</p>}
            {paymentInfo && (
                <pre>{JSON.stringify(paymentInfo, null, 2)}</pre>
            )}
            {paymentStatus === PurchaseStatus.PAID && (
                <p>Subscription active.</p>
            )}
        </>
    )
}

export function SubscriptionsExample() {
    const { subscriptions } = useOrganizationSubscriptions()
    const [selectedId, setSelectedId] = useState('')

    useEffect(() => {
        if (!selectedId && subscriptions.length > 0) {
            setSelectedId(dvtvConfig.sampleMonetizationId || subscriptions[0].id)
        }
    }, [subscriptions, selectedId])

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

            {selectedId && <SubscriptionPurchasePanel monetizationId={selectedId} />}

            {subscriptions.length === 0 && (
                <p className="example-muted">No subscriptions returned yet.</p>
            )}
        </div>
    )
}
