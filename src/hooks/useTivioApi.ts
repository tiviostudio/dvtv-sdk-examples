import { useTivioData } from '@tivio/sdk-react'

/**
 * Returns the core `tivio` instance from the loaded remote bundle.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useTivioApi(): any {
    const bundle = useTivioData()
    if (bundle.state !== 'ready') {
        return null
    }
    return (bundle as { tivio?: unknown }).tivio ?? null
}
