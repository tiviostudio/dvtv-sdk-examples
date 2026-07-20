import { useCallback, useEffect, useMemo, useState } from 'react'

import { dvtvConfig } from '../config'
import { useTivioApi } from '../hooks/useTivioApi'
import { resolveTranslation } from '../utils/resolveTranslation'

type TranslationField = Parameters<typeof resolveTranslation>[0]

type SeriesMeta = {
    name: string
    description?: string
    cover?: string
    tagId?: string
}

type SeriesContent = {
    name: TranslationField
    description?: TranslationField
    cover?: string
    originalTagId?: string
}

type SeriesVideo = {
    id: string
    name: TranslationField
    description?: TranslationField
    cover?: string
    seasonNumber?: number
    episodeNumber?: number
}

type Props = {
    organizationId: string
    urlHandle: string
    onOrganizationIdChange: (organizationId: string) => void
}

const episodeComparator = (left: SeriesVideo, right: SeriesVideo) => {
    const seasonDifference = (left.seasonNumber ?? Number.MAX_SAFE_INTEGER)
        - (right.seasonNumber ?? Number.MAX_SAFE_INTEGER)
    if (seasonDifference !== 0) {
        return seasonDifference
    }

    const episodeDifference = (left.episodeNumber ?? Number.MAX_SAFE_INTEGER)
        - (right.episodeNumber ?? Number.MAX_SAFE_INTEGER)
    if (episodeDifference !== 0) {
        return episodeDifference
    }

    return resolveTranslation(left.name, left.id).localeCompare(
        resolveTranslation(right.name, right.id),
        'cs',
    )
}

