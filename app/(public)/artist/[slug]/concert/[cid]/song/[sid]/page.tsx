import { getSetlistItemById, getOtherAppearances, getSongComments, getSongVideos } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'
import ArtistTheme from '@/components/artist/ArtistTheme'

export default async function SongPage({
  params,
}: {
  params: Promise<{ slug: string; cid: string; sid: string }>
}) {
  const { slug, cid, sid } = await params
  const item = await getSetlistItemById(sid).catch(() => null)

  if (!item) notFound()

  const [appearances, comments, videos] = await Promise.all([
    getOtherAppearances(item.song_id ?? '', sid),
    getSongComments(sid),
    getSongVideos(sid),
  ])

  return (
    <div>
      <ArtistTheme themeColor={item.concerts?.artists?.theme_color ?? null} />

      {/* 곡 기본 정보 */}
      <section>
        <h1>{item.songs?.title}</h1>
        <p>{item.concerts?.title} — {item.concerts?.date}</p>
        <p>섹션: {item.section} / 순서: {item.order_num}번</p>
        {item.outfit_description && <p>의상: {item.outfit_description}</p>}
        {item.slogan_event && <p>슬로건: {item.slogan_event}</p>}
        {item.sing_along_event && <p>떼창: {item.sing_along_event}</p>}
      </section>

      {/* Live Footage */}
      <section>
        <h2>Live Footage</h2>
        {videos.length === 0 ? (
          <p>등록된 영상이 없습니다.</p>
        ) : (
          videos.map((video) => (
            <div key={video.id}>
              <a href={video.video_url} target="_blank" rel="noreferrer">
                [{video.platform}] {video.title ?? video.video_url}
              </a>
            </div>
          ))
        )}
      </section>

      {/* Fan Reviews */}
      <section>
        <h2>Fan Reviews ({comments.length})</h2>
        {comments.length === 0 ? (
          <p>등록된 후기가 없습니다.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id}>
              <p>{comment.users?.nickname} — {comment.content}</p>
              <p>{comment.created_at?.slice(0, 10)}</p>
            </div>
          ))
        )}
      </section>

      {/* Other Appearances */}
      <section>
        <h2>이 곡이 등장한 다른 공연들 ({appearances.length})</h2>
        {appearances.length === 0 ? (
          <p>다른 공연 기록이 없습니다.</p>
        ) : (
          Object.entries(
            appearances.reduce<Record<string, typeof appearances>>((acc, appearance) => {
              const key = appearance.concerts?.tour_name ?? appearance.concerts?.title ?? '단독 공연'
              if (!acc[key]) acc[key] = []
              acc[key].push(appearance)
              return acc
            }, {})
          ).map(([tourName, items]) => (
            <div key={tourName}>
              <h3>{tourName} ({items.length}회)</h3>
              <ul>
                {items.map((appearance) => (
                  <li key={appearance.id}>
                    <a href={`/artist/${appearance.concerts?.artists?.slug}/concert/${appearance.concerts?.id}/song/${appearance.id}`}>
                      {appearance.concerts?.title} — {appearance.concerts?.date} ({appearance.order_num}번)
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      {/* 네비게이션 */}
      <section>
        <a href={`/artist/${slug}/concert/${cid}/setlist`}>← 세트리스트</a>
      </section>
    </div>
  )
}