import { useTivioReadyData } from '@tivio/sdk-react'

/**
 * Returns the core `tivio` instance from the loaded remote bundle.
 * The instance is available once `useTivioReadyData()` is non-null.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useTivioApi(): any {
    const bundle = useTivioReadyData() as { tivio?: unknown } | null
    return bundle?.tivio ?? null
}
