import {
    PurchaseStatus,
    useOrganizationSubscriptions,
    useUser,
    type QerkoPaymentInfo,
} from '@tivio/sdk-react'
import { useEffect, useMemo, useState } from 'react'

import { useTivioApi } from '../hooks/useTivioApi'
import { resolveTranslation } from '../utils/resolveTranslation'

function getDefaultExpirationDate() {
    const expirationDate = new Date()
    expirationDate.setFullYear(expirationDate.getFullYear() + 1)
    return expirationDate.toISOString().slice(0, 10)
}

export function GiftSubscriptionExample() {
    const tivio = useTivioApi()
    const { subscriptions } = useOrganizationSubscriptions()
    const { user, isSignedIn } = useUser()
    const giftSubscriptions = useMemo(
        () => subscriptions.filter((subscription) => subscription.isPurchasableAsVoucher),
        [subscriptions],
    )
    const [selectedId, setSelectedId] = useState('')
    const [expirationDate, setExpirationDate] = useState(getDefaultExpirationDate)
    const [paymentInfo, setPaymentInfo] = useState<QerkoPaymentInfo | null>(null)
    const [showIframe, setShowIframe] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!giftSubscriptions.some(({ id }) => id === selectedId)) {
            setSelectedId(giftSubscriptions[0]?.id ?? '')
        }
    }, [giftSubscriptions, selectedId])

    useEffect(() => {
        setPaymentInfo(null)
        setShowIframe(false)
        setError(null)
        setCopied(false)
    }, [selectedId])

    const voucherPurchase = paymentInfo
        ? user?.purchasedVouchers?.find((purchase) => purchase.id === paymentInfo.purchaseId)
        : undefined
    const voucherCode = voucherPurchase?.voucherId
    const isPaid = voucherPurchase?.status === PurchaseStatus.PAID
    const checkoutUrl = paymentInfo?.webPaymentGatewayLink

    const createGiftPayment = async () => {
        setError(null)
        setLoading(true)
        setPaymentInfo(null)
        setShowIframe(false)
        setCopied(false)

        try {
            if (!isSignedIn || !user) {
                throw new Error('Sign in in the Login & registration example first.')
            }
            if (!selectedId) {
                throw new Error('Select a subscription which can be purchased as a gift.')
            }

            const redeemUntil = new Date(`${expirationDate}T23:59:59`)
            if (Number.isNaN(redeemUntil.getTime()) || redeemUntil <= new Date()) {
                throw new Error('Voucher redemption deadline must be in the future.')
            }
            if (!tivio?.purchaseSubscriptionWithQerko) {
                throw new Error('purchaseSubscriptionWithQerko is not available in the loaded SDK bundle.')
            }

            const result = await tivio.purchaseSubscriptionWithQerko(
                selectedId,
                { expirationDate: redeemUntil },
                user.email,
                1,
            ) as QerkoPaymentInfo

            setPaymentInfo(result)
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
            setLoading(false)
        }
    }

    const copyVoucherCode = async () => {
        if (!voucherCode) {
            return
        }

        try {
            await navigator.clipboard.writeText(voucherCode)
            setCopied(true)
        } catch {
            setError('The browser did not allow copying. Copy the voucher code manually.')
        }
    }

    return (
        <div className="example">
            <h2>Gift subscription</h2>
            <p className="example-muted">
                Buy a subscription as a voucher with <code>purchaseSubscriptionWithQerko</code>.
            </p>

            <div className="example-note">
                The selected date is the deadline for redeeming the voucher, not the end of the gifted
                subscription. The subscription duration starts when the recipient activates the code and is
                determined by the selected monetization.
            </div>

            <p>
                Signed in: <strong>{String(isSignedIn)}</strong>
            </p>

            {!isSignedIn && (
                <p className="example-error">
                    Sign in in the <strong>Login &amp; registration</strong> example before creating a gift.
                </p>
            )}

            <div className="gift-subscription-form">
                <label>
                    Gift subscription
                    <select
                        value={selectedId}
                        onChange={(event) => setSelectedId(event.target.value)}
                        disabled={loading}
                    >
                        <option value="">— select subscription —</option>
                        {giftSubscriptions.map((subscription) => (
                            <option key={subscription.id} value={subscription.id}>
                                {resolveTranslation(subscription.name, subscription.id)} ({subscription.id})
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Redeem voucher until
                    <input
                        type="date"
                        value={expirationDate}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(event) => setExpirationDate(event.target.value)}
                        disabled={loading}
                    />
                </label>
            </div>

            {giftSubscriptions.length === 0 && (
                <p className="example-error">
                    No subscription has <code>isPurchasableAsVoucher</code> enabled in Tivio Studio.
                </p>
            )}

            <div className="example-actions">
                <button
                    type="button"
                    className="primary"
                    disabled={!isSignedIn || !selectedId || !expirationDate || loading}
                    onClick={() => void createGiftPayment()}
                >
                    {loading ? 'Creating gift payment…' : 'Buy as a gift'}
                </button>
            </div>

            {error && <p className="example-error">{error}</p>}

            {paymentInfo && (
                <>
                    <h3>Gift payment</h3>
                    <p>
                        Purchase ID: <code>{paymentInfo.purchaseId}</code>
                    </p>
                    <p>
                        Status: <strong>{voucherPurchase?.status ?? 'waiting for PAID webhook'}</strong>
                    </p>
                </>
            )}

            {checkoutUrl && !isPaid && (
                <div className="example-actions">
                    <a
                        className="example-link-button primary"
                        href={checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Open checkout in new tab
                    </a>
                    <button type="button" onClick={() => setShowIframe((current) => !current)}>
                        {showIframe ? 'Close checkout iframe' : 'Open checkout in iframe'}
                    </button>
                </div>
            )}

            {showIframe && checkoutUrl && !isPaid && (
                <div className="qerko-checkout-shell">
                    <div className="qerko-checkout-header">
                        <strong>Qerko checkout</strong>
                        <button type="button" onClick={() => setShowIframe(false)}>Close</button>
                    </div>
                    <iframe
                        className="qerko-checkout-frame"
                        title="Qerko gift checkout"
                        src={checkoutUrl}
                        allow="payment *"
                    />
                </div>
            )}

            {isPaid && voucherCode && (
                <div className="gift-voucher-result">
                    <h3>Gift is ready</h3>
                    <p>Send this single-use voucher code to the recipient:</p>
                    <code>{voucherCode}</code>
                    <div className="example-actions">
                        <button type="button" onClick={() => void copyVoucherCode()}>
                            {copied ? 'Copied' : 'Copy voucher code'}
                        </button>
                        <a className="example-link-button" href="?example=voucher">
                            Open recipient activation example
                        </a>
                    </div>
                </div>
            )}

            {isPaid && !voucherCode && (
                <p className="example-note">
                    Payment is PAID. Waiting for Tivio to attach the generated voucher code to the purchase…
                </p>
            )}

            {paymentInfo && <pre>{JSON.stringify(paymentInfo, null, 2)}</pre>}
        </div>
    )
}
