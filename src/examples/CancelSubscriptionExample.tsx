import { useCancelSubscription, useOrganizationSubscriptions, useUser, PurchaseStatus } from '@tivio/sdk-react'
import { useMemo, useState } from 'react'

import { dvtvConfig } from '../config'
import { resolveTranslation } from '../utils/resolveTranslation'

export function CancelSubscriptionExample() {
    const { user } = useUser()
    const { subscriptions } = useOrganizationSubscriptions()
    const [selectedId, setSelectedId] = useState(dvtvConfig.sampleMonetizationId || '')

    const activePurchase = useMemo(
        () => user?.purchasedSubscriptions.find(
            (p) => p.monetizationId === selectedId
                && p.status !== PurchaseStatus.CANCELLING
                && !p.isVoucherActivation,
        ),
        [user?.purchasedSubscriptions, selectedId],
    )

    const cancellingPurchase = useMemo(
        () => user?.purchasedSubscriptions.find(
            (p) => p.monetizationId === selectedId && p.status === PurchaseStatus.CANCELLING,
        ),
        [user?.purchasedSubscriptions, selectedId],
    )

    const { cancelSubscription, cancellationInfo, error } = useCancelSubscription(selectedId)

    const purchasableIds = subscriptions.map((s) => s.id)

    return (
        <div className="example">
            <h2>Cancel subscription</h2>
            <p className="example-muted">
                <code>useCancelSubscription(monetizationId)</code> — stops renewal, access until <code>expirationDate</code>
            </p>

            <div className="example-actions">
                <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    style={{ flex: 1, padding: '0.45rem' }}
                >
                    <option value="">— select monetization —</option>
                    {purchasableIds.map((id) => {
                        const sub = subscriptions.find((s) => s.id === id)
                        return (
                            <option key={id} value={id}>{resolveTranslation(sub?.name, id)}</option>
                        )
                    })}
                </select>
                <button
                    className="primary"
                    disabled={!selectedId || !activePurchase}
                    onClick={() => cancelSubscription()}
                >
                    Cancel subscription
                </button>
            </div>

            {activePurchase && (
                <p>
                    Active until{' '}
                    {activePurchase.expirationDate?.toLocaleDateString('cs-CZ') ?? '—'}
                </p>
            )}

            {cancellingPurchase && (
                <p>
                    Cancellation pending — access until{' '}
                    {cancellingPurchase.expirationDate?.toLocaleDateString('cs-CZ') ?? '—'}, will not renew.
                </p>
            )}

            {error && <p className="example-error">{error}</p>}
            {cancellationInfo && (
                <pre>{JSON.stringify(cancellationInfo, null, 2)}</pre>
            )}

            {!selectedId && (
                <p className="example-muted">Select a monetization id (or set sampleMonetizationId in config).</p>
            )}
        </div>
    )
}
