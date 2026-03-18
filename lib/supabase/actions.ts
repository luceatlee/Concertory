'use server'

import { createClient } from './server'
import { revalidatePath } from 'next/cache'

// 아티스트 추가
export async function createArtist(formData: FormData) {
  const supabase = await createClient()

  const name_en = formData.get('name_en') as string
  
  const { error } = await supabase.from('artists').insert({
    name: formData.get('name') as string,
    name_en: name_en,
    slug: name_en.toLowerCase().replace(/\s+/g, '-'), // name_en 기반으로 slug 자동 생성
    type: formData.get('type') as string,
    theme_color: formData.get('theme_color') as string || null,
    debut_date: formData.get('debut_date') as string || null,
    is_active: formData.get('is_active') === 'true',
  })

  if (error) throw error
  revalidatePath('/admin/master')
}

// 멤버 추가
export async function createMember(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('members').insert({
    artist_id: formData.get('artist_id') as string,
    name: formData.get('name') as string,
    name_en: formData.get('name_en') as string,
    is_active: formData.get('is_active') === 'true',
  })

  if (error) throw error
  revalidatePath('/admin/master')
}

// 곡 추가
export async function createSong(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('songs').insert({
    artist_id: formData.get('artist_id') as string,
    title: formData.get('title') as string,
    title_en: formData.get('title_en') as string,
    release_date: formData.get('release_date') as string || null,
    cheer_guide: formData.get('cheer_guide') as string || null,
  })

  if (error) throw error
  revalidatePath('/admin/master')
}

// 영상 승인 (status: hidden → active)
export async function approveVideo(videoId: string) {
  'use server'
  const supabase = await createClient()

  const { error } = await supabase
    .from('song_videos')
    .update({ status: 'active', is_auto_hidden: false })
    .eq('id', videoId)

  if (error) throw error
  revalidatePath('/admin/reports')
}

// 영상 삭제 (status → deleted)
export async function deleteVideo(videoId: string) {
  'use server'
  const supabase = await createClient()

  const { error } = await supabase
    .from('song_videos')
    .update({ status: 'deleted' })
    .eq('id', videoId)

  if (error) throw error
  revalidatePath('/admin/reports')
}

// 공연 등록
export async function createConcert(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const { error } = await supabase.from('concerts').insert({
    artist_id: formData.get('artist_id') as string,
    title: formData.get('title') as string,
    tour_name: formData.get('tour_name') as string || null,
    date: formData.get('date') as string,
    venue: formData.get('venue') as string,
    city: formData.get('city') as string,
    country: formData.get('country') as string,
    total_duration_min: formData.get('total_duration_min')
      ? Number(formData.get('total_duration_min'))
      : null,
    day_sequence: formData.get('day_sequence')
      ? Number(formData.get('day_sequence'))
      : 1,
  })

  if (error) throw error
  revalidatePath('/admin/concerts')
}