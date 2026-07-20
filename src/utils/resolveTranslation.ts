const PREFERRED_LANGS = ['cs', 'en', 'sk'] as const

/**
 * Resolves a Tivio Translation object to a display string.
 * SDK entities often expose name/description as `{ cs, en, sk, ... }` rather than plain strings.
 */
export function resolveTranslation(value: unknown, fallback = ''): string {
    if (value == null) {
        return fallback
    }
    if (typeof value === 'string') {
        return value
    }
    if (typeof value !== 'object' || Array.isArray(value)) {
        return fallback
    }

    const translations = value as Record<string, unknown>
    for (const lang of PREFERRED_LANGS) {
        const text = translations[lang]
        if (typeof text === 'string' && text.trim()) {
            return text
        }
    }
    const first = Object.values(translations).find((v) => typeof v === 'string' && v.trim())
    return typeof first === 'string' ? first : fallback
}
