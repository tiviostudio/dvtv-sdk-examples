import { useTivioData, useUser, useVideo } from '@tivio/sdk-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useTivioApi } from '../hooks/useTivioApi'

type PlaybackSelection = {
    applicationHandle: string
    videoId: string
}

type PlaybackPreset = PlaybackSelection & {
    description: string
    label: string
}

type Props = {
    initialApplicationHandle?: string
    initialVideoId?: string
}

const PREVIEW_PRESET: PlaybackPreset = {
    applicationHandle: 'cobykdyby',
    videoId: 'J7BIseMhYnr8AhamHoCx',
    label: 'Preview, then paywall',
    description: 'A paid episode with a linked TASTING video (18:17 preview).',
}

const PREPLAY_PAYWALL_PRESET: PlaybackPreset = {
    applicationHandle: 'ceske-prusvihy',
    videoId: 'tLBvHtMdOq6EbnSAlJVp',
    label: 'Paywall before playback',
    description: 'A paid episode without a TASTING video.',
}

const PRESETS = [PREVIEW_PRESET, PREPLAY_PAYWALL_PRESET]

function PlayerPanel({ selection, playerKey }: {
    selection: PlaybackSelection
    playerKey: number
}) {
    const tivio = useTivioApi()
    const bundle = useTivioData()
    const { data: video, error: videoError } = useVideo(selection.videoId)
    const { isSignedIn } = useUser()
    const WebPlayer = bundle.components?.WebPlayer

    const tastingLink = video?.linkedVideosRaw?.find((linkedVideo) => linkedVideo.type === 'TASTING')
    const monetizations = video?.getPurchasableMonetizations().map((monetization) => ({
        id: monetization.id,
        name: monetization.name,
        price: monetization.price,
        type: monetization.type,
    })) ?? []

    const expectedFlow = !video
        ? 'Loading video metadata…'
        : video.isPaid
            ? 'Full video — the current user already has access or the video is free.'
            : video.hasTasting
                ? 'Preview first — WebPlayer plays the linked TASTING and opens the paywall when it ends.'
                : 'Paywall first — WebPlayer opens the payment prompt before playback.'

    return (
        <>
            <p>
                Signed in through this SDK instance: <strong>{String(isSignedIn)}</strong>
            </p>
            {!isSignedIn && (
                <p className="example-error">
                    Payment actions require a user signed in through this SDK example. Open{' '}
                    <strong>Login &amp; registration</strong>, sign in, and then return here.
                </p>
            )}
            <div className="video-player-frame">
                {WebPlayer ? (
                    <WebPlayer
                        key={`${selection.applicationHandle}:${selection.videoId}:${playerKey}`}
                        id={`dvtv-video-example-${playerKey}`}
                        source={`videos/${selection.videoId}`}
                        isSameSizeAsParent
                        autoplay={false}
                        canReplay
                    />
                ) : (
                    <p>Loading WebPlayer…</p>
                )}
            </div>

            {videoError && <p className="example-error">{videoError}</p>}

            <h3>SDK decision</h3>
            <p>{expectedFlow}</p>
            <pre>{JSON.stringify({
                requestedApplicationHandle: selection.applicationHandle,
                activeApplicationHandle: tivio?.organization?.activeApplicationHandle,
                activeOrganizationId: tivio?.organization?.activeOrganizationId,
                videoId: selection.videoId,
                signedIn: isSignedIn,
                isPaid: video?.isPaid,
                price: video?.price,
                hasTasting: video?.hasTasting,
                tastingPath: tastingLink?.videoRef?.path,
                monetizations,
            }, null, 2)}</pre>
        </>
    )
}

