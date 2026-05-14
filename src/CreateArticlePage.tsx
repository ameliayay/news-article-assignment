import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { createArticle, updateArticle, fetchArticles } from './api'
import type { Article } from './article'

function makeId() {
  return Date.now().toString() + Math.random().toString(36).slice(2)
}

function CreateArticlePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const editId = searchParams.get('edit')
  const isEditing = editId !== null

  const [title, setTitle]         = useState('')
  const [summary, setSummary]     = useState('')
  const [date, setDate]           = useState('')
  const [publisher, setPublisher] = useState('')

  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [success, setSuccess]       = useState('') 
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!editId) return 
    fetchArticles().then((all: Article[]) => {
      const found = all.find(a => a.id === editId)
      if (found) {
        setTitle(found.title)
        setSummary(found.summary)
        setDate(found.date)
        setPublisher(found.publisher)
      }
    })
  }, [editId])

  function validate() {
    const errs: Record<string, string> = {}
    if (!title.trim())                   errs.title     = 'Title is required'
    else if (title.trim().length < 5)    errs.title     = 'Title must be at least 5 characters'
    if (!summary.trim())                 errs.summary   = 'Summary is required'
    else if (summary.trim().length < 20) errs.summary   = 'Summary must be at least 20 characters'
    if (!date)                           errs.date      = 'Date is required'
    if (!publisher.trim())               errs.publisher = 'Publisher is required'
    return errs
  }

  // ── Submit handler ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault() 

    const errs = validate()
    if (Object.keys(errs).length > 0) { 
      setErrors(errs)
      return
    }

    setErrors({})
    setSubmitting(true)

    const now = new Date().toISOString()

    try {
      if (isEditing && editId) {
        const existing = (await fetchArticles()).find(
          a => a.id === editId
        )
        if (!existing) return
        await updateArticle(editId, {
          ...existing,
          title,
          summary,
          date,
          publisher,
          updatedAt: now,
        })
        setSuccess('Article updated!')
        setTimeout(() => navigate('/articles'), 1000)

      } else {
        await createArticle({ id: makeId(), title, summary, date, publisher, createdAt: now, updatedAt: now })
        setSuccess('Article published!')
        setTitle(''); setSummary(''); setDate(''); setPublisher('')
      }
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' })
    }

    setSubmitting(false)
  }

  return (
    <main className="page">

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h1 className="page-title">{isEditing ? 'Update Article' : 'Publish New Article'}</h1>
            <p className="page-subtitle">
              {isEditing ? 'Make your changes and save.' : 'Fill in all fields to add an article.'}
            </p>
          </div>
          <Link to="/articles" className="btn btn-ghost" style={{ whiteSpace: 'nowrap' }}>
            See All Articles
          </Link>
        </div>
      </div>

      <div className="form-layout">

        <div>
          {success && (
            <div className="success-banner">
              <span>✓</span>
              <span>{success}</span>
            </div>
          )}

          {errors.submit && (
            <div className="error-state" style={{ marginBottom: '1rem' }}>
              <p>⚠ {errors.submit}</p>
            </div>
          )}

          <form className="form-card" onSubmit={handleSubmit} noValidate>

            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Article Title <span className="required">*</span>
              </label>
              <input
                id="title"
                type="text"
                className={`form-input${errors.title ? ' error' : ''}`}
                value={title}
                onChange={e => setTitle(e.target.value)}   // update state as user types
                placeholder="Enter a compelling headline…"
              />
              {errors.title
                ? <p className="form-error">⚠ {errors.title}</p>
                : <p className="field-hint">5–200 characters. Be clear and specific.</p>
              }
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="summary">
                Article Summary <span className="required">*</span>
              </label>
              <textarea
                id="summary"
                className={`form-textarea${errors.summary ? ' error' : ''}`}
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Write a concise summary of the article's key points…"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {errors.summary
                  ? <p className="form-error">⚠ {errors.summary}</p>
                  : <p className="field-hint">Min. 20 characters. Include who, what, when.</p>
                }
                {/* Character counter — turns red near the limit */}
                <p className={`char-count${summary.length > 1700 ? ' warn' : ''}${summary.length > 2000 ? ' over' : ''}`}>
                  {summary.length} / 2000
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="date">
                  Article Date <span className="required">*</span>
                </label>
                <input
                  id="date"
                  type="date"
                  className={`form-input${errors.date ? ' error' : ''}`}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
                {errors.date
                  ? <p className="form-error">⚠ {errors.date}</p>
                  : <p className="field-hint">The article's publication date.</p>
                }
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="publisher">
                  Publisher <span className="required">*</span>
                </label>
                <input
                  id="publisher"
                  type="text"
                  className={`form-input${errors.publisher ? ' error' : ''}`}
                  value={publisher}
                  onChange={e => setPublisher(e.target.value)}
                  placeholder="e.g. Reuters, BBC, AP"
                />
                {errors.publisher
                  ? <p className="form-error">⚠ {errors.publisher}</p>
                  : <p className="field-hint">The name of the news outlet or author.</p>
                }
              </div>

            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
                {submitting
                  ? (isEditing ? 'Saving…' : 'Publishing…')
                  : (isEditing ? '✓ Save Changes' : '✦ Publish Article')}
              </button>
              {!isEditing && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => { setTitle(''); setSummary(''); setDate(''); setPublisher(''); setErrors({}) }}
                >
                  Clear
                </button>
              )}
            </div>

          </form>
        </div>

        <div className="form-sidebar">
          <div className="tip-card" style={{ borderLeftColor: 'var(--ink-muted)' }}>
            <h3>Best Practices</h3>
            <ul>
              <li>Use active voice in headlines for impact.</li>
              <li>Keep summaries factual and neutral in tone.</li>
              <li>Double-check publication dates before submitting.</li>
              <li>Use the full publisher name for consistency.</li>
            </ul>
          </div>
        </div>

      </div>
    </main>
  )
}

export default CreateArticlePage