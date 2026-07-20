export { LoginExample } from './LoginExample'
export { SeriesListExample } from './SeriesListExample'
export { SeriesDetailExample } from './SeriesDetailExample'
export { ArticlesListExample } from './ArticlesListExample'
export { ArticleDetailExample } from './ArticleDetailExample'
export { SubscriptionsExample } from './SubscriptionsExample'
export { VoucherExample } from './VoucherExample'
export { CancelSubscriptionExample } from './CancelSubscriptionExample'
export { VideoPlaybackExample } from './VideoPlaybackExample'

export type ExampleId =
    | 'login'
    | 'series'
    | 'series-detail'
    | 'articles'
    | 'article-detail'
    | 'subscriptions'
    | 'voucher'
    | 'cancel-subscription'
    | 'video-playback'

export const exampleDefinitions: { id: ExampleId; label: string }[] = [
    { id: 'login', label: 'Login & registration' },
    { id: 'series', label: 'Series' },
    { id: 'series-detail', label: 'Series detail' },
    { id: 'articles', label: 'Articles (Časopisy)' },
    { id: 'article-detail', label: 'Article detail' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'voucher', label: 'Voucher' },
    { id: 'cancel-subscription', label: 'Cancel subscription' },
    { id: 'video-playback', label: 'Video preview & paywall' },
]
