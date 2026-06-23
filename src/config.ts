/**
 * DVTV-specific IDs for examples.
 * Update screen/row/tag/article ids to match your Tivio Studio setup.
 *
 * SDK credentials (secret, applicationId) belong in `.env` — see `.env.example`.
 */
export const dvtvConfig = {
    /**
     * EMBED screen behind https://www.dvtv.cz/screens/casopisy (PDF DVTV Interview).
     * Not usable with useRowsInScreen — for reference only.
     */
    casopisyEmbedScreenId: 'screen-spKopMMkpKnp8h_UrzRxu',
    /**
     * Tivio Articles list — option A: normal screen with a filter row (type ARTICLE).
     * Must NOT be an EMBED screen. Leave empty when using articlesTagId.
     */
    articlesScreenId: '',
    /** Row id with ARTICLE filter. When empty, the first row from useRowsInScreen is used. */
    articlesRowId: '',
    /**
     * Tivio Articles list — option B: shared tag id for getArticlesByTagId().
     * Preferred when all magazine articles share one tag in Studio.
     */
    articlesTagId: '',
    /** Example article id — replace with a real article id from your application. */
    sampleArticleId: '',
    /** Example monetization id for subscription purchase / cancel examples */
    sampleMonetizationId: '',
} as const

export function getTivioSecret(): string | undefined {
    const value = import.meta.env.VITE_TIVIO_SECRET
    return typeof value === 'string' && value.length > 0 ? value : undefined
}

export function getTivioApplicationId(): string | undefined {
    const value = import.meta.env.VITE_TIVIO_APPLICATION_ID
    return typeof value === 'string' && value.length > 0 ? value : undefined
}
