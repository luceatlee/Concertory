import { getArtists, getMembers, getSongs } from '@/lib/supabase/queries'
import { createArtist, createMember, createSong } from '@/lib/supabase/actions'

export default async function AdminMasterPage() {
  const [artists, members, songs] = await Promise.all([
    getArtists(),
    getMembers(),
    getSongs(),
  ])

  return (
    <div>
      <h1>마스터 데이터 관리</h1>

      {/* 아티스트 */}
      <section>
        <h2>아티스트 ({artists.length})</h2>

        <form action={createArtist}>
          <input name="name" placeholder="이름 (예: aespa)" required />
          <input name="name_en" placeholder="영문명 (예: aespa)" />
          <select name="type" required>
            <option value="group">그룹</option>
            <option value="solo">솔로</option>
            <option value="unit">유닛</option>
          </select>
          <input name="theme_color" placeholder="테마색 (#HEX)" />
          <input name="debut_date" type="date" placeholder="데뷔일" />
          <select name="is_active">
            <option value="true">활동중</option>
            <option value="false">비활동</option>
          </select>
          <button type="submit">아티스트 추가</button>
        </form>

        <table border={1}>
          <thead>
            <tr>
              <th>이름</th>
              <th>영문명</th>
              <th>타입</th>
              <th>테마색</th>
              <th>활동여부</th>
            </tr>
          </thead>
          <tbody>
            {artists.length === 0 ? (
              <tr><td colSpan={5}>데이터 없음</td></tr>
            ) : (
              artists.map((artist) => (
                <tr key={artist.id}>
                  <td>{artist.name}</td>
                  <td>{artist.name_en}</td>
                  <td>{artist.type}</td>
                  <td>{artist.theme_color}</td>
                  <td>{artist.is_active ? '활동' : '비활동'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* 멤버 */}
      <section>
        <h2>멤버 ({members.length})</h2>

        <form action={createMember}>
          <select name="artist_id" required>
            <option value="">아티스트 선택</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
          <input name="name" placeholder="이름 (예: 카리나)" required />
          <input name="name_en" placeholder="영문명 (예: Karina)" />
          <select name="is_active">
            <option value="true">활동중</option>
            <option value="false">비활동</option>
          </select>
          <button type="submit">멤버 추가</button>
        </form>

        <table border={1}>
          <thead>
            <tr>
              <th>이름</th>
              <th>영문명</th>
              <th>아티스트</th>
              <th>활동여부</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr><td colSpan={4}>데이터 없음</td></tr>
            ) : (
              members.map((member) => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.name_en}</td>
                  <td>{member.artists?.name}</td>
                  <td>{member.is_active ? '활동' : '비활동'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* 곡 */}
      <section>
        <h2>곡 ({songs.length})</h2>

        <form action={createSong}>
          <select name="artist_id" required>
            <option value="">아티스트 선택</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
          <input name="title" placeholder="제목 (예: Supernova)" required />
          <input name="title_en" placeholder="영문제목" />
          <input name="release_date" type="date" placeholder="발매일" />
          <input name="cheer_guide" placeholder="응원법" />
          <button type="submit">곡 추가</button>
        </form>

        <table border={1}>
          <thead>
            <tr>
              <th>제목</th>
              <th>영문제목</th>
              <th>아티스트</th>
              <th>발매일</th>
            </tr>
          </thead>
          <tbody>
            {songs.length === 0 ? (
              <tr><td colSpan={4}>데이터 없음</td></tr>
            ) : (
              songs.map((song) => (
                <tr key={song.id}>
                  <td>{song.title}</td>
                  <td>{song.title_en}</td>
                  <td>{song.artists?.name}</td>
                  <td>{song.release_date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}