import { getConcertById, getSetlistByConcert } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'
import ArtistTheme from '@/components/artist/ArtistTheme'

export default async function SetlistPage({
  params,
}: {
  params: Promise<{ slug: string; cid: string }>
}) {
  const { slug, cid } = await params
  const concert = await getConcertById(cid).catch(() => null)

  if (!concert) notFound()

  const setlist = await getSetlistByConcert(cid)

  // 섹션별 그룹핑
  const grouped = setlist.reduce<Record<string, typeof setlist>>((acc, item) => {
    const key = item.section ?? '메인'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div>
      <ArtistTheme themeColor={concert.artists?.theme_color ?? null} />

      {/* 공연 기본 정보 */}
      <section>
        <h1>{concert.title}</h1>
        <p>{concert.date} / {concert.venue}, {concert.city}</p>
        {concert.total_duration_min && (
          <p>총 공연 시간: {concert.total_duration_min}분</p>
        )}
      </section>

      {/* 세트리스트 */}
      <section>
        <h2>세트리스트 ({setlist.length}곡)</h2>
        {setlist.length === 0 ? (
          <p>등록된 세트리스트가 없습니다.</p>
        ) : (
          Object.entries(grouped).map(([section, items]) => (
            <div key={section}>
              <h3>{section}</h3>
              <ol>
                {items.map((item) => (
                  <li key={item.id}>
                    <a href={`/artist/${slug}/concert/${cid}/song/${item.id}`}>
                      {item.songs?.title}
                    </a>
                    {item.slogan_event && <span> 🎉 {item.slogan_event}</span>}
                    {item.sing_along_event && <span> 🎤 {item.sing_along_event}</span>}
                  </li>
                ))}
              </ol>
            </div>
          ))
        )}
      </section>

      {/* 네비게이션 */}
      <section>
        <a href={`/artist/${slug}/concert/${cid}`}>← 공연 홈</a>
      </section>
    </div>
  )
}