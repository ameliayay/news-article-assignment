import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchArticles, deleteArticle, seedIfEmpty } from './api'
import type { Article } from './article'

function ArticlesPage() {
  const navigate = useNavigate()

  const [articles, setArticles]       = useState<Article[]>([])
  const [search, setSearch]           = useState('')
  const [deleteId, setDeleteId]       = useState<string | null>(null)
  const [viewArticle, setViewArticle] = useState<Article | null>(null) 
  const [currentPage, setCurrentPage] = useState(1)

  const PER_PAGE = 6

  useEffect(() => {
    seedIfEmpty()
    loadArticles()
  }, [])

  async function loadArticles() {
    const all = await fetchArticles()
    all.sort((a: Article, b: Article) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    setArticles(all)
  }

  async function handleDelete() {
    if (!deleteId) return
    await deleteArticle(deleteId)
    setDeleteId(null)
    loadArticles()
  }

  const filtered = articles.filter(a => {
    const q = search.toLowerCase()
    return (
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.publisher.toLowerCase().includes(q)
    )
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  function handleSearch(value: string) {
    setSearch(value)
    setCurrentPage(1)
  }

  return (
    <main className="page">

      <div className="articles-header">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">All Articles</h1>
        </div>

        <div className="articles-controls">
          <div className="search-wrapper">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search articles…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-ghost" onClick={loadArticles}>↻ Refresh</button>
          <Link to="/" className="btn btn-primary">✦ New Article</Link>
        </div>
      </div>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-value">{filtered.length}</span>
          <span className="stat-label">{search ? 'Results' : 'Total Articles'}</span>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-value">{totalPages || 1}</span>
          <span className="stat-label">Pages</span>
        </div>
        {search && (
          <>
            <div className="stat-divider" />
            <div className="stat" style={{ justifyContent: 'center' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => handleSearch('')}>
                ✕ Clear Search
              </button>
            </div>
          </>
        )}
      </div>

      <div className="articles-grid">
        {paginated.length === 0 ? (

          <div className="empty-state">
            <div className="empty-state-icon">📰</div>
            <h3>{search ? 'No Results Found' : 'No Articles Yet'}</h3>
            <p>
              {search
                ? `Nothing matched "${search}". Try a different term.`
                : 'The archive is empty. Publish your first article!'}
            </p>
            {!search && <Link to="/" className="btn btn-primary">✦ Publish First Article</Link>}
          </div>

        ) : paginated.map(article => (

          <article className="article-card" key={article.id}>
            <div className="article-card-header">

              <div className="article-meta">
                <span className="article-publisher">{article.publisher}</span>
                <span className="meta-dot" />
                <span className="article-date">
                  {new Date(article.date + 'T00:00:00').toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </span>
              </div>

              <h2 className="article-title">{article.title}</h2>

              <p className="article-summary">{article.summary}</p>

            </div>

            <div className="article-card-footer">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setViewArticle(article)}
                style={{ marginRight: 'auto' }}
              >
                Read All
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate(`/?edit=${article.id}`)}
              >
                ✎ Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setDeleteId(article.id)}
              >
                ✕ Delete
              </button>
            </div>
          </article>

        ))}
      </div>

      {totalPages > 1 && (
        <nav className="pagination">
          <button className="page-btn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`page-btn${p === currentPage ? ' active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
          ))}
          <button className="page-btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>›</button>
        </nav>
      )}

      {viewArticle && (
        <div className="modal-overlay" onClick={() => setViewArticle(null)}>
          <div
            className="modal"
            onClick={e => e.stopPropagation()} 
            style={{ maxWidth: '640px', maxHeight: '80vh', overflowY: 'auto' }}
          >
            <div className="article-meta" style={{ marginBottom: '0.75rem' }}>
              <span className="article-publisher">{viewArticle.publisher}</span>
              <span className="meta-dot" />
              <span className="article-date">
                {new Date(viewArticle.date + 'T00:00:00').toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', lineHeight: 1.25, marginBottom: '1.25rem' }}>
              {viewArticle.title}
            </h2>

            <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', lineHeight: 1.75, color: 'var(--ink-light)', whiteSpace: 'pre-wrap' }}>
              {viewArticle.summary}
            </p>

            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={() => setViewArticle(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Delete Article?</h2>
            <p>This cannot be undone. The article will be permanently removed.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete Article</button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}

export default ArticlesPage