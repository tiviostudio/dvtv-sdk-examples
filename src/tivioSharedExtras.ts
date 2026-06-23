/**
 * Older core-react-dom remote bundles (e.g. 5.23.x) declare extra webpack externals
 * that @tivio/sdk-react 10.x no longer provides (i18next was removed in sdk-react 9).
 * Register them before TivioProvider loads so the patched resolveShared can find them.
 */
import * as i18next from 'i18next'
import * as reactI18next from 'react-i18next'
import * as reactSpring from 'react-spring'

declare global {
    var __TIVIO_EXTRA_SHARED: Record<string, unknown> | undefined
}

/** Minimal browser stub — the Node `util` package breaks in Vite (process is not defined). */
const utilStub = {
    types: {
        isTypedArray: (value: unknown) => value instanceof Uint8Array,
    },
}

globalThis.__TIVIO_EXTRA_SHARED = {
    'i18next': i18next,
    'react-i18next': reactI18next,
    'react-spring': reactSpring,
    util: utilStub,
}
