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