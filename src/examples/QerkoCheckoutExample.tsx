import { PurchaseStatus, useOrganizationSubscriptions, useUser, type QerkoPaymentInfo } from '@tivio/sdk-react'
import { useEffect, useRef, useState } from 'react'

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
    const [webTheme, setWebTheme] = useState('5caf209b-999e-4e55-a9da-7dc288f97e95')
    const [frameLoaded, setFrameLoaded] = useState(false)
    const requestRef = useRef(0)

    useEffect(() => {
        if (!selectedId && subscriptions.length > 0) {
            setSelectedId(dvtvConfig.sampleMonetizationId || subscriptions[0].id)
        }
    }, [subscriptions, selectedId])

    useEffect(() => {
        requestRef.current += 1
        setPaymentInfo(null)
        setPaymentStatus(null)
        setShowIframe(false)
        setError(null)
        setLoading(false)
        return () => {
            requestRef.current += 1
        }
    }, [selectedId, isSignedIn])

    useEffect(() => {
        if (!paymentInfo?.purchaseId) {
            return
        }

        const updateStatus = () => {
            const purchase = (user?.allPurchases ?? user?.purchases)?.find((item) => item.id === paymentInfo.purchaseId)
            const nextStatus = purchase?.status ?? 'WAITING'
            setPaymentStatus(nextStatus)

            if ([PurchaseStatus.PAID, PurchaseStatus.ABORTED, PurchaseStatus.ERROR, PurchaseStatus.EXPIRED].includes(nextStatus as PurchaseStatus)) {
                setShowIframe(false)
            }
        }

        updateStatus()
        const intervalId = window.setInterval(updateStatus, 1_000)
        return () => window.clearInterval(intervalId)
    }, [paymentInfo?.purchaseId, user])

    const createPayment = async () => {
        const requestId = ++requestRef.current
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

            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(webTheme)) {
                throw new Error('Enter a valid Qerko webTheme UUID.')
            }
            if (tivio.supportsQerkoWebTheme !== true) {
                throw new Error('This loaded SDK bundle does not support webTheme. Load the updated bundle before creating a payment.')
            }

            const result = (await tivio.purchaseSubscriptionWithQerko(
                selectedId,
                undefined,
                user.email,
                undefined, // quantity
                undefined, // gateway: use the offer's configured gateway
                { webTheme },
            )) as QerkoPaymentInfo

            if (requestRef.current !== requestId) return
            setPaymentInfo(result)
            setPaymentStatus('WAITING')
            setFrameLoaded(false)
            setShowIframe(true)
        } catch (cause) {
            if (requestRef.current !== requestId) return
            setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
            if (requestRef.current === requestId) setLoading(false)
        }
    }

    const checkoutUrl = (() => {
        if (!paymentInfo?.webPaymentGatewayLink) return null
        try {
            const url = new URL(paymentInfo.webPaymentGatewayLink)
            if (
                url.protocol !== 'https:' ||
                url.username ||
                url.password ||
                !(url.hostname === 'qerko.com' || url.hostname.endsWith('.qerko.com')) ||
                url.pathname !== '/api/v2/eshop/order/pay-by-payment-gateway'
            )
                return null
            url.searchParams.set('challengeWindowSize', '01')
            return url.toString()
        } catch {
            return null
        }
    })()

    return (
        <div className="example">
            <h2>Qerko checkout</h2>
            <p className="example-muted">
                Explicit payment creation with <code>purchaseSubscriptionWithQerko</code>, followed by the hosted checkout URL and purchase status.
            </p>

            <div className="example-note">
                The checkout opens below. Qerko confirms payment through Tivio's webhook; the frame closes when the matching purchase becomes PAID. You can also
                open it in a new tab.
            </div>

            <p>
                Signed in: <strong>{String(isSignedIn)}</strong>
            </p>
            <label>
                Qerko webTheme UUID
                <input
                    value={webTheme}
                    onChange={(event) => setWebTheme(event.target.value)}
                    disabled={loading || !!paymentInfo}
                    style={{ width: '100%', padding: '0.45rem' }}
                />
            </label>
            {tivio?.supportsQerkoWebTheme !== true && <p className="example-error">The loaded SDK bundle needs the webTheme update.</p>}

            {!isSignedIn && (
                <p className="example-error">
                    Sign in in the <strong>Login &amp; registration</strong> example before creating a payment.
                </p>
            )}

            <div className="example-actions">
                <select
                    value={selectedId}
                    onChange={(event) => setSelectedId(event.target.value)}
                    disabled={loading || !!paymentInfo}
                    style={{ flex: 1, padding: '0.45rem' }}
                >
                    <option value="">— select subscription —</option>
                    {subscriptions.map((subscription) => (
                        <option
                            key={subscription.id}
                            value={subscription.id}
                        >
                            {resolveTranslation(subscription.name, subscription.id)} ({subscription.id})
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    className="primary"
                    disabled={!isSignedIn || !selectedId || loading || !!paymentInfo || tivio?.supportsQerkoWebTheme !== true}
                    onClick={() => void createPayment()}
                >
                    {loading ? 'Creating payment…' : 'Create payment'}
                </button>
            </div>

            {error && <p className="example-error">{error}</p>}
            {paymentInfo && !checkoutUrl && <p className="example-error">This offer did not return a Qerko checkout URL.</p>}

            {paymentInfo && (
                <>
                    <h3>Payment</h3>
                    <p>
                        Purchase ID: <code>{paymentInfo.purchaseId}</code>
                    </p>
                    <p>
                        Status: <strong>{paymentStatus === 'WAITING' ? 'waiting for PAID webhook' : (paymentStatus ?? '—')}</strong>
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
                        {showIframe ? 'Close checkout' : 'Reopen checkout'}
                    </button>
                </div>
            )}

            {showIframe && checkoutUrl && paymentStatus !== PurchaseStatus.PAID && (
                <div className="qerko-checkout-shell">
                    <div className="qerko-checkout-header">
                        <strong>Qerko checkout</strong>
                        <button
                            type="button"
                            onClick={() => setShowIframe(false)}
                        >
                            Close
                        </button>
                    </div>
                    {!frameLoaded && <p role="status">Loading checkout…</p>}
                    <iframe
                        className="qerko-checkout-frame"
                        title="Qerko checkout"
                        src={checkoutUrl}
                        allow="payment *"
                        onLoad={() => setFrameLoaded(true)}
                    />
                </div>
            )}

            {paymentStatus === PurchaseStatus.PAID && (
                <p className="example-note">
                    Payment confirmed by Tivio as <strong>PAID</strong>. The iframe was closed automatically.
                </p>
            )}
            {paymentStatus && [PurchaseStatus.ABORTED, PurchaseStatus.ERROR, PurchaseStatus.EXPIRED].includes(paymentStatus as PurchaseStatus) && (
                <p className="example-error">Payment was not completed ({paymentStatus}).</p>
            )}
            {paymentInfo && !showIframe && (
                <button
                    type="button"
                    onClick={() => {
                        setPaymentInfo(null)
                        setPaymentStatus(null)
                        setShowIframe(false)
                    }}
                >
                    Start a new checkout
                </button>
            )}
        </div>
    )
}
