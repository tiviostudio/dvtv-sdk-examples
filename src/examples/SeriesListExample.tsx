import { useCallback, useEffect, useState } from 'react'

import { useTivioApi } from '../hooks/useTivioApi'

type SeriesItem = {
    organizationId: string
    urlHandle: string
    name: string
    logo?: string
}

export function SeriesListExample() {
    const tivio = useTivioApi()
    const [series, setSeries] = useState<SeriesItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadSeries = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            if (!tivio) {
                throw new Error('Tivio SDK not ready')
            }

            const orgIds = await tivio.getOrganizationIdsInTivioPro()
            const allSeries = await tivio.getTivioProApplicationsByOrganizationIds(orgIds)

            const handles = tivio.organization?.allowedApplicationHandles ?? []
            const dvtvSeries = allSeries.filter((item: { urlHandle: string }) =>
                handles.includes(item.urlHandle)
                && item.urlHandle !== 'dvtv'
                && item.urlHandle !== '_default',
            )

            setSeries(dvtvSeries.map((item: { organizationId: string; urlHandle: string; name: string; logo?: string }) => ({
                organizationId: item.organizationId,
                urlHandle: item.urlHandle,
                name: item.name,
                logo: item.logo,
            })))
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        } finally {
            setLoading(false)
        }
    }, [tivio])

    useEffect(() => {
        loadSeries()
    }, [loadSeries])

    return (
        <div className="example">
            <h2>Series (TivioPro applications)</h2>
            <p className="example-muted">
                <code>getOrganizationIdsInTivioPro</code>, <code>getTivioProApplicationsByOrganizationIds</code>,
                filtered by <code>allowedApplicationHandles</code>
            </p>

            <div className="example-actions">
                <button onClick={loadSeries} disabled={loading}>Reload</button>
            </div>

            {loading && <p>Loading…</p>}
            {error && <p className="example-error">{error}</p>}

            <pre>{JSON.stringify(series.slice(0, 10), null, 2)}</pre>
            {series.length > 10 && (
                <p className="example-muted">Showing first 10 of {series.length} series.</p>
            )}
        </div>
    )
}