export function SeriesDetailExample({
    organizationId,
    urlHandle,
    onOrganizationIdChange,
}: Props) {
    const tivio = useTivioApi()
    const [inputOrgId, setInputOrgId] = useState(organizationId)
    const [seriesMeta, setSeriesMeta] = useState<SeriesMeta | null>(null)
    const [videos, setVideos] = useState<SeriesVideo[]>([])
    const [seasonNumber, setSeasonNumber] = useState<number | 'all'>('all')
    const [loading, setLoading] = useState(false)
    const [videosError, setVideosError] = useState<string | null>(null)
    const [metaNotice, setMetaNotice] = useState<string | null>(null)

    const loadSeries = useCallback(async (orgId: string) => {
        if (!orgId) {
            return
        }

        setLoading(true)
        setVideosError(null)
        setMetaNotice(null)
        setSeriesMeta(null)
        setVideos([])
        setSeasonNumber('all')

        try {
            if (!tivio?.getVideosByOrganizationId) {
                throw new Error('tivio.getVideosByOrganizationId is not available')
            }

            const metadataPromise = tivio.getSeriesContentByOrganizationId
                ? tivio.getSeriesContentByOrganizationId(orgId)
                : Promise.resolve([])

            const [videosResult, metadataResult] = await Promise.allSettled([
                tivio.getVideosByOrganizationId(orgId, {
                    limit: 500,
                    initApplications: false,
                }),
                metadataPromise,
            ])

            if (videosResult.status === 'rejected') {
                throw videosResult.reason
            }

            const organizationVideos = videosResult.value as SeriesVideo[]
            setVideos([...organizationVideos].sort(episodeComparator))

            if (metadataResult.status === 'rejected') {
                const message = metadataResult.reason instanceof Error
                    ? metadataResult.reason.message
                    : String(metadataResult.reason)
                setMetaNotice(`Optional series metadata could not be loaded: ${message}`)
                return
            }

            const series = (metadataResult.value as SeriesContent[])[0]
            if (!series) {
                setMetaNotice(
                    'No canonical SERIES metadata exists for this TivioPro application. '
                    + 'Its published videos are loaded directly from the organization.',
                )
                return
            }

            setSeriesMeta({
                name: resolveTranslation(series.name),
                description: resolveTranslation(series.description),
                cover: series.cover,
                tagId: series.originalTagId,
            })
        } catch (error) {
            setVideosError(error instanceof Error ? error.message : String(error))
        } finally {
            setLoading(false)
        }
    }, [tivio])

    useEffect(() => {
        setInputOrgId(organizationId)
    }, [organizationId])

    useEffect(() => {
        if (organizationId) {
            void loadSeries(organizationId)
        }
    }, [organizationId, loadSeries])

    const availableSeasons = useMemo(() => Array.from(new Set(
        videos
            .map((video) => video.seasonNumber)
            .filter((value): value is number => typeof value === 'number'),
    )).sort((left, right) => left - right), [videos])

    const unseasonedCount = useMemo(
        () => videos.filter((video) => video.seasonNumber == null).length,
        [videos],
    )

    const visibleVideos = seasonNumber === 'all'
        ? videos
        : videos.filter((video) => video.seasonNumber === seasonNumber)

    return (
        <div className="example">
            <h2>Series detail</h2>
            <p className="example-muted">
                Load published videos via <code>getVideosByOrganizationId</code>.
                Canonical series metadata is optional and season filtering happens client-side.
            </p>

            <div className="example-actions">
                <label>
                    organizationId{' '}
                    <input
                        value={inputOrgId}
                        onChange={(event) => setInputOrgId(event.target.value)}
                        placeholder="TivioPro sub-org id"
                    />
                </label>
                <button
                    type="button"
                    onClick={() => onOrganizationIdChange(inputOrgId)}
                    disabled={!inputOrgId || loading}
                >
                    Load
                </button>
            </div>

            {urlHandle && (
                <p className="example-muted">
                    urlHandle: <code>{urlHandle}</code>
                </p>
            )}

            {loading && <p>Loading videos…</p>}
            {videosError && <p className="example-error">{videosError}</p>}
            {metaNotice && <p className="example-muted">{metaNotice}</p>}

            {seriesMeta && (
                <>
                    <h3>{seriesMeta.name}</h3>
                    {seriesMeta.description && <p>{seriesMeta.description}</p>}
                    {seriesMeta.cover && <img src={seriesMeta.cover} alt="" style={{ maxWidth: 240 }} />}
                    {seriesMeta.tagId && (
                        <p className="example-muted">
                            canonical tagId: <code>{seriesMeta.tagId}</code>
                        </p>
                    )}
                </>
            )}

            {!loading && !videosError && organizationId && (
                <>
                    {availableSeasons.length > 0 && (
                        <div className="example-actions">
                            <label>
                                Season{' '}
                                <select
                                    value={seasonNumber}
                                    onChange={(event) => {
                                        const value = event.target.value
                                        setSeasonNumber(value === 'all' ? 'all' : Number(value))
                                    }}
                                >
                                    <option value="all">All</option>
                                    {availableSeasons.map((availableSeason) => (
                                        <option key={availableSeason} value={availableSeason}>
                                            {availableSeason}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    )}

                    <p className="example-muted">
                        {visibleVideos.length} video(s)
                        {seasonNumber !== 'all' ? ` of ${videos.length} total` : ''}
                    </p>
                    {seasonNumber === 'all' && unseasonedCount > 0 && (
                        <p className="example-muted">
                            {unseasonedCount} video(s) have no seasonNumber and remain visible in All.
                        </p>
                    )}

                    <div className="article-list">
                        {visibleVideos.map((video) => (
                            <div key={video.id} className="article-card">
                                {video.cover && <img src={video.cover} alt="" />}
                                <div>
                                    <h3>{resolveTranslation(video.name, video.id)}</h3>
                                    {video.description != null && (
                                        <p>{resolveTranslation(video.description)}</p>
                                    )}
                                    <p className="example-muted">
                                        id: {video.id}
                                        {video.seasonNumber != null
                                            ? ` · season ${video.seasonNumber}`
                                            : ''}
                                        {video.episodeNumber != null
                                            ? ` · ep. ${video.episodeNumber}`
                                            : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {!organizationId && !dvtvConfig.sampleSeriesOrganizationId && (
                <p className="example-muted">
                    Pick a series from the <strong>Series</strong> example, or set{' '}
                    <code>sampleSeriesOrganizationId</code> in <code>src/config.ts</code>.
                </p>
            )}
        </div>
    )
}
