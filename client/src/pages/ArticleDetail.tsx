
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Article } from './ArticleList'

const API = 'http://localhost:8080'

export default function ArticleDetail() {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState<Article | null>(null)
  const [error, setError] = useState('')

  
useEffect(() => {
  fetch(`http://localhost:8080/articles/${articleId}`)
    .then(res => {
      if (!res.ok) throw new Error('Could not load article')
      return res.json()
    })
    .then(setArticle)
    .catch(err => console.error(err))
}, [articleId])

  async function deleteArticle() {
    if (!window.confirm('Delete this article?')) return

    const response = await fetch(`${API}/articles/${articleId}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      navigate('/')
    } else {
      setError('Could not delete article')
    }
  }

  if (error) return <p>{error}</p>
  if (!article) return <p>Loading article...</p>

  return (
    <main>
      <Link to="/">← Back to Articles</Link>
      <h1>{article.title}</h1>
      <p>{article.contents}</p>

      <button onClick={() => navigate(`/articles/${articleId}/edit`)}>
        Edit
      </button>

      <button onClick={deleteArticle}>
        Delete
      </button>

      <section>
        <h2>Comments</h2>
        <p>Comments will appear here.</p>
      </section>
    </main>
  )
}
