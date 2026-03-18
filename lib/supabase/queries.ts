import { createClient } from './server'

// 아티스트 전체 조회
export async function getArtists() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

// 멤버 전체 조회 (아티스트 정보 포함)
export async function getMembers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('members')
    .select('*, artists(name)')
    .order('name')
  if (error) throw error
  return data
}

// 곡 전체 조회 (아티스트 정보 포함)
export async function getSongs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('songs')
    .select('*, artists(name)')
    .order('title')
  if (error) throw error
  return data
}

// 대시보드 통계
export async function getDashboardStats() {
  const supabase = await createClient()

  const [
    { count: artistCount },
    { count: songCount },
    { count: concertCount },
    { count: commentCount },
  ] = await Promise.all([
    supabase.from('artists').select('*', { count: 'exact', head: true }),
    supabase.from('songs').select('*', { count: 'exact', head: true }),
    supabase.from('concerts').select('*', { count: 'exact', head: true }),
    supabase.from('song_comments').select('*', { count: 'exact', head: true }),
  ])

  return {
    artistCount: artistCount ?? 0,
    songCount: songCount ?? 0,
    concertCount: concertCount ?? 0,
    commentCount: commentCount ?? 0,
  }
}

// 최근 제보 리스트 (song_videos 중 최근 10개)
export async function getRecentReports() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('song_videos')
    .select(`
      *,
      setlist_items (
        order_num,
        concerts ( title, date ),
        songs ( title )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) throw error
  return data
}