import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CreateArticlePage from './CreateArticlePage'
import ArticlesPage from './ArticlesPage'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Routes>
          <Route path="/"         element={<CreateArticlePage />} />
          <Route path="/articles" element={<ArticlesPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
