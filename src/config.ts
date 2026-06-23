/**
 * DVTV-specific IDs and defaults.
 * Update these values from Tivio administration (Studio).
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
    /** Example article id from dvtv.cz/dvtv/articles/{id} */
    sampleArticleId: 'DEmafybcqCsduuJMyPyy',
    /** Example monetization id for subscription purchase / cancel examples */
    sampleMonetizationId: '',
} as const

/**
 * DVTV bundle secrets in Firebase Remote Config (`bconf_<secret>`).
 *
 * @tivio/sdk-react downloads a remote JS bundle based on secret. The secret MUST point
 * to a **core-react-dom** (web) bundle — not core-react-native (tvOS/mobile).
 *
 * Each secret belongs to one organization — `applicationId` must exist under that org.
 */
export const dvtvSdkSecrets = {
    /**
     * DVTV-DEV predproduction — NGS external web SDK.
     * Bundle: core-react-dom_7.10.0.js (recommended default for this repo).
     */
    devWeb: '7oraqYzNbV2g4tji',
    /** DVTV demo web — web-dvtv.web.app */
    demoWeb: 'dvtvomEgYekvgICtWS9h',

    legacyWeb: 'a38kdDJoel2kEKHjli38K',
    /**
     * DVTV Stargaze production — tvOS/native ONLY.
     * Do NOT use with @tivio/sdk-react on web (loads core-react-native → async-storage error).
     */
    productionTvOs: '0tA91lLNyZbSu1dbCIlF',
} as const

/** applicationId per secret — must match the organization that owns the secret. */
const applicationIdBySecret: Record<string, string> = {
    [dvtvSdkSecrets.devWeb]: 'UIwGV0qOZgbj0WctI5CR',
    [dvtvSdkSecrets.demoWeb]: 'hzHlMaAcABw771DO9XeF',
    [dvtvSdkSecrets.legacyWeb]: 'hzHlMaAcABw771DO9XeF',
    [dvtvSdkSecrets.productionTvOs]: '4ZOwgrri2H43k9Wl0ONB',
}

/** Default: DVTV-DEV predproduction (core-react-dom 7.10.0). Override via .env or ?secret= in URL. */
const DEFAULT_TIVIO_SECRET = dvtvSdkSecrets.legacyWeb

export function getTivioSecret(): string {
    const fromQuery = new URLSearchParams(window.location.search).get('secret')
    if (fromQuery) {
        return fromQuery
    }

    const fromEnv = import.meta.env.VITE_TIVIO_SECRET
    if (typeof fromEnv === 'string' && fromEnv.length > 0) {
        return fromEnv
    }

    return DEFAULT_TIVIO_SECRET
}

/**
 * Resolves applicationId for the given secret.
 * Override with VITE_TIVIO_APPLICATION_ID when using dev/custom secrets (e.g. devWeb).
 */
export function getTivioApplicationId(secret: string): string | undefined {
    const fromEnv = import.meta.env.VITE_TIVIO_APPLICATION_ID
    if (typeof fromEnv === 'string' && fromEnv.length > 0) {
        return fromEnv
    }

    return applicationIdBySecret[secret]
}

export function getSecretApplicationIdHint(secret: string): string | undefined {
    if (secret in applicationIdBySecret) {
        return applicationIdBySecret[secret]
    }

    if (secret === dvtvSdkSecrets.devWeb) {
        return applicationIdBySecret[dvtvSdkSecrets.devWeb]
    }

    return 'Set VITE_TIVIO_APPLICATION_ID in .env to match your secret\'s organization'
}
