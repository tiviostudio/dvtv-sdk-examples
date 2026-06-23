/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_TIVIO_SECRET: string
    readonly VITE_TIVIO_APPLICATION_ID: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
