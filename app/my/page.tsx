import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser, getMyConcertLogs } from '@/lib/supabase/queries'
import { GlowBackground } from '@/components/ui/GlowBackground'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'

// ─────────────────────────────────────────────
// 마이페이지 (Memory)
//
// 서버 컴포넌트로 유지하는 이유:
//   - 로그인 체크 후 redirect를 서버에서 처리해요
//   - 아티스트 필터를 URL searchParams로 처리해서
//     공유 가능하고 뒤로가기가 자연스러워요
//
// 페이지네이션 전략:
//   - 데스크톱: 페이지 번호 방식
//   - 모바일: 더보기 버튼 방식
//   Pagination 컴포넌트가 CSS로 분기해요 (JS 불필요)
// ─────────────────────────────────────────────

const ITEMS_PER_PAGE = 10

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ artist?: string; page?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { artist, page } = await searchParams
  const currentPage = Number(page ?? 1)

  const logs = await getMyConcertLogs(user.id)

  // 아티스트 필터용 고유 아티스트 목록 추출
  const artistMap = new Map<string, { slug: string; name: string; themeColor: string | null }>()
  logs.forEach((log) => {
    const a = log.concerts?.artists
    if (a?.slug && !artistMap.has(a.slug)) {
      artistMap.set(a.slug, {
        slug: a.slug,
        name: a.name,
        themeColor: a.theme_color ?? null,
      })
    }
  })
  const artistList = [...artistMap.values()]

  // 아티스트 필터 적용
  const filteredLogs = artist
    ? logs.filter((log) => log.concerts?.artists?.slug === artist)
    : logs

  // 페이지네이션
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // 통계
  const totalConcerts = logs.length
  const totalReviews = logs.filter((log) => log.content).length

  return (
    <>
      <GlowBackground variant="brand" position="top" />

      {/* ── 프로필 헤더 ── */}
      <section className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
        <div className="max-w-[1280px] mx-auto px-[var(--sp-6)] py-[var(--sp-6)]">
          <div className="flex items-center gap-[var(--sp-5)] flex-wrap">

            {/* 아바타 */}
            <div className="
              w-16 h-16 rounded-full flex-shrink-0
              bg-[var(--bg-overlay)]
              border-2 border-white/20
              flex items-center justify-center
              text-2xl
            ">
              {/* 추후 user.avatar_url로 교체 */}
              🎤
            </div>

            {/* 닉네임 + 관심 아티스트 */}
            <div className="flex-1 min-w-0">
              <h1 className="
                font-[family-name:var(--font-display)]
                text-[24px] tracking-[2px] leading-none
                text-white
              ">
                {/* 추후 user.user_metadata.nickname 등으로 교체 */}
                {user.email?.split('@')[0].toUpperCase()}
              </h1>
              {artistList.length > 0 && (
                <p className="text-[11px] text-white/50 mt-[var(--sp-1)]">
                  좋아하는 아티스트{' '}
                  <span className="text-[var(--brand)]">
                    {artistList.map((a) => a.name).join(' · ')}
                  </span>
                </p>
              )}
            </div>

            {/* 통계 칩 */}
            <div className="
              hidden md:flex
              border border-white/12
              rounded-[var(--radius-sm)]
              overflow-hidden
            ">
              {[
                { num: totalConcerts, label: '참석 공연' },
                { num: totalReviews, label: '작성 후기' },
                { num: artistList.length, label: '관심 아티스트' },
              ].map(({ num, label }) => (
                <div
                  key={label}
                  className="px-[var(--sp-5)] py-[var(--sp-2)] text-center bg-white/6 border-r border-white/10 last:border-r-0"
                >
                  <p className="font-[family-name:var(--font-display)] text-[22px] text-white leading-none">{num}</p>
                  <p className="text-[9px] text-white/45 mt-[2px] whitespace-nowrap">{label}</p>
                </div>
              ))}
            </div>

            {/* 프로필 편집 버튼 */}
            <Link
              href="/my/settings"
              className="
                flex-shrink-0
                text-[11px] px-[var(--sp-3)] py-[7px]
                rounded-[var(--radius-sm)]
                bg-white/10 text-white/75
                border border-white/18
                no-underline
                hover:bg-white/18
                transition-colors duration-[var(--duration-fast)]
              "
            >
              ⚙ 프로필 편집
            </Link>
          </div>

          {/* 모바일 통계 — 헤더 하단 */}
          <div className="md:hidden flex border border-white/12 rounded-[var(--radius-sm)] overflow-hidden mt-[var(--sp-4)]">
            {[
              { num: totalConcerts, label: '참석 공연' },
              { num: totalReviews, label: '작성 후기' },
              { num: artistList.length, label: '관심 아티스트' },
            ].map(({ num, label }) => (
              <div key={label} className="flex-1 text-center py-[var(--sp-2)] bg-white/6 border-r border-white/10 last:border-r-0">
                <p className="font-[family-name:var(--font-display)] text-[20px] text-white leading-none">{num}</p>
                <p className="text-[9px] text-white/45 mt-[1px]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 참석 공연 섹션 ── */}
      <div className="max-w-[1280px] mx-auto px-[var(--sp-6)] py-[var(--sp-6)]">

        {/* 섹션 헤더 */}
        <div className="flex items-center gap-[var(--sp-3)] mb-[var(--sp-4)]">
          <h2 className="
            font-[family-name:var(--font-serif)] italic
            text-[18px] font-semibold text-[var(--text-primary)]
          ">
            My Concerts
          </h2>
          <span className="text-[12px] text-[var(--text-muted)]">총 {totalConcerts}개</span>
        </div>

        {/* 아티스트 필터 칩 */}
        {artistList.length > 0 && (
          <div className="
            flex flex-wrap gap-[var(--sp-2)]
            pb-[var(--sp-4)] mb-[var(--sp-4)]
            border-b border-[var(--border-subtle)]
            overflow-x-auto
          ">
            {/* 전체 */}
            <Link href="/my" className="no-underline">
              <button className={[
                'inline-flex items-center gap-[var(--sp-1)]',
                'text-[11px] px-[var(--sp-3)] py-[4px]',
                'rounded-[var(--radius-full)] border',
                'transition-all duration-[var(--duration-fast)]',
                'cursor-pointer whitespace-nowrap',
                !artist
                  ? 'bg-[var(--bg-overlay)] text-[var(--text-primary)] border-[var(--border-strong)]'
                  : 'bg-transparent text-[var(--text-muted)] border-[var(--border-default)] hover:border-[var(--border-strong)]',
              ].join(' ')}>
                전체
              </button>
            </Link>

            {/* 아티스트별 — 테마 컬러 배경 */}
            {artistList.map((a) => (
              <Link key={a.slug} href={`/my?artist=${a.slug}`} className="no-underline">
                <button
                  className={[
                    'inline-flex items-center gap-[var(--sp-1)]',
                    'text-[11px] px-[var(--sp-3)] py-[4px]',
                    'rounded-[var(--radius-full)] border border-transparent',
                    'transition-all duration-[var(--duration-fast)]',
                    'cursor-pointer whitespace-nowrap',
                    artist === a.slug ? 'text-white opacity-100' : 'text-white opacity-70 hover:opacity-90',
                  ].join(' ')}
                  style={a.themeColor
                    ? { backgroundColor: a.themeColor }
                    : { backgroundColor: 'var(--brand)' }
                  }
                >
                  {/* 아티스트 컬러 점 */}
                  <span className="w-2 h-2 rounded-full bg-white/60 flex-shrink-0" />
                  {a.name}
                </button>
              </Link>
            ))}
          </div>
        )}

        {/* 공연 리스트 */}
        {filteredLogs.length === 0 ? (
          <EmptyState
            icon="🎪"
            title="참석한 공연이 없어요"
            description="공연에 다녀오셨나요? 기록을 남겨보세요"
            action={
              <Link href="/" className="no-underline">
                <Button variant="primary" size="sm">공연 둘러보기</Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="divide-y divide-[var(--border-subtle)]/50">
              {paginatedLogs.map((log) => {
                const artistSlug = log.concerts?.artists?.slug
                const concertId = log.concert_id
                const themeColor = log.concerts?.artists?.theme_color
                const hasReview = !!log.content

                return (
                  <div
                    key={log.id}
                    className="
                      flex items-center gap-[var(--sp-3)]
                      py-[var(--sp-3)]
                      flex-wrap md:flex-nowrap
                    "
                  >
                    {/* 썸네일 */}
                    <div className="
                      w-12 h-12 flex-shrink-0
                      rounded-[var(--radius-sm)]
                      bg-[var(--bg-overlay)]
                      flex items-center justify-center
                      text-[18px]
                    ">
                      🎪
                    </div>

                    {/* 공연 정보 */}
                    <div className="flex-1 min-w-0">
                      <p className="
                        text-[13px] font-medium
                        text-[var(--text-primary)]
                        truncate
                        flex items-center gap-[5px]
                      ">
                        {/* 아티스트 컬러 점 */}
                        <span
                          className="inline-block w-[7px] h-[7px] rounded-full flex-shrink-0"
                          style={{ backgroundColor: themeColor ?? 'var(--brand)' }}
                        />
                        {log.concerts?.title}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-[2px] flex gap-[var(--sp-2)]">
                        <span>{log.concerts?.date
                          ? new Date(log.concerts.date).toLocaleDateString('ko-KR')
                          : '—'}</span>
                        {log.concerts?.venue && <span>{log.concerts.venue}</span>}
                        {log.seat && <span>· {log.seat}</span>}
                      </p>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="
                      flex gap-[var(--sp-2)]
                      w-full md:w-auto
                      justify-end
                    ">
                      {/* 세트리스트 */}
                      <Link
                        href={`/artist/${artistSlug}/concert/${concertId}/setlist`}
                        className="no-underline"
                      >
                        <Button variant="ghost" size="sm">
                          세트리스트 →
                        </Button>
                      </Link>

                      {/* 후기 읽기 / 후기 작성 */}
                      <Link
                        href={`/my/diary/${log.id}`}
                        className="no-underline"
                      >
                        {hasReview ? (
                          // 후기 있음 — Primary 버튼
                          <Button variant="primary" size="sm">
                            후기 읽기
                          </Button>
                        ) : (
                          // 후기 없음 — Secondary(아웃라인) 버튼으로 작성 유도
                          <Button variant="secondary" size="sm">
                            후기 작성
                          </Button>
                        )}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 페이지네이션 */}
            {/*
              Pagination 컴포넌트가 반응형을 CSS로 처리해요
              - 모바일(md 미만): 더보기 버튼
              - 데스크톱(md 이상): 페이지 번호
              JS 없이 CSS display로 분기해서 SSR과 충돌 없어요
            */}
            <div className="mt-[var(--sp-6)]">
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={() => {}}   // 서버 컴포넌트라 실제 동작은 URL로 처리
                hasMore={currentPage < totalPages}
                onLoadMore={() => {}}
              />
              {/*
                TODO: Pagination은 클라이언트 상호작용이 필요해요
                현재는 UI 구조만 잡았고,
                MyPage를 'use client'로 전환하거나
                별도 MyPageClient 컴포넌트로 분리해서
                onPageChange에서 router.push로 URL을 바꾸도록 연결해야 해요
              */}
            </div>
          </>
        )}
      </div>

      {/* 모바일 하단 탭바 여백 */}
      <div className="h-[56px] md:hidden" />
    </>
  )
}