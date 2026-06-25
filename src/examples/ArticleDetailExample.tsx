import { useCallback, useEffect, useState } from 'react'

import { dvtvConfig } from '../config'
import { useTivioApi } from '../hooks/useTivioApi'
import { resolveTranslation } from '../utils/resolveTranslation'

type Props = {
    articleId: string
    onArticleIdChange: (id: string) => void
}

export function ArticleDetailExample({ articleId, onArticleIdChange }: Props) {
    const tivio = useTivioApi()
    const [inputId, setInputId] = useState(articleId)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<{
        name: string
        description: string
        isBlockedByPurchase: boolean
        blocksCount: number
    } | null>(null)

    const loadArticle = useCallback(async (id: string) => {
        if (!id) {
            return
        }
        setLoading(true)
        setError(null)
        try {
            if (!tivio) {
                throw new Error('Tivio SDK not ready')
            }

            const response = await tivio.getArticleByIdOrUrlName(id)
            setResult({
                name: resolveTranslation(response.article.name),
                description: resolveTranslation(response.article.description),
                isBlockedByPurchase: response.isBlockedByPurchase,
                blocksCount: response.article.blocks?.length ?? 0,
            })
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
            setResult(null)
        } finally {
            setLoading(false)
        }
    }, [tivio])

    useEffect(() => {
        setInputId(articleId)
        loadArticle(articleId)
    }, [articleId, loadArticle])

    return (
        <div className="example">
            <h2>Article detail</h2>
            <p className="example-muted">
                <code>bundle.tivio.getArticleByIdOrUrlName</code> — paywall when <code>isBlockedByPurchase</code>
            </p>

            <div className="example-actions">
                <input
                    value={inputId}
                    placeholder="Article id"
                    onChange={(e) => setInputId(e.target.value)}
                />
                <button
                    className="primary"
                    onClick={() => {
                        onArticleIdChange(inputId)
                        loadArticle(inputId)
                    }}
                >
                    Load
                </button>
                <button onClick={() => onArticleIdChange(dvtvConfig.sampleArticleId)}>
                    Sample ({dvtvConfig.sampleArticleId})
                </button>
            </div>

            {loading && <p>Loading…</p>}
            {error && <p className="example-error">{error}</p>}
            {result && (
                <>
                    <p>
                        Paywall: <strong>{result.isBlockedByPurchase ? 'yes (preview only)' : 'no (full content)'}</strong>
                    </p>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </>
            )}
        </div>
    )
}
