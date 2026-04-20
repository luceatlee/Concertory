import Link from 'next/link'
import { notFound } from 'next/navigation'
import ArtistTheme from '@/components/artist/ArtistTheme'
import { getArtistBySlug, getConcertsByArtist } from '@/lib/supabase/queries'
import { GlowBackground } from '@/components/ui/GlowBackground'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'

// ─────────────────────────────────────────────
// 아티스트 홈 (Territory)
//
// 서버 컴포넌트로 유지하는 이유:
//   아티스트 정보와 공연 목록을 서버에서 fetch해서
//   SEO와 초기 로딩 속도를 최적화해요
//
// 공연 목록 그룹핑 기준: 연도
//   와이어프레임 기준 연도별 그룹핑이에요
//   뼈대의 투어명 그룹핑은 아티스트 홈 아코디언 UI로
//   M2에서 결정됐지만, 와이어프레임 확정안 기준으로
//   연도 그룹핑 + 리스트 형태로 구현해요
// ─────────────────────────────────────────────

// 서브 탭 정의
// 각 탭은 별도 라우트로 연결돼요
const SUB_TABS = [
  { label: '공연 목록', href: '' },           // /artist/[slug]
  { label: '응원법', href: '/cheer' },
  { label: '곡 참여 빈도', href: '/stats' },
  { label: '히스토리', href: '/history' },
  { label: '예상 투표', href: '/vote' },
]

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const artist = await getArtistBySlug(slug).catch(() => null)

  if (!artist) notFound()

  const concerts = await getConcertsByArtist(artist.id)

  // 연도별 그룹핑 + 내림차순 정렬 (최신 연도가 위에)
  const groupedByYear = concerts.reduce<Record<string, typeof concerts>>(
    (acc, concert) => {
      const year = new Date(concert.date).getFullYear().toString()
      if (!acc[year]) acc[year] = []
      acc[year].push(concert)
      return acc
    },
    {}
  )
  const sortedYears = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a))

  // 통계 계산
  const totalConcerts = concerts.length
  const latestYear = sortedYears[0] ?? '—'

  return (
    <>
      {/* 아티스트 테마 CSS 변수 주입 */}
      <ArtistTheme themeColor={artist.theme_color} />

      {/* 아티스트 테마 글로우 배경 */}
      <GlowBackground variant="artist" position="top" />

      {/* ── 아티스트 히어로 배너 ── */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: artist.theme_color ?? 'var(--bg-elevated)' }}
      >
        {/* 어두운 오버레이 — 텍스트 가독성 확보 */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-transparent" />

        {/* 배경 글로우 서클 — 응원봉 빛 느낌 */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: artist.theme_color ?? 'white' }}
        />

        <div className="relative z-10 max-w-[1280px] mx-auto px-[var(--sp-6)]">
          <div className="flex items-end gap-[var(--sp-6)] pt-[var(--sp-8)] pb-0">

            {/* 아티스트 이미지 — 히어로 하단에 걸쳐지는 구조 */}
            <div className="
              hidden md:flex
              w-[100px] h-[120px]
              rounded-t-[var(--radius-lg)]
              border border-dashed border-white/30
              bg-white/10
              items-center justify-center
              flex-shrink-0
              self-end
            ">
              {artist.profile_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={artist.profile_image_url}
                  alt={artist.name}
                  className="w-full h-full object-cover rounded-t-[var(--radius-lg)]"
                />
              ) : (
                <span className="text-white/30 text-3xl">🎤</span>
              )}
            </div>

            {/* 아티스트 정보 */}
            <div className="pb-[var(--sp-6)] flex-1">
              {/* 아이레브로 */}
              <p className="text-[10px] font-semibold tracking-[3px] uppercase text-white/60 mb-[var(--sp-1)]">
                SM Entertainment · {artist.type === 'group' ? 'Group' : artist.type === 'solo' ? 'Solo' : 'Unit'}
              </p>

              {/* 아티스트명 */}
              <h1 className="
                font-[family-name:var(--font-display)]
                text-[clamp(36px,6vw,64px)] tracking-[3px] leading-none
                text-white
              ">
                {artist.name}
              </h1>

              {/* 서브 정보 */}
              <p className="text-[12px] text-white/60 mt-[var(--sp-2)]">
                {artist.name_en}
                {artist.debut_date && (
                  <> · 데뷔 {new Date(artist.debut_date).toLocaleDateString('ko-KR', {
                    year: 'numeric', month: '2-digit', day: '2-digit'
                  })}</>
                )}
              </p>

              {/* 통계 */}
              <div className="flex gap-[var(--sp-6)] mt-[var(--sp-4)]">
                <div>
                  <p className="
                    font-[family-name:var(--font-display)]
                    text-[28px] leading-none text-white
                  ">
                    {totalConcerts}
                  </p>
                  <p className="text-[9px] text-white/50 mt-[2px] tracking-wide uppercase">총 공연</p>
                </div>
                <div>
                  <p className="
                    font-[family-name:var(--font-display)]
                    text-[28px] leading-none text-white
                  ">
                    {latestYear}
                  </p>
                  <p className="text-[9px] text-white/50 mt-[2px] tracking-wide uppercase">최근 공연</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 서브 탭 네비게이션 ── */}
      {/*
        탭을 클라이언트 상태(useState)가 아닌 별도 라우트로 구현한 이유:
        - 각 탭 URL이 공유 가능해요 (예: /artist/aespa/cheer)
        - 뒤로가기가 자연스럽게 동작해요
        - 서버 컴포넌트를 유지할 수 있어요
      */}
      <div className="
        bg-[var(--bg-elevated)]
        border-b border-[var(--border-subtle)]
        sticky top-[56px] z-30
      ">
        <div className="max-w-[1280px] mx-auto px-[var(--sp-6)]">
          <nav className="flex overflow-x-auto scrollbar-hide">
            {SUB_TABS.map(({ label, href }) => {
              const fullHref = `/artist/${slug}${href}`
              // 공연 목록 탭은 정확히 /artist/[slug]일 때만 활성화
              const isActive = href === ''
                ? true   // 현재 이 페이지가 공연 목록 탭이에요
                : false

              return (
                <Link
                  key={href}
                  href={fullHref}
                  className={[
                    'flex-shrink-0',
                    'px-[var(--sp-4)] py-[14px]',
                    'text-[12px] font-medium',
                    'border-b-2 -mb-[2px]',
                    'no-underline whitespace-nowrap',
                    'transition-colors duration-[var(--duration-fast)]',
                    isActive
                      ? 'text-[var(--theme,var(--brand))] border-[color:var(--theme,var(--brand))]'
                      : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]',
                  ].join(' ')}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* ── 메인 콘텐츠 ── */}
      <div className="max-w-[1280px] mx-auto px-[var(--sp-6)] py-[var(--sp-8)]">
        <div className="flex gap-[var(--sp-8)] items-start">

          {/* ── 좌측: 공연 목록 ── */}
          <div className="flex-1 min-w-0">

            {/* 섹션 헤더 */}
            <div className="flex items-center gap-[var(--sp-2)] mb-[var(--sp-6)]">
              <h2 className="
                font-[family-name:var(--font-serif)] italic
                text-[18px] font-semibold text-[var(--text-primary)]
              ">
                Concerts
              </h2>
              <span className="text-[12px] text-[var(--text-muted)]">
                총 {totalConcerts}회
              </span>
            </div>

            {concerts.length === 0 ? (
              <EmptyState
                icon="🎪"
                title="등록된 공연이 없어요"
                description="공연 정보가 등록되면 여기에 표시돼요"
              />
            ) : (
              <div className="flex flex-col gap-[var(--sp-6)]">
                {sortedYears.map((year) => (
                  <div key={year}>
                    {/* 연도 레이블 */}
                    <p className="
                      text-[11px] font-bold tracking-[2px]
                      text-[var(--theme,var(--brand))]
                      mb-[var(--sp-3)]
                      uppercase
                    ">
                      {year}
                    </p>

                    {/* 해당 연도 공연 목록 */}
                    <div className="
                      rounded-[var(--radius-lg)]
                      border border-[var(--border-subtle)]
                      bg-[var(--bg-surface)]
                      overflow-hidden
                      divide-y divide-[var(--border-subtle)]
                    ">
                      {groupedByYear[year].map((concert) => (
                        <Link
                          key={concert.id}
                          href={`/artist/${slug}/concert/${concert.id}/setlist`}
                          className="
                            flex items-center gap-[var(--sp-4)]
                            px-[var(--sp-4)] py-[var(--sp-3)]
                            no-underline group
                            transition-colors duration-[var(--duration-fast)]
                            hover:bg-[var(--bg-overlay)]
                          "
                        >
                          {/* 썸네일 자리 */}
                          <div className="
                            w-[52px] h-[52px] flex-shrink-0
                            rounded-[var(--radius-sm)]
                            bg-[var(--bg-overlay)]
                            flex items-center justify-center
                            text-[20px]
                          ">
                            🎪
                          </div>

                          {/* 공연 정보 */}
                          <div className="flex-1 min-w-0">
                            <p className="
                              text-[13px] font-medium
                              text-[var(--text-primary)]
                              group-hover:text-[var(--theme,var(--brand))]
                              transition-colors duration-[var(--duration-fast)]
                              truncate
                            ">
                              {concert.title}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)] mt-[2px] truncate">
                              {new Date(concert.date).toLocaleDateString('ko-KR')}
                              {' · '}{concert.venue}
                              {concert.city && `, ${concert.city}`}
                              {concert.day_sequence && ` · DAY ${concert.day_sequence}`}
                            </p>
                          </div>

                          {/* 화살표 */}
                          <span className="
                            text-[var(--text-muted)] text-[16px] flex-shrink-0
                            group-hover:text-[var(--theme,var(--brand))]
                            transition-colors duration-[var(--duration-fast)]
                          ">
                            ›
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── 우측 사이드바 (데스크톱만) ── */}
          <aside className="
            hidden lg:flex flex-col gap-[var(--sp-4)]
            w-[260px] flex-shrink-0
            sticky top-[108px]
          ">
            {/* 콘서트 히스토리 타임라인 */}
            <div className="
              rounded-[var(--radius-lg)]
              border border-[var(--border-subtle)]
              bg-[var(--bg-surface)]
              overflow-hidden
            ">
              <div className="px-[var(--sp-4)] py-[var(--sp-3)] border-b border-[var(--border-subtle)]">
                <h3 className="
                  font-[family-name:var(--font-serif)] italic
                  text-[14px] font-semibold text-[var(--text-primary)]
                ">
                  History
                </h3>
              </div>
              <div className="px-[var(--sp-4)] py-[var(--sp-3)]">
                {sortedYears.length === 0 ? (
                  <EmptyState icon="⏱" title="히스토리가 없어요" />
                ) : (
                  <div className="flex flex-col gap-[var(--sp-1)]">
                    {sortedYears.map((year) => (
                      <div key={year} className="flex flex-col gap-[var(--sp-1)]">
                        {/* 연도 */}
                        <p className="
                          text-[11px] font-bold tracking-[1px]
                          text-[var(--theme,var(--brand))]
                          mt-[var(--sp-2)]
                        ">
                          {year}
                        </p>
                        {/* 해당 연도 투어명 목록 (중복 제거) */}
                        {[...new Set(groupedByYear[year].map(c => c.tour_name ?? c.title))].map((tourName) => (
                          <div
                            key={tourName}
                            className="
                              pl-[var(--sp-3)]
                              border-l-2 border-[color:var(--theme,var(--brand))]/30
                              ml-[var(--sp-1)]
                            "
                          >
                            <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                              {tourName}
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 자주 불린 곡 TOP 5 — 데이터 미연결, UI 구조만 */}
            <div className="
              rounded-[var(--radius-lg)]
              border border-[var(--border-subtle)]
              bg-[var(--bg-surface)]
              overflow-hidden
            ">
              <div className="px-[var(--sp-4)] py-[var(--sp-3)] border-b border-[var(--border-subtle)]">
                <h3 className="
                  font-[family-name:var(--font-serif)] italic
                  text-[14px] font-semibold text-[var(--text-primary)]
                ">
                  Top Songs
                </h3>
              </div>
              <div className="px-[var(--sp-4)] py-[var(--sp-3)]">
                {/*
                  곡 참여 빈도 통계는 setlist_items 집계 쿼리가 필요해요
                  stats 페이지 작업 시 연결 예정이에요
                */}
                <EmptyState
                  icon="📊"
                  title="통계 준비 중"
                  description="stats 페이지 작업 시 연결돼요"
                />
              </div>
            </div>

            {/* 예상 세트리스트 투표 — 데이터 미연결, UI 구조만 */}
            <div className="
              rounded-[var(--radius-lg)]
              border border-[var(--border-subtle)]
              bg-[var(--bg-surface)]
              overflow-hidden
            ">
              <div className="px-[var(--sp-4)] py-[var(--sp-3)] border-b border-[var(--border-subtle)]">
                <h3 className="
                  font-[family-name:var(--font-serif)] italic
                  text-[14px] font-semibold text-[var(--text-primary)]
                ">
                  Vote
                </h3>
              </div>
              <div className="px-[var(--sp-4)] py-[var(--sp-3)]">
                {/*
                  투표 기능은 setlist_votes 쿼리 + 로그인 상태 확인이 필요해요
                  vote 페이지 작업 시 연결 예정이에요
                */}
                <EmptyState
                  icon="🗳️"
                  title="투표 준비 중"
                  description="vote 페이지 작업 시 연결돼요"
                />
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* 모바일 하단 탭바 여백 */}
      <div className="h-[56px] md:hidden" />
    </>
  )
}