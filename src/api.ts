import axios from 'axios'
import type { Article } from './article'

// ── Connect to Supabase ──────────────────────────────────────
const api = axios.create({
  baseURL: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`,
  headers: {
    apikey:          import.meta.env.VITE_SUPABASE_ANON_KEY,
    Authorization:  `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    Prefer:         'return=representation',
  },
})

// ── Seed demo data if table is empty ────────────────────────
export async function seedIfEmpty() {
  const { data } = await api.get<Article[]>('/articles?limit=1')
  if (data.length > 0) return

  const now = new Date().toISOString()
  await api.post('/articles', [
    {
      id: '1',
      title: 'Global Climate Summit Reaches Historic Agreement',
      summary: 'World leaders at the UN Climate Summit have agreed to a landmark deal to reduce carbon emissions by 50% before 2035.',
      date: '2026-05-10',
      publisher: 'Reuters',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '2',
      title: 'Breakthrough in Quantum Computing Announced',
      summary: 'Researchers at MIT achieved a significant breakthrough in quantum computing.',
      date: '2026-05-08',
      publisher: 'MIT Technology Review',
      createdAt: now,
      updatedAt: now,
    },
  ])
}

// ── Fetch all articles ───────────────────────────────────────
export async function fetchArticles(): Promise<Article[]> {
  const { data } = await api.get<Article[]>('/articles?order=updatedAt.desc')
  return data
}

// ── Create a new article ─────────────────────────────────────
export async function createArticle(article: Article): Promise<void> {
  await api.post('/articles', article)
}

// ── Update an existing article ───────────────────────────────
export async function updateArticle(id: string, article: Article): Promise<void> {
  await api.patch(`/articles?id=eq.${id}`, article)
}

// ── Delete an article ────────────────────────────────────────
export async function deleteArticle(id: string): Promise<void> {
  await api.delete(`/articles?id=eq.${id}`)
}