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
    tour_name: (formData.get('tour_name') as string)?.trim() || null,
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

// 세트리스트 항목 추가
export async function createSetlistItem(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const { error } = await supabase.from('setlist_items').insert({
    concert_id: formData.get('concert_id') as string,
    song_id: formData.get('song_id') as string,
    order_num: Number(formData.get('order_num')),
    section: formData.get('section') as string || '메인',
    outfit_description: formData.get('outfit_description') as string || null,
    slogan_event: formData.get('slogan_event') as string || null,
    sing_along_event: formData.get('sing_along_event') as string || null,
  })

  if (error) throw error
  revalidatePath('/admin/master')
}

// 다른 공연에서 세트리스트 복사
export async function copySetlistFromConcert(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const target_concert_id = formData.get('target_concert_id') as string
  const source_concert_id = formData.get('source_concert_id') as string

  // 원본 세트리스트 가져오기
  const { data: sourceSetlist, error: fetchError } = await supabase
    .from('setlist_items')
    .select('*')
    .eq('concert_id', source_concert_id)
    .order('order_num')

  if (fetchError) throw fetchError
  if (!sourceSetlist || sourceSetlist.length === 0) throw new Error('복사할 세트리스트가 없습니다.')

  // 대상 공연에 복사 (곡 순서/섹션만, 의상/이벤트는 제외)
  const { error: insertError } = await supabase
    .from('setlist_items')
    .insert(
      sourceSetlist.map((item) => ({
        concert_id: target_concert_id,
        song_id: item.song_id,
        order_num: item.order_num,
        section: item.section,
        outfit_description: null,
        slogan_event: null,
        sing_along_event: null,
      }))
    )

  if (insertError) throw insertError
  revalidatePath('/admin/master/setlist')
}