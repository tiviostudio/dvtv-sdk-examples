import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sdkReactDist = path.join(__dirname, '../node_modules/@tivio/sdk-react/dist/index.js')

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

function patchFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return false
    }

    let code = fs.readFileSync(filePath, 'utf8')
    let changed = false

    for (const { old, next } of PATCHES) {
        if (code.includes(old)) {
            code = code.replace(old, next)
            changed = true
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, code)
    }

    return changed
}

const patched = patchFile(sdkReactDist)
if (patched) {
    console.log('[patch-sdk-react] Patched @tivio/sdk-react resolveShared')
} else if (fs.existsSync(sdkReactDist)) {
    console.warn('[patch-sdk-react] resolveShared pattern not found — already patched or sdk-react version changed')
}

// Also patch Vite prebundle cache when present (e.g. after first dev run).
const viteDeps = path.join(__dirname, '../node_modules/.vite/deps/@tivio_sdk-react.js')
patchFile(viteDeps)
