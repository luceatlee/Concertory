import { getConcerts, getArtists } from '@/lib/supabase/queries'
import { createConcert } from '@/lib/supabase/actions'

export default async function AdminConcertsPage() {
  const [concerts, artists] = await Promise.all([
    getConcerts(),
    getArtists(),
  ])

  return (
    <div>
      <h1>공연 등록</h1>

      {/* 공연 등록 폼 */}
      <section>
        <h2>새 공연 등록</h2>
        <form action={createConcert}>
          <select name="artist_id" required>
            <option value="">아티스트 선택</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
          <input name="title" placeholder="공연 타이틀 (예: 2024 aespa WORLD TOUR - 서울 DAY 1)" required />
          <input name="tour_name" placeholder="투어명 (예: 2024 aespa WORLD TOUR)" />
          <input name="date" type="date" required />
          <input name="venue" placeholder="공연장명 (예: KSPO DOME)" required />
          <input name="city" placeholder="도시 (예: 서울)" required />
          <input name="country" placeholder="국가 (예: 대한민국)" required />
          <input name="total_duration_min" type="number" placeholder="총 공연 시간(분)" />
          <input name="day_sequence" type="number" placeholder="DAY (예: 1)" defaultValue={1} />
          <button type="submit">공연 등록</button>
        </form>
      </section>

      {/* 공연 목록 */}
      <section>
        <h2>공연 목록 ({concerts.length})</h2>
        <table border={1}>
          <thead>
            <tr>
              <th>아티스트</th>
              <th>공연명</th>
              <th>투어명</th>
              <th>날짜</th>
              <th>공연장</th>
              <th>도시</th>
              <th>국가</th>
              <th>시간(분)</th>
              <th>DAY</th>
            </tr>
          </thead>
          <tbody>
            {concerts.length === 0 ? (
              <tr><td colSpan={9}>공연 없음</td></tr>
            ) : (
              concerts.map((concert) => (
                <tr key={concert.id}>
                  <td>{concert.artists?.name}</td>
                  <td>{concert.title}</td>
                  <td>{concert.tour_name ?? '-'}</td>
                  <td>{concert.date}</td>
                  <td>{concert.venue}</td>
                  <td>{concert.city}</td>
                  <td>{concert.country}</td>
                  <td>{concert.total_duration_min ?? '-'}</td>
                  <td>{concert.day_sequence}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}