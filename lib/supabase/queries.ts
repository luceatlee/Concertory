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

// 제보 리스트 전체 조회 (관리자용)
export async function getVideoReports() {
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

  if (error) throw error
  return data
}

// 공연 전체 조회 (관리자용)
export async function getConcerts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('concerts')
    .select('*, artists(name)')
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

// 세트리스트 조회 (공연별)
export async function getSetlistByConcert(concertId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('setlist_items')
    .select('*, songs(title)')
    .eq('concert_id', concertId)
    .order('order_num')

  if (error) throw error
  return data
}

// 다음 순서 번호 자동 계산
export async function getNextOrderNum(concertId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('setlist_items')
    .select('order_num')
    .eq('concert_id', concertId)
    .order('order_num', { ascending: false })
    .limit(1)

  if (error) throw error
  return data.length > 0 ? data[0].order_num + 1 : 1
}

// 아티스트 관련 그룹 ID 찾기
export async function getRelatedArtistIds(artistId: string) {
  const supabase = await createClient()

  // 해당 아티스트 정보 확인
  const { data: artist } = await supabase
    .from('artists')
    .select('type, name_en')
    .eq('id', artistId)
    .single()

  if (artist?.type !== 'solo') return [artistId]

  // 솔로 아티스트 이름으로 멤버 테이블에서 소속 그룹 찾기
  const { data: members } = await supabase
    .from('members')
    .select('artist_id')
    .ilike('name_en', `%${artist.name_en}%`)

  const groupIds = members?.map((m) => m.artist_id) ?? []
  return [artistId, ...groupIds]
}

// 아티스트 관련 곡 전체 조회 (본인 + 소속 그룹)
export async function getSongsByArtistIds(artistIds: string[]) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('songs')
    .select('*, artists(name)')
    .in('artist_id', artistIds)
    .order('title')

  if (error) throw error
  return data
}

// slug로 아티스트 정보 조회
export async function getArtistBySlug(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data
}

// 아티스트별 공연 목록 조회 (투어명으로 그룹핑용)
export async function getConcertsByArtist(artistId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('concerts')
    .select('*')
    .eq('artist_id', artistId)
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

// 공연 상세 정보 조회
export async function getConcertById(concertId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('concerts')
    .select('*, artists(name, slug, theme_color)')
    .eq('id', concertId)
    .single()

  if (error) throw error
  return data
}

// 세트리스트 항목 단건 조회 (곡 상세용)
export async function getSetlistItemById(itemId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('setlist_items')
    .select(`
      *,
      songs ( * ),
      concerts ( title, date, venue, city, artist_id,
        artists ( name, slug, theme_color )
      )
    `)
    .eq('id', itemId)
    .single()

  if (error) throw error
  return data
}

// 이 곡이 등장한 다른 공연들
export async function getOtherAppearances(songId: string, currentItemId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('setlist_items')
    .select(`
      id, order_num,
      concerts ( id, title, date, tour_name, artist_id,
        artists ( slug )
      )
    `)
    .eq('song_id', songId)
    .neq('id', currentItemId)
    .order('id')

  if (error) throw error
  return data
}

// 곡별 한 줄 후기 조회
export async function getSongComments(itemId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('song_comments')
    .select('*')
    .eq('setlist_item_id', itemId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// 곡별 현장 영상 조회
export async function getSongVideos(itemId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('song_videos')
    .select('*')
    .eq('setlist_item_id', itemId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}