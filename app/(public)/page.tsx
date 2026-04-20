import Link from 'next/link'
import { getArtists, getRecentConcerts, getUpcomingConcerts } from '@/lib/supabase/queries'
import { GlowBackground } from '@/components/ui/GlowBackground'
import { FilterChip } from '@/components/ui/FilterChip'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'

// ─────────────────────────────────────────────
// 메인 홈 (Glory)
//
// 서버 컴포넌트로 유지하는 이유:
//   searchParams로 아티스트 필터를 URL에서 받아요
//   URL 기반 필터는 공유 가능하고, 뒤로가기가 자연스러워요
//   상태를 서버에서 처리해서 JS 없이도 필터가 동작해요
// ─────────────────────────────────────────────

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ artist?: string }>
}) {
  const { artist } = await searchParams
  const [artists, recentConcerts, upcomingConcerts] = await Promise.all([
    getArtists(),
    getRecentConcerts(),
    getUpcomingConcerts(),
  ])

  // 아티스트 필터 적용
  const filteredConcerts = artist
    ? recentConcerts.filter((c) => c.artists?.slug === artist)
    : recentConcerts

  // 투어명으로 그룹핑
  const grouped = filteredConcerts.reduce<Record<string, typeof filteredConcerts>>(
    (acc, concert) => {
      const key = `${concert.artists?.slug}__${concert.tour_name ?? concert.title}`
      if (!acc[key]) acc[key] = []
      acc[key].push(concert)
      return acc
    },
    {}
  )

  // 현재 선택된 아티스트 정보
  const selectedArtist = artists.find((a) => a.slug === artist)

  return (
    <>
      {/* 브랜드 핑크 글로우 배경 */}
      <GlowBackground variant="brand" position="top" />

      {/* ── 히어로 배너 ── */}
      <section className="
        bg-[var(--bg-elevated)]
        border-b border-[var(--border-subtle)]
        px-[var(--sp-6)] py-[var(--sp-10)]
        md:py-[var(--sp-12)]
      ">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-[var(--sp-6)]">
          <div>
            {/* 아이레브로 — 서비스 정의 */}
            <p className="
              text-[10px] font-semibold tracking-[4px] uppercase
              text-[var(--brand)] mb-[var(--sp-2)]
            ">
              SM Entertainment Concert Archive
            </p>
            {/*
              Bebas Neue(--font-display)로 강렬한 헤드라인
              clamp로 뷰포트에 따라 유동적으로 크기가 바뀌어요
            */}
            <h1 className="
              font-[family-name:var(--font-display)]
              text-[clamp(32px,5vw,56px)] tracking-[2px] leading-[1.05]
              text-white
            ">
              무대의 모든 순간을<br />기록하다
            </h1>
            <p className="
              text-[13px] text-[var(--text-secondary)]
              mt-[var(--sp-3)] tracking-wide
            ">
              세트리스트 · 의상 · 후기 · 영상
            </p>
          </div>

          {/* 히어로 이미지 자리 — 추후 관리자가 지정한 아티스트 이미지로 교체 */}
          <div className="
            hidden md:flex
            w-[160px] h-[100px]
            rounded-[var(--radius-lg)]
            border border-dashed border-[var(--border-default)]
            bg-[var(--bg-surface)]
            items-center justify-center
            text-[var(--text-muted)] text-[11px] tracking-wide
            flex-shrink-0
          ">
            아티스트 이미지
          </div>
        </div>
      </section>

      {/* ── 메인 콘텐츠 ── */}
      <div className="max-w-[1280px] mx-auto px-[var(--sp-6)] py-[var(--sp-8)]">
        <div className="flex gap-[var(--sp-8)] items-start">

          {/* ── 좌측: 아티스트 + 최근 공연 ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-[var(--sp-8)]">

            {/* 아티스트 섹션 */}
            <section>
              <div className="flex items-center justify-between mb-[var(--sp-4)]">
                <h2 className="
                  font-[family-name:var(--font-serif)] italic
                  text-[18px] font-semibold text-[var(--text-primary)]
                  tracking-wide
                ">
                  Artists
                </h2>
                <Link
                  href="/artist"
                  className="
                    text-[11px] text-[var(--text-muted)]
                    hover:text-[var(--text-secondary)]
                    tracking-wide no-underline
                    transition-colors duration-[var(--duration-fast)]
                  "
                >
                  전체보기 →
                </Link>
              </div>

              {/* 아티스트 필터 칩 */}
              <div className="flex flex-wrap gap-[var(--sp-2)] mb-[var(--sp-4)]">
                {/*
                  FilterChip은 클라이언트 상태가 필요 없어요
                  URL searchParams 기반이라 Link로 처리해요
                  선택된 칩은 href="/" (필터 해제), 나머지는 해당 아티스트 필터
                */}
                <Link href="/" className="no-underline">
                  <FilterChip isSelected={!artist}>전체</FilterChip>
                </Link>
                {artists.map((a) => (
                  <Link key={a.id} href={`/?artist=${a.slug}`} className="no-underline">
                    <FilterChip
                      isSelected={artist === a.slug}
                      artistColor={a.theme_color ?? undefined}
                    >
                      {a.name}
                    </FilterChip>
                  </Link>
                ))}
              </div>

              {/* 아티스트 카드 그리드 */}
              <div className="
                grid gap-[var(--sp-3)]
                grid-cols-3 md:grid-cols-4 lg:grid-cols-5
              ">
                {artists.map((a) => (
                  <Link
                    key={a.id}
                    href={`/artist/${a.slug}`}
                    className="no-underline group"
                  >
                    <div className="
                      rounded-[var(--radius-md)]
                      border border-[var(--border-subtle)]
                      bg-[var(--bg-surface)]
                      overflow-hidden
                      transition-all duration-[var(--duration-normal)]
                      hover:border-[var(--border-strong)]
                      hover:shadow-[var(--shadow-md)]
                      hover:-translate-y-[2px]
                    ">
                      {/* 아티스트 썸네일 — 1:1 비율 */}
                      <div className="
                        aspect-square
                        bg-[var(--bg-overlay)]
                        flex items-center justify-center
                        text-[var(--text-muted)] text-[11px]
                      ">
                        {a.profile_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={a.profile_image_url}
                            alt={a.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl opacity-30">🎤</span>
                        )}
                      </div>
                      {/* 아티스트명 */}
                      <div className="px-[var(--sp-2)] py-[var(--sp-2)] text-center">
                        <p className="
                          text-[11px] font-medium
                          text-[var(--text-secondary)]
                          group-hover:text-[var(--text-primary)]
                          transition-colors duration-[var(--duration-fast)]
                          truncate
                        ">
                          {a.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* 최근 업데이트 공연 섹션 */}
            <section>
              <div className="flex items-center justify-between mb-[var(--sp-4)]">
                <h2 className="
                  font-[family-name:var(--font-serif)] italic
                  text-[18px] font-semibold text-[var(--text-primary)]
                  tracking-wide
                ">
                  {selectedArtist
                    ? `${selectedArtist.name} — Recent Concerts`
                    : 'Recent Concerts'}
                </h2>
              </div>

              {Object.keys(grouped).length === 0 ? (
                <EmptyState
                  icon="🎪"
                  title="등록된 공연이 없어요"
                  description="아티스트 필터를 변경하거나 나중에 다시 확인해주세요"
                />
              ) : (
                <div className="flex flex-col gap-[var(--sp-3)]">
                  {Object.entries(grouped).map(([key, concerts]) => {
                    const first = concerts[0]
                    const tourName = first.tour_name ?? first.title
                    return (
                      <div
                        key={key}
                        className="
                          rounded-[var(--radius-lg)]
                          border border-[var(--border-subtle)]
                          bg-[var(--bg-surface)]
                          overflow-hidden
                        "
                      >
                        {/* 투어 헤더 */}
                        <div className="
                          px-[var(--sp-4)] py-[var(--sp-3)]
                          border-b border-[var(--border-subtle)]
                          flex items-center gap-[var(--sp-2)]
                        ">
                          <Badge variant="artist"
                            style={{ '--theme': first.artists?.theme_color } as React.CSSProperties}
                          >
                            {first.artists?.name}
                          </Badge>
                          <span className="
                            text-[13px] font-medium text-[var(--text-primary)]
                          ">
                            {tourName}
                          </span>
                          <span className="
                            ml-auto text-[11px] text-[var(--text-muted)]
                          ">
                            {concerts.length}회
                          </span>
                        </div>

                        {/* 공연 목록 */}
                        <div className="divide-y divide-[var(--border-subtle)]">
                          {concerts.map((concert) => (
                            <Link
                              key={concert.id}
                              href={`/artist/${concert.artists?.slug}/concert/${concert.id}`}
                              className="
                                flex items-center gap-[var(--sp-4)]
                                px-[var(--sp-4)] py-[var(--sp-3)]
                                no-underline group
                                transition-colors duration-[var(--duration-fast)]
                                hover:bg-[var(--bg-overlay)]
                              "
                            >
                              {/* 날짜 */}
                              <div className="text-center flex-shrink-0 w-10">
                                <p className="
                                  text-[9px] font-semibold tracking-[1px] uppercase
                                  text-[var(--text-muted)]
                                ">
                                  {new Date(concert.date).toLocaleString('en', { month: 'short' })}
                                </p>
                                <p className="
                                  font-[family-name:var(--font-display)]
                                  text-[22px] leading-none
                                  text-[var(--text-primary)]
                                ">
                                  {new Date(concert.date).getDate()}
                                </p>
                              </div>

                              {/* 공연 정보 */}
                              <div className="flex-1 min-w-0">
                                <p className="
                                  text-[13px] font-medium
                                  text-[var(--text-primary)]
                                  group-hover:text-white
                                  transition-colors duration-[var(--duration-fast)]
                                  truncate
                                ">
                                  {concert.title}
                                </p>
                                <p className="text-[11px] text-[var(--text-muted)] mt-[2px] truncate">
                                  {concert.venue} · {concert.city}
                                </p>
                              </div>

                              {/* 화살표 */}
                              <span className="
                                text-[var(--text-muted)]
                                group-hover:text-[var(--text-secondary)]
                                transition-colors duration-[var(--duration-fast)]
                                text-[14px] flex-shrink-0
                              ">
                                ›
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          {/* ── 우측: 공연 일정 (데스크톱만) ── */}
          <aside className="
            hidden lg:block
            w-[280px] flex-shrink-0
            sticky top-[72px]
          ">
            <div className="
              rounded-[var(--radius-lg)]
              border border-[var(--border-subtle)]
              bg-[var(--bg-surface)]
              overflow-hidden
            ">
              <div className="
                px-[var(--sp-4)] py-[var(--sp-3)]
                border-b border-[var(--border-subtle)]
              ">
                <h3 className="
                  font-[family-name:var(--font-serif)] italic
                  text-[15px] font-semibold text-[var(--text-primary)]
                ">
                  Upcoming
                </h3>
              </div>

              <div className="divide-y divide-[var(--border-subtle)]">
                {upcomingConcerts.length === 0 ? (
                  <div className="px-[var(--sp-4)] py-[var(--sp-6)]">
                    <EmptyState
                      icon="📅"
                      title="예정된 공연이 없어요"
                    />
                  </div>
                ) : (
                  upcomingConcerts.map((concert) => {
                    // D-day 계산
                    const today = new Date()
                    const concertDate = new Date(concert.date)
                    const diffMs = concertDate.getTime() - today.getTime()
                    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
                    const dDay = diffDays > 0
                      ? `D-${diffDays}`
                      : diffDays === 0
                      ? 'D-DAY'
                      : null  // 지난 공연은 D-day 표시 안 해요

                    return (
                      <Link
                        key={concert.id}
                        href={`/artist/${concert.artists?.slug}/concert/${concert.id}`}
                        className="
                          flex items-center gap-[var(--sp-3)]
                          px-[var(--sp-4)] py-[var(--sp-3)]
                          no-underline group
                          hover:bg-[var(--bg-overlay)]
                          transition-colors duration-[var(--duration-fast)]
                        "
                      >
                        {/* 날짜 블록 */}
                        <div className="text-center w-9 flex-shrink-0">
                          <p className="
                            text-[8px] font-semibold tracking-[1px] uppercase
                            text-[var(--text-muted)]
                          ">
                            {new Date(concert.date).toLocaleString('en', { month: 'short' })}
                          </p>
                          <p className="
                            font-[family-name:var(--font-display)]
                            text-[20px] leading-none
                            text-[var(--text-primary)]
                          ">
                            {new Date(concert.date).getDate()}
                          </p>
                        </div>

                        {/* 공연 정보 */}
                        <div className="flex-1 min-w-0">
                          <p className="
                            text-[12px] font-medium
                            text-[var(--text-secondary)]
                            group-hover:text-[var(--text-primary)]
                            transition-colors duration-[var(--duration-fast)]
                            truncate
                          ">
                            {concert.title}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] truncate mt-[1px]">
                            {concert.venue}
                          </p>
                        </div>

                        {/* D-day 배지 */}
                        {dDay && (
                          <Badge variant="brand" className="flex-shrink-0">
                            {dDay}
                          </Badge>
                        )}
                      </Link>
                    )
                  })
                )}
              </div>

              {/* 전체 일정 보기 */}
              <div className="
                px-[var(--sp-4)] py-[var(--sp-3)]
                border-t border-[var(--border-subtle)]
                text-center
              ">
                <Link
                  href="/schedule"
                  className="
                    text-[11px] text-[var(--text-muted)]
                    hover:text-[var(--text-secondary)]
                    tracking-wide no-underline
                    transition-colors duration-[var(--duration-fast)]
                  "
                >
                  전체 일정 보기 →
                </Link>
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