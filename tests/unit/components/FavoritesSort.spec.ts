import { describe, it, expect } from 'vitest'

type SortablePost = {
  city?: string
  favorites_created_at?: string
  user?: { display_name?: string; username?: string }
}

function sortPosts(posts: SortablePost[], sortBy: 'date' | 'city' | 'artist'): SortablePost[] {
  const list = [...posts]
  if (sortBy === 'city') {
    return list.sort((a, b) => (a.city ?? '').localeCompare(b.city ?? ''))
  }
  if (sortBy === 'artist') {
    const name = (p: SortablePost) => p.user?.display_name ?? p.user?.username ?? ''
    return list.sort((a, b) => name(a).localeCompare(name(b)))
  }
  return list
}

const posts: SortablePost[] = [
  { city: 'Miami', user: { display_name: 'Zara' }, favorites_created_at: '2024-01-03' },
  { city: 'Atlanta', user: { display_name: 'Abel' }, favorites_created_at: '2024-01-01' },
  { city: 'Brooklyn', user: { display_name: 'Maya' }, favorites_created_at: '2024-01-02' },
]

describe('favorites sort', () => {
  it('date sort preserves original order', () => {
    const result = sortPosts(posts, 'date')
    expect(result[0].city).toBe('Miami')
    expect(result[1].city).toBe('Atlanta')
    expect(result[2].city).toBe('Brooklyn')
  })

  it('city sort sorts A-Z', () => {
    const result = sortPosts(posts, 'city')
    expect(result[0].city).toBe('Atlanta')
    expect(result[1].city).toBe('Brooklyn')
    expect(result[2].city).toBe('Miami')
  })

  it('artist sort sorts A-Z by display_name', () => {
    const result = sortPosts(posts, 'artist')
    expect(result[0].user?.display_name).toBe('Abel')
    expect(result[1].user?.display_name).toBe('Maya')
    expect(result[2].user?.display_name).toBe('Zara')
  })

  it('artist sort falls back to username when display_name missing', () => {
    const fallback: SortablePost[] = [
      { user: { username: 'zuser' } },
      { user: { username: 'auser' } },
    ]
    const result = sortPosts(fallback, 'artist')
    expect(result[0].user?.username).toBe('auser')
  })

  it('city sort handles missing city', () => {
    const withMissing: SortablePost[] = [
      { city: 'Miami' },
      { city: undefined },
      { city: 'Atlanta' },
    ]
    const result = sortPosts(withMissing, 'city')
    expect(result[0].city).toBeUndefined()
    expect(result[1].city).toBe('Atlanta')
    expect(result[2].city).toBe('Miami')
  })
})
