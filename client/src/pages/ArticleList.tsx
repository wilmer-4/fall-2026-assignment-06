import { useEffect, useState, useRef, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export interface Article {
  articleId: number
  title: string
  contents: string
}

const API_BASE_URL = 'http://localhost:8080'

function truncate(text: string, maxLength: number = 160): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}...`
}

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState<string>('')
  const [activeSearch, setActiveSearch] = useState<string>('')

  const navigate = useNavigate()
  const abortControllerRef = useRef<AbortController | null>(null)
  const isFirstRender = useRef<boolean>(true)

  const fetchArticles = async (titleQuery?: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    setError(null)
    try {
      const url = new URL(`${API_BASE_URL}/articles`)
      const trimmedQuery = titleQuery ? titleQuery.trim() : ''
      if (trimmedQuery !== '') {
        url.searchParams.set('title_contains', trimmedQuery)
      }

      const response = await fetch(url.toString(), { signal: controller.signal })
      if (!response.ok) {
        throw new Error(`Failed to fetch articles (status ${response.status})`)
      }

      //const data: Article[] = await response.json()
      const data = await response.json()
      console.log('ARTICLES RESPONSE:', data)

      setArticles(data)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred while loading articles.')
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false)
      }
    }
  }

  // Fetch all articles immediately on mount; debounce subsequent search input changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      fetchArticles()
      return
    }

    const query = searchInput.trim()
    const timer = setTimeout(() => {
      setActiveSearch(query)
      fetchArticles(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const query = searchInput.trim()
    setActiveSearch(query)
    fetchArticles(query)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setActiveSearch('')
    fetchArticles('')
  }

  return (
    <div className="article-list-page">
      <header className="page-header">
        <div className="header-title-row">
          <h1>Articles</h1>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/articles/new')}
            aria-label="Create Article"
          >
            + Create Article
          </button>
        </div>

        <form className="search-form" onSubmit={handleSearchSubmit} role="search">
          <input
            type="text"
            className="search-input"
            placeholder="Search articles by title..."
            aria-label="Search articles by title"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
          {searchInput && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleClearSearch}
            >
              Clear
            </button>
          )}
        </form>

        {activeSearch && !loading && (
          <p className="search-status">
            Showing results for: <strong>"{activeSearch}"</strong>
          </p>
        )}
      </header>

      <main className="articles-container">
        {loading && (
          <div className="state-message">
            <p>Loading articles...</p>
          </div>
        )}

        {error && (
          <div className="state-message error-box">
            <p>{error}</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fetchArticles(activeSearch)}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="state-message empty-box">
            <p>
              {activeSearch
                ? `No articles found matching "${activeSearch}".`
                : 'No articles have been created yet.'}
            </p>
            {activeSearch ? (
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleClearSearch}
              >
                Reset Search
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/articles/new')}
              >
                Create your first article
              </button>
            )}
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div className="article-cards-grid">
            {articles.map((article) => (
              <article key={article.articleId} className="article-card">
                <h2 className="article-card-title">{article.title}</h2>
                <p className="article-card-preview">
                  {truncate(article.contents, 160)}
                </p>
                <div className="article-card-actions">
                  <Link
                    to={`/articles/${article.articleId}`}
                    className="btn btn-link"
                    aria-label={`Read article: ${article.title}`}
                  >
                    Read More &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
