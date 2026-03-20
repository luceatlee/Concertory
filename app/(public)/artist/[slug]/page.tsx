import ArtistTheme from '@/components/artist/ArtistTheme'
import { getArtistBySlug, getConcertsByArtist } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const artist = await getArtistBySlug(slug).catch(() => null)

  if (!artist) notFound()

  const concerts = await getConcertsByArtist(artist.id)

  // 투어명으로 그룹핑
  const grouped = concerts.reduce<Record<string, typeof concerts>>((acc, concert) => {
    const key = concert.tour_name ?? concert.title
    if (!acc[key]) acc[key] = []
    acc[key].push(concert)
    return acc
  }, {})

  return (
    <div>
        <ArtistTheme themeColor={artist.theme_color} />
      {/* 아티스트 기본 정보 */}
      <section>
        <h1 style={{ color: 'var(--theme)' }}>{artist.name}</h1>
        <p>{artist.name_en}</p>
        <p>타입: {artist.type}</p>
        <p>데뷔일: {artist.debut_date}</p>
        <p>테마색: {artist.theme_color}</p>
        <p>활동여부: {artist.is_active ? '활동중' : '비활동'}</p>
      </section>

      {/* 공연 목록 — 투어명으로 그룹핑 + 아코디언 */}
      <section>
        <h2>공연 목록 ({concerts.length})</h2>
        {Object.keys(grouped).length === 0 ? (
          <p>등록된 공연이 없습니다.</p>
        ) : (
          Object.entries(grouped).map(([tourName, tourConcerts]) => (
            <details key={tourName}>
              <summary>
                {tourName} ({tourConcerts.length}회)
              </summary>
              <ul>
                {tourConcerts.map((concert) => (
                  <li key={concert.id}>
                    <a href={`/artist/${slug}/concert/${concert.id}`}>
                      {concert.title} — {concert.date} / {concert.venue}, {concert.city}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          ))
        )}
      </section>
    </div>
  )
}