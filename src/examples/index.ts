export { LoginExample } from './LoginExample'
export { SeriesListExample } from './SeriesListExample'
export { SeriesDetailExample } from './SeriesDetailExample'
export { SeriesPurchaseExample } from './SeriesPurchaseExample'
export { ArticlesListExample } from './ArticlesListExample'
export { ArticleDetailExample } from './ArticleDetailExample'
export { SubscriptionsExample } from './SubscriptionsExample'
export { VoucherExample } from './VoucherExample'
export { CancelSubscriptionExample } from './CancelSubscriptionExample'
export { VideoPlaybackExample } from './VideoPlaybackExample'
export { QerkoCheckoutExample } from './QerkoCheckoutExample'
export { GiftSubscriptionExample } from './GiftSubscriptionExample'

export type ExampleId =
    | 'login'
    | 'series'
    | 'series-detail'
    | 'series-purchase'
    | 'articles'
    | 'article-detail'
    | 'subscriptions'
    | 'voucher'
    | 'cancel-subscription'
    | 'video-playback'
    | 'qerko-checkout'
    | 'gift-subscription'

export const exampleDefinitions: { id: ExampleId; label: string }[] = [
    { id: 'login', label: 'Login & registration' },
    { id: 'series', label: 'Series' },
    { id: 'series-detail', label: 'Series detail' },
    { id: 'series-purchase', label: 'Series purchase prompt' },
    { id: 'articles', label: 'Articles (Časopisy)' },
    { id: 'article-detail', label: 'Article detail' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'voucher', label: 'Voucher' },
    { id: 'cancel-subscription', label: 'Cancel subscription' },
    { id: 'video-playback', label: 'Video preview & paywall' },
    { id: 'qerko-checkout', label: 'Qerko checkout' },
    { id: 'gift-subscription', label: 'Gift subscription' },
]
