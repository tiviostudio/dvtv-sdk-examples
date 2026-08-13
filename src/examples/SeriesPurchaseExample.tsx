import {
    PurchaseStatus,
    useOrganizationSubscriptions,
    useUser,
    type PurchasableMonetization,
    type QerkoPaymentInfo,
} from '@tivio/sdk-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useTivioApi } from '../hooks/useTivioApi'
import { resolveTranslation } from '../utils/resolveTranslation'

const DEFAULT_APPLICATION_HANDLE = 'cobykdyby'

function formatPrice(subscription: PurchasableMonetization) {
    const price = subscription.price ?? subscription.originalPrice
    const currency = subscription.currency ?? 'CZK'
    const frequency = subscription.frequency?.title

    return `${price} ${currency}${frequency ? ` / ${frequency}` : ''}`
}

function SeriesPurchaseDialog({ onClose }: { onClose: () => void }) {
    const tivio = useTivioApi()
    const { subscriptions } = useOrganizationSubscriptions(true)
    const { user, isSignedIn } = useUser()
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [paymentInfo, setPaymentInfo] = useState<QerkoPaymentInfo | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const visibleSubscriptions = subscriptions.filter(
        (subscription) => !subscription.subscriptionIsHidden && !subscription.purchaseDisabled,
    )
    const paymentStatus = paymentInfo?.purchaseId
        ? user?.purchases?.find((purchase) => purchase.id === paymentInfo.purchaseId)?.status
        : undefined

    const createPayment = async (subscription: PurchasableMonetization) => {
        setSelectedId(subscription.id)
        setPaymentInfo(null)
        setError(null)
        setLoading(true)

        try {
            if (!isSignedIn || !user) {
                throw new Error('Sign in in the Login & registration example first.')
            }
            if (subscription.cta) {
                throw new Error('This offer uses a custom CTA and cannot be purchased directly.')
            }
            if (!tivio?.purchaseSubscriptionWithQerko) {
                throw new Error('purchaseSubscriptionWithQerko is not available in the loaded SDK bundle.')
            }

            const result = await tivio.purchaseSubscriptionWithQerko(
                subscription.id,
                undefined,
                user.email,
            ) as QerkoPaymentInfo

            setPaymentInfo(result)
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="series-purchase-backdrop" role="presentation">
            <section
                aria-labelledby="series-purchase-title"
                aria-modal="true"
                className="series-purchase-dialog"
                role="dialog"
            >
                <div className="series-purchase-header">
                    <div>
                        <h2 id="series-purchase-title">Choose access to this series</h2>
                        <p>Offers are loaded from the active TivioPro application.</p>
                    </div>
                    <button type="button" onClick={onClose}>Close</button>
                </div>

                {!isSignedIn && (
                    <p className="example-error">
                        Sign in through <strong>Login &amp; registration</strong> before starting payment.
                    </p>
                )}

                <div className="series-purchase-options">
                    {visibleSubscriptions.map((subscription) => (
                        <article className="series-purchase-option" key={subscription.id}>
                            <h3>{resolveTranslation(subscription.name, subscription.id)}</h3>
                            {subscription.description && <p>{resolveTranslation(subscription.description)}</p>}
                            <strong>{formatPrice(subscription)}</strong>
                            <button
                                className="primary"
                                disabled={!isSignedIn || loading || Boolean(subscription.cta)}
                                onClick={() => void createPayment(subscription)}
                                type="button"
                            >
                                {loading && selectedId === subscription.id ? 'Creating payment…' : 'Buy'}
                            </button>
                        </article>
                    ))}
                </div>

                {visibleSubscriptions.length === 0 && (
                    <p className="example-muted">No purchasable subscriptions found for this series.</p>
                )}
                {error && <p className="example-error">{error}</p>}

                {paymentInfo?.webPaymentGatewayLink && paymentStatus !== PurchaseStatus.PAID && (
                    <div className="example-note">
                        <p>Payment created. Purchase ID: <code>{paymentInfo.purchaseId}</code></p>
                        <a
                            className="example-link-button primary"
                            href={paymentInfo.webPaymentGatewayLink}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Continue to payment
                        </a>
                    </div>
                )}

                {paymentStatus === PurchaseStatus.PAID && (
                    <p className="example-note">Payment confirmed as <strong>PAID</strong>.</p>
                )}
            </section>
        </div>
    )
}

export function SeriesPurchaseExample() {
    const tivio = useTivioApi()
    const initialized = useRef(false)
    const [inputHandle, setInputHandle] = useState(DEFAULT_APPLICATION_HANDLE)
    const [activeHandle, setActiveHandle] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const switchApplication = useCallback(async (applicationHandle: string) => {
        setLoading(true)
        setError(null)
        setDialogOpen(false)

        try {
            if (!tivio?.organization?.switchApplicationByHandle) {
                throw new Error('tivio.organization.switchApplicationByHandle is not available.')
            }

            await tivio.organization.switchApplicationByHandle(applicationHandle)
            setActiveHandle(applicationHandle)
        } catch (cause) {
            setActiveHandle('')
            setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
            setLoading(false)
        }
    }, [tivio])

    useEffect(() => {
        if (!tivio || initialized.current) return

        initialized.current = true
        void switchApplication(DEFAULT_APPLICATION_HANDLE)
    }, [switchApplication, tivio])

    useEffect(() => () => {
        const resetToDefault = tivio?.organization?.switchApplicationByHandle?.()
        resetToDefault?.catch?.(() => undefined)
    }, [tivio])

    return (
        <div className="example">
            <h2>Standalone series purchase prompt</h2>
            <p className="example-muted">
                A standalone purchase page or modal built with the public SDK APIs. The WebPlayer paywall itself
                is player-owned and is not exposed as a standalone component.
            </p>

            <div className="example-note">
                Switch to the series application first, then load its offers with{' '}
                <code>useOrganizationSubscriptions(true)</code>. Create the selected purchase with{' '}
                <code>purchaseSubscriptionWithQerko</code> and open the returned{' '}
                <code>webPaymentGatewayLink</code>.
            </div>

            <form
                className="example-actions"
                onSubmit={(event) => {
                    event.preventDefault()
                    void switchApplication(inputHandle.trim())
                }}
            >
                <label>
                    application urlHandle{' '}
                    <input
                        onChange={(event) => setInputHandle(event.target.value)}
                        placeholder={DEFAULT_APPLICATION_HANDLE}
                        value={inputHandle}
                    />
                </label>
                <button disabled={loading || !inputHandle.trim()} type="submit">
                    {loading ? 'Switching…' : 'Load series offers'}
                </button>
            </form>

            {error && <p className="example-error">{error}</p>}
            {activeHandle && (
                <>
                    <p>Active application: <code>{activeHandle}</code></p>
                    <button className="primary" onClick={() => setDialogOpen(true)} type="button">
                        Open purchase prompt
                    </button>
                </>
            )}

            {dialogOpen && <SeriesPurchaseDialog onClose={() => setDialogOpen(false)} />}
        </div>
    )
}
