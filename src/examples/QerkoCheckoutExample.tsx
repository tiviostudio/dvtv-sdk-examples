import {
    PurchaseStatus,
    useOrganizationSubscriptions,
    useUser,
    type QerkoPaymentInfo,
} from '@tivio/sdk-react'
import { useEffect, useState } from 'react'

import { dvtvConfig } from '../config'
import { useTivioApi } from '../hooks/useTivioApi'
import { resolveTranslation } from '../utils/resolveTranslation'

type ObservedStatus = PurchaseStatus | 'WAITING' | null

export function QerkoCheckoutExample() {
    const tivio = useTivioApi()
    const { subscriptions } = useOrganizationSubscriptions()
    const { user, isSignedIn } = useUser()
    const [selectedId, setSelectedId] = useState('')
    const [paymentInfo, setPaymentInfo] = useState<QerkoPaymentInfo | null>(null)
    const [paymentStatus, setPaymentStatus] = useState<ObservedStatus>(null)
    const [showIframe, setShowIframe] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!selectedId && subscriptions.length > 0) {
            setSelectedId(dvtvConfig.sampleMonetizationId || subscriptions[0].id)
        }
    }, [subscriptions, selectedId])

    useEffect(() => {
        setPaymentInfo(null)
        setPaymentStatus(null)
        setShowIframe(false)
        setError(null)
    }, [selectedId])

    useEffect(() => {
        if (!paymentInfo?.purchaseId) {
            return
        }

        const updateStatus = () => {
            const purchase = user?.purchases?.find((item) => item.id === paymentInfo.purchaseId)
            const nextStatus = purchase?.status ?? 'WAITING'
            setPaymentStatus(nextStatus)

            if (nextStatus === PurchaseStatus.PAID) {
                setShowIframe(false)
            }
        }

        updateStatus()
        const intervalId = window.setInterval(updateStatus, 1_000)
        return () => window.clearInterval(intervalId)
    }, [paymentInfo?.purchaseId, user])

    const createPayment = async () => {
        setError(null)
        setLoading(true)
        setPaymentInfo(null)
        setPaymentStatus(null)
        setShowIframe(false)

        try {
            if (!isSignedIn || !user) {
                throw new Error('Sign in in the Login & registration example first.')
            }
            if (!selectedId) {
                throw new Error('Select a subscription.')
            }
            if (!tivio?.purchaseSubscriptionWithQerko) {
                throw new Error('purchaseSubscriptionWithQerko is not available in the loaded SDK bundle.')
            }

            const result = await tivio.purchaseSubscriptionWithQerko(
                selectedId,
                undefined,
                user.email,
            ) as QerkoPaymentInfo

            setPaymentInfo(result)
            setPaymentStatus('WAITING')
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
            setLoading(false)
        }
    }

    const checkoutUrl = paymentInfo?.webPaymentGatewayLink

    return (
        <div className="example">
            <h2>Qerko checkout</h2>
            <p className="example-muted">
                Explicit payment creation with <code>purchaseSubscriptionWithQerko</code>, followed by the
                hosted checkout URL and purchase status.
            </p>

            <div className="example-note">
                The supported integration opens <code>webPaymentGatewayLink</code> in a new tab.
                The iframe below is deliberately marked experimental until Qerko confirms and we test
                cross-origin 3DS, Apple Pay and Google Pay behavior.
            </div>

            <p>
                Signed in: <strong>{String(isSignedIn)}</strong>
            </p>

            {!isSignedIn && (
                <p className="example-error">
                    Sign in in the <strong>Login &amp; registration</strong> example before creating a payment.
                </p>
            )}

            <div className="example-actions">
                <select
                    value={selectedId}
                    onChange={(event) => setSelectedId(event.target.value)}
                    disabled={loading}
                    style={{ flex: 1, padding: '0.45rem' }}
                >
                    <option value="">— select subscription —</option>
                    {subscriptions.map((subscription) => (
                        <option key={subscription.id} value={subscription.id}>
                            {resolveTranslation(subscription.name, subscription.id)} ({subscription.id})
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    className="primary"
                    disabled={!isSignedIn || !selectedId || loading}
                    onClick={() => void createPayment()}
                >
                    {loading ? 'Creating payment…' : 'Create payment'}
                </button>
            </div>

            {error && <p className="example-error">{error}</p>}

            {paymentInfo && (
                <>
                    <h3>Payment</h3>
                    <p>
                        Purchase ID: <code>{paymentInfo.purchaseId}</code>
                    </p>
                    <p>
                        Status:{' '}
                        <strong>
                            {paymentStatus === 'WAITING' ? 'waiting for PAID webhook' : paymentStatus ?? '—'}
                        </strong>
                    </p>
                    <pre>{JSON.stringify(paymentInfo, null, 2)}</pre>
                </>
            )}

            {checkoutUrl && paymentStatus !== PurchaseStatus.PAID && (
                <div className="example-actions">
                    <a
                        className="example-link-button primary"
                        href={checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Open checkout in new tab
                    </a>
                    <button
                        type="button"
                        onClick={() => setShowIframe((current) => !current)}
                    >
                        {showIframe ? 'Close experimental iframe' : 'Try experimental iframe'}
                    </button>
                </div>
            )}

            {showIframe && checkoutUrl && paymentStatus !== PurchaseStatus.PAID && (
                <div className="qerko-checkout-shell">
                    <div className="qerko-checkout-header">
                        <strong>Experimental cross-origin iframe</strong>
                        <button type="button" onClick={() => setShowIframe(false)}>Close</button>
                    </div>
                    <iframe
                        className="qerko-checkout-frame"
                        title="Qerko checkout"
                        src={checkoutUrl}
                        allow="payment *"
                    />
                </div>
            )}

            {paymentStatus === PurchaseStatus.PAID && (
                <p className="example-note">
                    Payment confirmed by Tivio as <strong>PAID</strong>. The iframe was closed automatically.
                </p>
            )}
        </div>
    )
}
