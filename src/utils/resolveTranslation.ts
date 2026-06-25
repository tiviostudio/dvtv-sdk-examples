/** Firestore Translation field — map of lang code → string */
type TranslationField = Record<string, string> | string | null | undefined

const PREFERRED_LANGS = ['cs', 'en', 'sk'] as const

/**
 * Resolves a Tivio Translation object to a display string.
 * SDK entities often expose name/description as `{ cs, en, sk, ... }` rather than plain strings.
 */
export function resolveTranslation(value: TranslationField, fallback = ''): string {
    if (value == null) {
        return fallback
    }
    if (typeof value === 'string') {
        return value
    }
    for (const lang of PREFERRED_LANGS) {
        const text = value[lang]
        if (typeof text === 'string' && text.trim()) {
            return text
        }
    }
    const first = Object.values(value).find((v) => typeof v === 'string' && v.trim())
    return typeof first === 'string' ? first : fallback
}
