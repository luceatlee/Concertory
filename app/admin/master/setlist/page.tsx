import { getConcerts, getSetlistByConcert, getNextOrderNum, getRelatedArtistIds, getSongsByArtistIds } from '@/lib/supabase/queries'
import { createSetlistItem, copySetlistFromConcert } from '@/lib/supabase/actions'

export default async function AdminSetlistPage({
  searchParams,
}: {
  searchParams: Promise<{ concert_id?: string }>
}) {
  const { concert_id } = await searchParams
  const concerts = await getConcerts()

  const selectedConcert = concerts.find((c) => c.id === concert_id)

  const [setlist, nextOrderNum, songs] = concert_id
    ? await Promise.all([
        getSetlistByConcert(concert_id),
        getNextOrderNum(concert_id),
        getRelatedArtistIds(selectedConcert?.artist_id ?? '').then(getSongsByArtistIds),
      ])
    : [[], 1, []]

  // 같은 아티스트의 다른 공연 목록 (세트리스트가 있는 것만)
  const relatedConcerts = concerts.filter(
    (c) => c.artist_id === selectedConcert?.artist_id && c.id !== concert_id
  )

  return (
    <div>
      <h1>세트리스트 등록</h1>

      {/* 공연 선택 */}
      <section>
        <h2>공연 선택</h2>
        <form method="GET">
          <select name="concert_id" defaultValue={concert_id ?? ''}>
            <option value="">공연 선택</option>
            {concerts.map((concert) => (
              <option key={concert.id} value={concert.id}>
                {concert.artists?.name} — {concert.title} ({concert.date})
              </option>
            ))}
          </select>
          <button type="submit">선택</button>
        </form>
      </section>

      {/* 세트리스트 복사 */}
      {concert_id && setlist.length === 0 && relatedConcerts.length > 0 && (
        <section>
          <h2>다른 공연에서 세트리스트 복사</h2>
          <p>세트리스트가 비어있을 때만 표시돼요. 곡 순서·섹션만 복사되고 의상·이벤트는 비워둬요.</p>
          <form action={copySetlistFromConcert}>
            <input type="hidden" name="target_concert_id" value={concert_id} />
            <select name="source_concert_id" required>
              <option value="">복사할 공연 선택</option>
              {relatedConcerts.map((concert) => (
                <option key={concert.id} value={concert.id}>
                  {concert.title} ({concert.date})
                </option>
              ))}
            </select>
            <button type="submit">복사하기</button>
          </form>
        </section>
      )}

      {/* 세트리스트 등록 폼 */}
      {concert_id && (
        <section>
          <h2>{selectedConcert?.title} 세트리스트 등록</h2>
          <form action={createSetlistItem}>
            <input type="hidden" name="concert_id" value={concert_id} />
            <input type="hidden" name="order_num" value={nextOrderNum} />
            <p>순서: {nextOrderNum}</p>
            <select name="song_id" required>
              <option value="">곡 선택</option>
              {songs.map((song) => (
                <option key={song.id} value={song.id}>
                  [{song.artists?.name}] {song.title}
                </option>
              ))}
            </select>
            <input
              name="section"
              placeholder="섹션 (예: 메인, 앵콜1, 앵콜2)"
              defaultValue="메인"
            />
            <input name="outfit_description" placeholder="의상 설명 (선택)" />
            <input name="slogan_event" placeholder="슬로건 이벤트 (선택)" />
            <input name="sing_along_event" placeholder="떼창 이벤트 (선택)" />
            <button type="submit">추가</button>
          </form>
        </section>
      )}

      {/* 현재 세트리스트 */}
      {concert_id && (
        <section>
          <h2>현재 세트리스트 ({setlist.length}곡)</h2>
          <table border={1}>
            <thead>
              <tr>
                <th>순서</th>
                <th>섹션</th>
                <th>곡</th>
                <th>의상</th>
                <th>슬로건</th>
                <th>떼창</th>
              </tr>
            </thead>
            <tbody>
              {setlist.length === 0 ? (
                <tr><td colSpan={6}>등록된 세트리스트 없음</td></tr>
              ) : (
                setlist.map((item) => (
                  <tr key={item.id}>
                    <td>{item.order_num}</td>
                    <td>{item.section}</td>
                    <td>{item.songs?.title}</td>
                    <td>{item.outfit_description ?? '-'}</td>
                    <td>{item.slogan_event ?? '-'}</td>
                    <td>{item.sing_along_event ?? '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}