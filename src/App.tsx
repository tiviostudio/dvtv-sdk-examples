import { useEffect, useState } from 'react'

import './App.css'
import { dvtvConfig } from './config'
import {
    ArticleDetailExample,
    ArticlesListExample,
    CancelSubscriptionExample,
    exampleDefinitions,
    LoginExample,
    QerkoCheckoutExample,
    SeriesListExample,
    SeriesDetailExample,
    SubscriptionsExample,
    VideoPlaybackExample,
    VoucherExample,
    type ExampleId,
} from './examples'

function getInitialExample(): ExampleId {
    const requestedExample = new URLSearchParams(window.location.search).get('example')
    return exampleDefinitions.some(({ id }) => id === requestedExample)
        ? requestedExample as ExampleId
        : 'login'
}

export default function App() {
    const [activeExample, setActiveExample] = useState<ExampleId>(getInitialExample)
    const [articleId, setArticleId] = useState<string>(dvtvConfig.sampleArticleId)
    const [seriesOrganizationId, setSeriesOrganizationId] = useState<string>(
        dvtvConfig.sampleSeriesOrganizationId,
    )
    const [seriesUrlHandle, setSeriesUrlHandle] = useState('')
    const [playbackVideoId, setPlaybackVideoId] = useState('J7BIseMhYnr8AhamHoCx')
    const [playbackApplicationHandle, setPlaybackApplicationHandle] = useState('cobykdyby')

    useEffect(() => {
        const url = new URL(window.location.href)
        url.searchParams.set('example', activeExample)
        window.history.replaceState(null, '', url)
    }, [activeExample])

    const renderExample = () => {
        switch (activeExample) {
            case 'login':
                return <LoginExample />
            case 'series':
                return (
                    <SeriesListExample
                        onSelectSeries={(item) => {
                            setSeriesOrganizationId(item.organizationId)
                            setSeriesUrlHandle(item.urlHandle)
                            setActiveExample('series-detail')
                        }}
                    />
                )
            case 'series-detail':
                return (
                    <SeriesDetailExample
                        organizationId={seriesOrganizationId}
                        urlHandle={seriesUrlHandle}
                        onOrganizationIdChange={setSeriesOrganizationId}
                        onSelectVideo={(videoId) => {
                            setPlaybackVideoId(videoId)
                            setPlaybackApplicationHandle(seriesUrlHandle)
                            setActiveExample('video-playback')
                        }}
                    />
                )
            case 'articles':
                return (
                    <ArticlesListExample
                        onSelectArticle={(id) => {
                            setArticleId(id)
                            setActiveExample('article-detail')
                        }}
                    />
                )
            case 'article-detail':
                return (
                    <ArticleDetailExample
                        articleId={articleId}
                        onArticleIdChange={setArticleId}
                    />
                )
            case 'subscriptions':
                return <SubscriptionsExample />
            case 'voucher':
                return <VoucherExample />
            case 'cancel-subscription':
                return <CancelSubscriptionExample />
            case 'video-playback':
                return (
                    <VideoPlaybackExample
                        initialVideoId={playbackVideoId}
                        initialApplicationHandle={playbackApplicationHandle}
                    />
                )
            case 'qerko-checkout':
                return <QerkoCheckoutExample />
            default:
                return null
        }
    }

    return (
        <div className="app">
            <aside className="app-sidebar">
                <h1>DVTV SDK examples</h1>
                <p>@tivio/sdk-react</p>
                <nav className="app-nav">
                    {exampleDefinitions.map(({ id, label }) => (
                        <button
                            key={id}
                            type="button"
                            className={activeExample === id ? 'active' : ''}
                            onClick={() => setActiveExample(id)}
                        >
                            {label}
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="app-main">
                {renderExample()}
            </main>
        </div>
    )
}
