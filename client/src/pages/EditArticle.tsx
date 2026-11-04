import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const API = 'http://localhost:8080'

export default function EditArticle() {
  const { articleId } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [contents, setContents] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Load existing article
  useEffect(() => {
    async function fetchArticle() {
      try {
        const response = await fetch(`${API}/articles/${articleId}`)

        if (!response.ok) {
          throw new Error('Could not load article.')
        }

        const article = await response.json()
        setTitle(article.title)
        setContents(article.contents)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [articleId])

  // Save changes
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!title.trim() || !contents.trim()) {
      setError('Please enter both a title and contents.')
      return
    }

    try {
      setError('')

      const response = await fetch(`${API}/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          contents: contents.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Could not update article.')
      }

      navigate(`/articles/${articleId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (loading) return <p>Loading article...</p>

  return (
    <main className="edit-article-page">
      <Link to={`/articles/${articleId}`}>← Back to Article</Link>

      <h1>Edit Article</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="contents">Contents</label>
          <textarea
            id="contents"
            rows={8}
            value={contents}
            onChange={e => setContents(e.target.value)}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit">Save Changes</button>
      </form>
    </main>
  )
}