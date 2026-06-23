/**
 * DVTV-specific IDs and defaults.
 * Update these values from Tivio administration (Studio).
 */
export const dvtvConfig = {
    /** Screen id for /screens/casopisy */
    magazinesScreenId: 'casopisy',
    /**
     * Row id on the casopisy screen. When empty, the first row from useRowsInScreen is used.
     * Set explicitly once you know the row id from administration.
     */
    magazinesRowId: '',
    /** Example article id from dvtv.cz/dvtv/articles/{id} */
    sampleArticleId: 'DEmafybcqCsduuJMyPyy',
    /** Example monetization id for subscription purchase / cancel examples */
    sampleMonetizationId: '',
} as const

export function getTivioSecret(): string | undefined {
    const fromQuery = new URLSearchParams(window.location.search).get('secret')
    if (fromQuery) {
        return fromQuery
    }

    const fromEnv = import.meta.env.VITE_TIVIO_SECRET
    if (typeof fromEnv === 'string' && fromEnv.length > 0) {
        return fromEnv
    }

    return undefined
}
