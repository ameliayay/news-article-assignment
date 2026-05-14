import axios from 'axios'
import type { Article } from './article'

axios.create({
  baseURL: '/',
})

const STORAGE_KEY = 'news_articles'

// GET articles from localStorage
function getStored(): Article[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

// SAVE articles into localStorage
function saveStored(articles: Article[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles))
}

// Seed demo data
export function seedIfEmpty() {
  if (getStored().length > 0) return

  const now = new Date().toISOString()

  saveStored([
    {
      id: '1',
      title: 'Global Climate Summit Reaches Historic Agreement',
      summary:
        'World leaders at the UN Climate Summit have agreed to a landmark deal to reduce carbon emissions by 50% before 2035.',
      date: '2026-05-10',
      publisher: 'Reuters',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '2',
      title: 'Breakthrough in Quantum Computing Announced',
      summary:
        'Researchers at MIT achieved a significant breakthrough in quantum computing.',
      date: '2026-05-08',
      publisher: 'MIT Technology Review',
      createdAt: now,
      updatedAt: now,
    },
  ])
}

// FETCH articles
export async function fetchArticles(): Promise<Article[]> {
  return getStored()
}

// CREATE article
export async function createArticle(
  article: Article
): Promise<void> {

  const current = getStored()

  saveStored([article, ...current])
}

// UPDATE article
export async function updateArticle(
  id: string,
  updatedArticle: Article
): Promise<void> {

  const updated = getStored().map((article) =>
    article.id === id ? updatedArticle : article
  )

  saveStored(updated)
}

// DELETE article
export async function deleteArticle(
  id: string
): Promise<void> {

  const filtered = getStored().filter(
    (article) => article.id !== id
  )

  saveStored(filtered)
}