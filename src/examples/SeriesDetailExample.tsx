import { useTaggedVideos } from '@tivio/sdk-react'
import { useCallback, useEffect, useState } from 'react'

import { dvtvConfig } from '../config'
import { useTivioApi } from '../hooks/useTivioApi'
import { resolveTranslation } from '../utils/resolveTranslation'

type SeriesMeta = {
    name: string
    description?: string
    cover?: string
    tagId: string
    availableSeasons: { seasonNumber: number }[]
}

type Props = {
    organizationId: string
    urlHandle: string
    onOrganizationIdChange: (organizationId: string) => void
}

export function SeriesDetailExample({
    organizationId,
    urlHandle,
    onOrganizationIdChange,
}: Props) {
    const tivio = useTivioApi()
    const [inputOrgId, setInputOrgId] = useState(organizationId)
    const [seriesMeta, setSeriesMeta] = useState<SeriesMeta | null>(null)
    const [seasonNumber, setSeasonNumber] = useState(1)
    const [loadingMeta, setLoadingMeta] = useState(false)
    const [metaError, setMetaError] = useState<string | null>(null)

    const loadSeriesMeta = useCallback(async (orgId: string) => {
        if (!orgId) {
            return
        }
        setLoadingMeta(true)
        setMetaError(null)
        try {
            if (!tivio?.getSeriesContentByOrganizationId) {
                throw new Error('tivio.getSeriesContentByOrganizationId is not available')
            }

            const seriesList = await tivio.getSeriesContentByOrganizationId(orgId)
            const series = seriesList[0]
            if (!series) {
                throw new Error(`No series content found for organization ${orgId}`)
            }

            const tagId = series.originalTagId
            if (!tagId) {
                throw new Error('Series has no originalTagId — cannot load episodes')
            }

            setSeriesMeta({
                name: resolveTranslation(series.name),
                description: resolveTranslation(series.description),
                cover: series.cover,
                tagId,
                availableSeasons: series.availableSeasons?.length
                    ? series.availableSeasons
                    : [{ seasonNumber: 1 }],
            })
            setSeasonNumber(series.availableSeasons?.[0]?.seasonNumber ?? 1)
        } catch (e) {
            setMetaError(e instanceof Error ? e.message : String(e))
            setSeriesMeta(null)
        } finally {
            setLoadingMeta(false)
        }
    }, [tivio])

    useEffect(() => {
        setInputOrgId(organizationId)
    }, [organizationId])

    useEffect(() => {
        if (organizationId) {
            void loadSeriesMeta(organizationId)
        }
    }, [organizationId, loadSeriesMeta])

    const { pagination, error: episodesError } = useTaggedVideos(
        seriesMeta?.tagId ? [seriesMeta.tagId] : [],
        {
            noLimit: true,
            fetchTags: false,
            where: [{ field: 'seasonNumber', operator: '==', value: seasonNumber }],
            orderBy: [{ field: 'episodeNumber', directionStr: 'asc' }],
        },
    )

    const episodes = pagination?.items ?? []

    return (
        <div className="example">
            <h2>Series detail</h2>
            <p className="example-muted">
                Load series metadata via <code>getSeriesContentByOrganizationId</code>,
                then episodes via <code>useTaggedVideos</code> (series tag + season).
            </p>

            <div className="example-actions">
                <label>
                    organizationId{' '}
                    <input
                        value={inputOrgId}
                        onChange={(e) => setInputOrgId(e.target.value)}
                        placeholder="TivioPro sub-org id"
                    />
                </label>
                <button
                    type="button"
                    onClick={() => onOrganizationIdChange(inputOrgId)}
                    disabled={!inputOrgId || loadingMeta}
                >
                    Load
                </button>
            </div>

            {urlHandle && (
                <p className="example-muted">
                    urlHandle: <code>{urlHandle}</code>
                </p>
            )}

            {loadingMeta && <p>Loading series…</p>}
            {metaError && <p className="example-error">{metaError}</p>}

            {seriesMeta && (
                <>
                    <h3>{seriesMeta.name}</h3>
                    {seriesMeta.description && <p>{seriesMeta.description}</p>}
                    {seriesMeta.cover && <img src={seriesMeta.cover} alt="" style={{ maxWidth: 240 }} />}

                    <p className="example-muted">
                        tagId: <code>{seriesMeta.tagId}</code>
                    </p>

                    {seriesMeta.availableSeasons.length > 1 && (
                        <div className="example-actions">
                            <label>
                                Season{' '}
                                <select
                                    value={seasonNumber}
                                    onChange={(e) => setSeasonNumber(Number(e.target.value))}
                                >
                                    {seriesMeta.availableSeasons.map((season) => (
                                        <option key={season.seasonNumber} value={season.seasonNumber}>
                                            {season.seasonNumber}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    )}

                    {episodesError && <p className="example-error">{episodesError.message}</p>}
                    {pagination?.loading && <p>Loading episodes…</p>}

                    <p className="example-muted">{episodes.length} episode(s)</p>
                    <div className="article-list">
                        {episodes.map((episode) => (
                            <div key={episode.id} className="article-card">
                                {episode.cover && <img src={episode.cover} alt="" />}
                                <div>
                                    <h3>{resolveTranslation(episode.name, episode.id)}</h3>
                                    {'description' in episode && episode.description && (
                                        <p>{resolveTranslation(episode.description)}</p>
                                    )}
                                    <p className="example-muted">
                                        id: {episode.id}
                                        {'episodeNumber' in episode && episode.episodeNumber != null
                                            ? ` · ep. ${episode.episodeNumber}`
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
