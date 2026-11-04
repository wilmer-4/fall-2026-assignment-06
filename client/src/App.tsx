import { BrowserRouter, Routes, Route } from 'react-router-dom'

import ArticleList from './pages/ArticleList'
import ArticleDetail from './pages/ArticleDetail'
import CreateArticle from './pages/CreateArticle'
import EditArticle from './pages/EditArticle'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ArticleList />} />
        <Route path="/articles/new" element={<CreateArticle />} />
        <Route path="/articles/:articleId" element={<ArticleDetail />} />
        <Route path="/articles/:articleId/edit" element={<EditArticle />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App