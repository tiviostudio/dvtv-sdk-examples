import {
    PurchaseStatus,
    useOrganizationSubscriptions,
    useUser,
    type QerkoPaymentInfo,
} from '@tivio/sdk-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useTivioApi } from '../hooks/useTivioApi'
import { resolveTranslation } from '../utils/resolveTranslation'

const DEFAULT_APPLICATION_HANDLE = 'cobykdyby'

function getDefaultExpirationDate() {
    const expirationDate = new Date()
    expirationDate.setFullYear(expirationDate.getFullYear() + 1)
    return expirationDate.toISOString().slice(0, 10)
}

export function GiftSubscriptionExample() {
    const tivio = useTivioApi()
    const initialized = useRef(false)
    const { subscriptions } = useOrganizationSubscriptions()
    const { user, isSignedIn } = useUser()
    const giftSubscriptions = useMemo(
        () => subscriptions.filter((subscription) => subscription.isPurchasableAsVoucher),
        [subscriptions],
    )
    const [inputHandle, setInputHandle] = useState(DEFAULT_APPLICATION_HANDLE)
    const [activeHandle, setActiveHandle] = useState('')
    const [switchingApplication, setSwitchingApplication] = useState(false)
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

    const switchApplication = useCallback(async (applicationHandle: string) => {
        setSwitchingApplication(true)
        setError(null)
        setPaymentInfo(null)
        setShowIframe(false)
        setCopied(false)

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
            setSwitchingApplication(false)
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

            <div className="example-note">
                To gift access to a series, switch to the series TivioPro application first. The example then
                lists giftable subscriptions from that application. The voucher grants everything covered by
                the selected subscription, so the series should use its own subscription monetization.
            </div>

            <form
                className="example-actions"
                onSubmit={(event) => {
                    event.preventDefault()
                    void switchApplication(inputHandle.trim())
                }}
            >
                <label>
                    Series application urlHandle{' '}
                    <input
                        onChange={(event) => setInputHandle(event.target.value)}
                        placeholder={DEFAULT_APPLICATION_HANDLE}
                        value={inputHandle}
                    />
                </label>
                <button disabled={switchingApplication || !inputHandle.trim()} type="submit">
                    {switchingApplication ? 'Switching…' : 'Load giftable subscriptions'}
                </button>
            </form>

            {activeHandle && (
                <p>
                    Active application: <code>{activeHandle}</code>
                </p>
            )}

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
                        disabled={loading || switchingApplication}
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
                        disabled={loading || switchingApplication}
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
                    disabled={!isSignedIn || !activeHandle || !selectedId || !expirationDate || loading || switchingApplication}
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
