import { getDashboardStats, getRecentReports } from '@/lib/supabase/queries'

export default async function AdminPage() {
  const [stats, recentReports] = await Promise.all([
    getDashboardStats(),
    getRecentReports(),
  ])

  return (
    <div>
      <h1>관리자 대시보드</h1>

      {/* 통계 카드 */}
      <section>
        <h2>통계</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div>
            <p>아티스트</p>
            <p>{stats.artistCount}</p>
          </div>
          <div>
            <p>곡</p>
            <p>{stats.songCount}</p>
          </div>
          <div>
            <p>공연</p>
            <p>{stats.concertCount}</p>
          </div>
          <div>
            <p>한 줄 후기</p>
            <p>{stats.commentCount}</p>
          </div>
        </div>
      </section>

      {/* 최근 제보 리스트 */}
      <section>
        <h2>최근 영상 제보</h2>
        <table border={1}>
          <thead>
            <tr>
              <th>곡</th>
              <th>공연</th>
              <th>플랫폼</th>
              <th>상태</th>
              <th>신고수</th>
              <th>등록일</th>
            </tr>
          </thead>
          <tbody>
            {recentReports.length === 0 ? (
              <tr><td colSpan={6}>제보 없음</td></tr>
            ) : (
              recentReports.map((report) => (
                <tr key={report.id}>
                  <td>{report.setlist_items?.songs?.title ?? '-'}</td>
                  <td>{report.setlist_items?.concerts?.title ?? '-'}</td>
                  <td>{report.platform}</td>
                  <td>{report.status}</td>
                  <td>{report.report_count}</td>
                  <td>{report.created_at?.slice(0, 10)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}