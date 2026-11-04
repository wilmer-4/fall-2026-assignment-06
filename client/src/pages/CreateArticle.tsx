import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API = 'http://localhost:8080'

export default function CreateArticle() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [contents, setContents] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!title.trim() || !contents.trim()) {
      setError('Please enter both a title and article contents.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          contents: contents.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Could not create article.')
      }

      const article = await response.json()
      navigate(`/articles/${article.articleId}`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="create-article-page">
      <Link to="/">← Back to Articles</Link>

      <h1>Create Article</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter article title"
          />
        </div>

        <div>
          <label htmlFor="contents">Contents</label>
          <textarea
            id="contents"
            value={contents}
            onChange={e => setContents(e.target.value)}
            placeholder="Write your article..."
            rows={8}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Article'}
        </button>
      </form>
    </main>
  )
}