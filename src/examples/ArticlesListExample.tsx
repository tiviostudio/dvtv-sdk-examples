import { useItemsInRow, useRowsInScreen, ROW_ITEM_TYPES } from '@tivio/sdk-react'
import { useMemo } from 'react'

import { dvtvConfig } from '../config'

type Props = {
    onSelectArticle: (articleId: string) => void
}

export function ArticlesListExample({ onSelectArticle }: Props) {
    const { pagination: rowsPagination, error: rowsError } = useRowsInScreen(
        dvtvConfig.magazinesScreenId,
        { noLimit: true },
    )

    const rowId = dvtvConfig.magazinesRowId || rowsPagination?.items?.[0]?.rowId || ''

    const { pagination, error: itemsError } = useItemsInRow({
        rowId,
        options: { noLimit: true },
    })

    const articles = useMemo(
        () => pagination?.items?.filter((item) => item.itemType === ROW_ITEM_TYPES.ARTICLE) ?? [],
        [pagination?.items],
    )

    return (
        <div className="example">
            <h2>Articles — Časopisy</h2>
            <p className="example-muted">
                Screen <code>{dvtvConfig.magazinesScreenId}</code>
                {rowId ? <> · row <code>{rowId}</code></> : ' · waiting for row…'}
            </p>
            <p className="example-muted">
                <code>useRowsInScreen</code>, <code>useItemsInRow</code> — set ids in <code>src/config.ts</code>
            </p>

            {(rowsError || itemsError) && (
                <p className="example-error">{rowsError?.message ?? itemsError?.message}</p>
            )}

            {pagination?.loading && <p>Loading items…</p>}

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
                        {'cover' in article && article.cover && (
                            <img src={article.cover} alt="" />
                        )}
                        <div>
                            <h3>{article.name}</h3>
                            {'description' in article && article.description && (
                                <p>{article.description}</p>
                            )}
                            <p className="example-muted">id: {article.id}</p>
                        </div>
                    </div>
                ))}
            </div>

            {!pagination?.loading && articles.length === 0 && (
                <p className="example-muted">No articles in row. Check screen/row ids in config.</p>
            )}
        </div>
    )
}