export function VideoPlaybackExample({
    initialApplicationHandle = PREVIEW_PRESET.applicationHandle,
    initialVideoId = PREVIEW_PRESET.videoId,
}: Props) {
    const tivio = useTivioApi()
    const initialized = useRef(false)
    const [applicationHandle, setApplicationHandle] = useState(initialApplicationHandle)
    const [videoId, setVideoId] = useState(initialVideoId)
    const [selection, setSelection] = useState<PlaybackSelection | null>(null)
    const [playerKey, setPlayerKey] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const preparePlayer = useCallback(async (nextSelection: PlaybackSelection) => {
        setLoading(true)
        setError(null)
        setSelection(null)

        try {
            if (!tivio?.organization?.switchApplicationByHandle) {
                throw new Error('tivio.organization.switchApplicationByHandle is not available')
            }

            // This must finish before WebPlayer mounts. Monetizations are filtered by
            // the active TivioPro organization, and useInputSource does not re-run on
            // an application change by itself.
            await tivio.organization.switchApplicationByHandle(nextSelection.applicationHandle)

            setSelection(nextSelection)
            setPlayerKey((current) => current + 1)
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
            setLoading(false)
        }
    }, [tivio])

    useEffect(() => {
        if (!tivio || initialized.current) {
            return
        }

        initialized.current = true
        void preparePlayer({
            applicationHandle: initialApplicationHandle,
            videoId: initialVideoId,
        })
    }, [initialApplicationHandle, initialVideoId, preparePlayer, tivio])

    useEffect(() => () => {
        const resetToDefault = tivio?.organization?.switchApplicationByHandle?.()
        resetToDefault?.catch?.(() => undefined)
    }, [tivio])

    const loadPreset = (preset: PlaybackPreset) => {
        setApplicationHandle(preset.applicationHandle)
        setVideoId(preset.videoId)
        void preparePlayer(preset)
    }

    return (
        <div className="example">
            <h2>Video preview &amp; paywall</h2>
            <p className="example-muted">
                The player receives the main <code>videos/&lt;id&gt;</code> path. Preview and paywall behavior
                is resolved automatically from its monetizations and linked <code>TASTING</code> video.
            </p>

            <div className="example-note">
                For a TivioPro series, call and await{' '}
                <code>tivio.organization.switchApplicationByHandle(urlHandle)</code> before mounting{' '}
                <code>WebPlayer</code>. Without this step, series monetizations are filtered out and the
                paywall does not activate.
            </div>

            <div className="example-note">
                This app uses the npm package <code>@tivio/sdk-react 11.0.1</code>. The player and paywall
                UI are loaded from a separately versioned <code>core-react-dom</code> remote bundle, so its
                version number is independent from the npm SDK version.
            </div>

            <div className="playback-presets">
                {PRESETS.map((preset) => (
                    <button
                        key={preset.videoId}
                        type="button"
                        onClick={() => loadPreset(preset)}
                        disabled={loading}
                    >
                        <strong>{preset.label}</strong>
                        <span>{preset.description}</span>
                    </button>
                ))}
            </div>

            <form
                className="example-actions"
                onSubmit={(event) => {
                    event.preventDefault()
                    void preparePlayer({
                        applicationHandle: applicationHandle.trim(),
                        videoId: videoId.trim(),
                    })
                }}
            >
                <label>
                    application urlHandle{' '}
                    <input
                        value={applicationHandle}
                        onChange={(event) => setApplicationHandle(event.target.value)}
                        placeholder="cobykdyby"
                    />
                </label>
                <label>
                    videoId{' '}
                    <input
                        value={videoId}
                        onChange={(event) => setVideoId(event.target.value)}
                        placeholder="J7BIseMhYnr8AhamHoCx"
                    />
                </label>
                <button
                    type="submit"
                    disabled={loading || !applicationHandle.trim() || !videoId.trim()}
                >
                    Load player
                </button>
            </form>

            {loading && <p>Switching application and loading player…</p>}
            {error && <p className="example-error">{error}</p>}
            {selection && <PlayerPanel selection={selection} playerKey={playerKey} />}
        </div>
    )
}
