import { getVideoReports } from '@/lib/supabase/queries'
import { approveVideo, deleteVideo } from '@/lib/supabase/actions'

export default async function AdminReportsPage() {
  const reports = await getVideoReports()

  return (
    <div>
      <h1>제보 관리</h1>

      <table border={1}>
        <thead>
          <tr>
            <th>곡</th>
            <th>공연</th>
            <th>공연일</th>
            <th>플랫폼</th>
            <th>URL</th>
            <th>상태</th>
            <th>신고수</th>
            <th>등록일</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr><td colSpan={9}>제보 없음</td></tr>
          ) : (
            reports.map((report) => (
              <tr key={report.id}>
                <td>{report.setlist_items?.songs?.title ?? '-'}</td>
                <td>{report.setlist_items?.concerts?.title ?? '-'}</td>
                <td>{report.setlist_items?.concerts?.date ?? '-'}</td>
                <td>{report.platform}</td>
                <td>
                  <a href={report.video_url} target="_blank" rel="noreferrer">
                    링크
                  </a>
                </td>
                <td>{report.status}</td>
                <td>{report.report_count}</td>
                <td>{report.created_at?.slice(0, 10)}</td>
                <td>
                  {report.status !== 'active' && (
                    <form action={approveVideo.bind(null, report.id)}
                      style={{ display: 'inline' }}>
                      <button type="submit">승인</button>
                    </form>
                  )}
                  {report.status !== 'deleted' && (
                    <form action={deleteVideo.bind(null, report.id)}
                      style={{ display: 'inline' }}>
                      <button type="submit">삭제</button>
                    </form>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}