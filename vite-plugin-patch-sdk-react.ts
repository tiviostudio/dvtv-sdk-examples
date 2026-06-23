import type { Plugin } from 'vite'

const PATCHES = [
    {
        old: 't.resolveShared=function(e){if(!(e in d))throw new Error("Could not resolve shared dependency ".concat(e));return d[e]}',
        next: 't.resolveShared=function(e){if(!(e in d)){var r=globalThis.__TIVIO_EXTRA_SHARED;if(r&&e in r)return r[e];throw new Error("Could not resolve shared dependency ".concat(e))}return d[e]}',
    },
    {
        old: 't2.resolveShared=function(e3){if(!(e3 in d))throw new Error("Could not resolve shared dependency ".concat(e3));return d[e3]}',
        next: 't2.resolveShared=function(e3){if(!(e3 in d)){var r=globalThis.__TIVIO_EXTRA_SHARED;if(r&&e3 in r)return r[e3];throw new Error("Could not resolve shared dependency ".concat(e3))}return d[e3]}',
    },
]

function patchResolveShared(code: string): string | null {
    let patched = code
    let changed = false

    for (const { old, next } of PATCHES) {
        if (patched.includes(old)) {
            patched = patched.replace(old, next)
            changed = true
        }
    }

    return changed ? patched : null
}

/** Vite transform fallback — postinstall patches node_modules; this catches prebundled deps. */
export function patchSdkReactSharedDeps(): Plugin {
    return {
        name: 'patch-sdk-react-shared-deps',
        enforce: 'pre',
        transform(code, id) {
            if (!id.includes('@tivio/sdk-react') && !id.includes('@tivio_sdk-react')) {
                return null
            }

            const patched = patchResolveShared(code)
            if (!patched) {
                return null
            }

            return { code: patched, map: null }
        },
    }
}
