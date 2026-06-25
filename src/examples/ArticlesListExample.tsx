import { useItemsInRow, useRowsInScreen, ROW_ITEM_TYPES } from '@tivio/sdk-react'
import { autorun } from 'mobx'
import { useEffect, useMemo, useState } from 'react'

import { dvtvConfig } from '../config'
import { useTivioApi } from '../hooks/useTivioApi'
import { resolveTranslation } from '../utils/resolveTranslation'

type ArticleListItem = {
    id: string
    name: string
    description?: string
    cover?: string
}

type Props = {
    onSelectArticle: (articleId: string) => void
}

function ArticleCards({
    articles,
    loading,
    error,
    onSelectArticle,
    sourceLabel,
}: {
    articles: ArticleListItem[]
    loading: boolean
    error: string | null
    onSelectArticle: (articleId: string) => void
    sourceLabel: string
}) {
    return (
        <>
            <p className="example-muted">Source: {sourceLabel}</p>
            {error && <p className="example-error">{error}</p>}
            {loading && <p>Loading articles…</p>}

            <div className="article-list">
                {articles.map((article) => (
                    <div
                        key={article.id}
                        className="article-card"
                        onClick={() => onSelectArticle(article.id)}
                        onKeyDown={(e) => e.key === 'Enter' && onSelectArticle(article.id)}
                        role="button"
                        tabIndex={0}
                    >
                        {article.cover && <img src={article.cover} alt="" />}
                        <div>
                            <h3>{article.name}</h3>
                            {article.description && <p>{article.description}</p>}
                            <p className="example-muted">id: {article.id}</p>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && articles.length === 0 && (
                <p className="example-muted">No articles found.</p>
            )}
        </>
    )
}

function ArticlesByTagList({ tagId, onSelectArticle }: Props & { tagId: string }) {
    const tivio = useTivioApi()
    const [articles, setArticles] = useState<ArticleListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!tivio?.getArticlesByTagId) {
            setLoading(false)
            setError('tivio.getArticlesByTagId is not available on this bundle')
            return
        }

        let disposer: (() => void) | null = null
        let cancelled = false

        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const pagination = await tivio.getArticlesByTagId(tagId)
                disposer = autorun(() => {
                    if (cancelled) {
                        return
                    }
                    setArticles(
                        pagination.items.map((item: { id: string; name: unknown; description?: unknown; cover?: string }) => ({
                            id: item.id,
                            name: resolveTranslation(item.name, item.id),
                            description: resolveTranslation(item.description),
                            cover: item.cover,
                        })),
                    )
                    setLoading(pagination.loading)
                })
            } catch (e) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : String(e))
                    setArticles([])
                    setLoading(false)
                }
            }
        }

        void load()

        return () => {
            cancelled = true
            disposer?.()
        }
    }, [tivio, tagId])

    return (
        <ArticleCards
            articles={articles}
            loading={loading}
            error={error}
            onSelectArticle={onSelectArticle}
            sourceLabel={`getArticlesByTagId('${tagId}')`}
        />
    )
}

function ArticlesByRowList({
    screenId,
    rowId,
    onSelectArticle,
}: Props & { screenId: string; rowId?: string }) {
    const { pagination: rowsPagination, error: rowsError } = useRowsInScreen(screenId, {
        noLimit: true,
    })

    const resolvedRowId = rowId || rowsPagination?.items?.[0]?.rowId || ''
    const rowCount = rowsPagination?.items?.length ?? 0

    const { pagination, error: itemsError } = useItemsInRow({
        rowId: resolvedRowId,
        options: { noLimit: true },
    })

    const articles = useMemo(
        () =>
            pagination?.items
                ?.filter((item) => item.itemType === ROW_ITEM_TYPES.ARTICLE)
                .map((item) => ({
                    id: item.id,
                    name: resolveTranslation(item.name, item.id),
                    description: 'description' in item ? resolveTranslation(item.description) : undefined,
                    cover: 'cover' in item ? item.cover : undefined,
                })) ?? [],
        [pagination?.items],
    )

    const loading = Boolean(rowsPagination?.loading || (resolvedRowId && pagination?.loading))
    const error = rowsError?.message ?? itemsError?.message ?? null

    return (
        <>
            <p className="example-muted">
                Screen <code>{screenId}</code>
                {resolvedRowId ? <> · row <code>{resolvedRowId}</code></> : ' · waiting for row…'}
                {rowCount > 0 && <> · {rowCount} row(s) on screen</>}
            </p>

            {!resolvedRowId && !rowsPagination?.loading && (
                <p className="example-muted">
                    No row found. Set <code>articlesRowId</code> in <code>src/config.ts</code>.
                </p>
            )}

            {resolvedRowId && (
                <ArticleCards
                    articles={articles}
                    loading={loading}
                    error={error}
                    onSelectArticle={onSelectArticle}
                    sourceLabel={`useRowsInScreen + useItemsInRow`}
                />
            )}
        </>
    )
}

export function ArticlesListExample({ onSelectArticle }: Props) {
    const { articlesTagId, articlesScreenId } = dvtvConfig

    return (
        <div className="example">
            <h2>Articles — Časopisy</h2>
            <p className="example-muted">
                The DVTV <code>/screens/casopisy</code> page is an <strong>EMBED</strong> screen (
                <code>{dvtvConfig.casopisyEmbedScreenId}</code>) with PDF magazines in an iframe — it
                has no rows and cannot be loaded via <code>useRowsInScreen</code>.
            </p>
            <p className="example-muted">
                For Tivio Articles (<code>/dvtv/articles/&#123;id&#125;</code>), use a filter row
                in Studio or <code>getArticlesByTagId</code> — configure <code>articlesScreenId</code>{' '}
                or <code>articlesTagId</code> in <code>src/config.ts</code>.
            </p>

            {articlesTagId ? (
                <ArticlesByTagList tagId={articlesTagId} onSelectArticle={onSelectArticle} />
            ) : articlesScreenId ? (
                <ArticlesByRowList
                    screenId={articlesScreenId}
                    rowId={dvtvConfig.articlesRowId || undefined}
                    onSelectArticle={onSelectArticle}
                />
            ) : (
                <p className="example-error">
                    Set <code>articlesTagId</code> or <code>articlesScreenId</code> in{' '}
                    <code>src/config.ts</code> (see comments there).
                </p>
            )}
        </div>
    )
}
