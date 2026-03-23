import { getCurrentUser, getMyConcertLogs } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'

export default async function MyPage() {
  const user = await getCurrentUser()

  if (!user) redirect('/login')

  const logs = await getMyConcertLogs(user.id)

  // 아티스트별 필터용
  const artistSet = new Set(logs.map((log) => log.concerts?.artists?.slug).filter(Boolean))
  const artistList = [...artistSet]

  return (
    <div>
      <h1>마이페이지</h1>
      <p>환영합니다!</p>

      {/* 참석 공연 리스트 */}
      <section>
        <h2>내 공연 리스트 ({logs.length})</h2>
        {logs.length === 0 ? (
          <p>참석한 공연이 없습니다.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id}>
              <p>
                <a href={`/artist/${log.concerts?.artists?.slug}/concert/${log.concert_id}`}>
                  {log.concerts?.artists?.name} — {log.concerts?.title}
                </a>
              </p>
              <p>{log.concerts?.date} / {log.concerts?.venue}, {log.concerts?.city}</p>
              {log.seat && <p>좌석: {log.seat}</p>}
              {log.emotion && <p>감정: {log.emotion}</p>}
            </div>
          ))
        )}
      </section>
    </div>
  )
}