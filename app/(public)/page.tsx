import { getArtists, getRecentConcerts } from '@/lib/supabase/queries'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ artist?: string }>
}) {
  const { artist } = await searchParams
  const [artists, recentConcerts] = await Promise.all([
    getArtists(),
    getRecentConcerts(),
  ])

  // 아티스트 필터 적용
  const filteredConcerts = artist
    ? recentConcerts.filter((c) => c.artists?.slug === artist)
    : recentConcerts

  // 투어명으로 그룹핑
  const grouped = filteredConcerts.reduce<Record<string, typeof filteredConcerts>>((acc, concert) => {
    const key = `${concert.artists?.slug}__${concert.tour_name ?? concert.title}`
    if (!acc[key]) acc[key] = []
    acc[key].push(concert)
    return acc
  }, {})

  return (
    <div>
      <h1>CONCERTORY</h1>

      {/* 아티스트 필터 */}
      <section>
        <h2>아티스트</h2>
        <a href="/">전체</a>
        {artists.map((a) => (
          <a key={a.id} href={`/?artist=${a.slug}`}>
            {a.name}
          </a>
        ))}
      </section>

      {/* 최근 공연 */}
      <section>
        <h2>최근 공연 {artist && `— ${artists.find((a) => a.slug === artist)?.name}`}</h2>
        {Object.keys(grouped).length === 0 ? (
          <p>등록된 공연이 없습니다.</p>
        ) : (
          Object.entries(grouped).map(([key, concerts]) => {
            const first = concerts[0]
            const tourName = first.tour_name ?? first.title
            return (
              <details key={key}>
                <summary>
                  {first.artists?.name} — {tourName} ({concerts.length}회)
                </summary>
                <ul>
                  {concerts.map((concert) => (
                    <li key={concert.id}>
                      <a href={`/artist/${concert.artists?.slug}/concert/${concert.id}`}>
                        {concert.title} — {concert.date} / {concert.venue}, {concert.city}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            )
          })
        )}
      </section>
    </div>
  )
}