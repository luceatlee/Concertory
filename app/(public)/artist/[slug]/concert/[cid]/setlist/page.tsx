import Link from 'next/link'
import { notFound } from 'next/navigation'
import ArtistTheme from '@/components/artist/ArtistTheme'
import { getConcertById, getSetlistByConcert } from '@/lib/supabase/queries'
import { GlowBackground } from '@/components/ui/GlowBackground'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'

// ─────────────────────────────────────────────
// 세트리스트 (Repertory)
//
// 디자인 콘셉트: 전시관/박물관
//   섹션 구분선 → 의상 패널 → 곡 목록이
//   전시 챕터처럼 흐르는 리듬감을 만들어요
//   Cormorant Garamond 세리프 이탤릭이
//   공연 프로그램북 느낌을 줘요
// ─────────────────────────────────────────────

// 서브 탭 — 공연 상세 하위 페이지
const SUB_TABS = [
  { label: '세트리스트', href: '/setlist' },
  { label: '연출 피드백', href: '/review' },
  { label: '공연 정보', href: '' },
]

// 앵콜 섹션인지 판별하는 헬퍼
// section 값에 '앵콜' 또는 'encore'가 포함되면 앵콜로 처리해요
function isEncoreSection(section: string) {
  return /앵콜|encore/i.test(section)
}

export default async function SetlistPage({
  params,
}: {
  params: Promise<{ slug: string; cid: string }>
}) {
  const { slug, cid } = await params
  const concert = await getConcertById(cid).catch(() => null)

  if (!concert) notFound()

  const setlist = await getSetlistByConcert(cid)

  // 섹션별 그룹핑 — order_num 순서 유지
  const grouped = setlist.reduce<Record<string, typeof setlist>>(
    (acc, item) => {
      const key = item.section ?? '메인'
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    },
    {}
  )

  // 섹션 순서: 첫 등장 순서대로 유지 (앵콜은 맨 뒤)
  const sectionKeys = Object.keys(grouped).sort((a, b) => {
    if (isEncoreSection(a)) return 1
    if (isEncoreSection(b)) return -1
    return 0
  })

  // 통계
  const totalSongs = setlist.length
  const encoreSections = sectionKeys.filter(isEncoreSection).length

  return (
    <>
      <ArtistTheme themeColor={concert.artists?.theme_color ?? null} />
      <GlowBackground variant="artist" position="top" />

      {/* ── 브레드크럼 ── */}
      <nav className="
        px-[var(--sp-6)] py-[var(--sp-2)]
        bg-[var(--bg-elevated)]
        border-b border-[var(--border-subtle)]
        text-[11px] text-[var(--text-muted)]
        flex items-center gap-[var(--sp-1)]
        flex-wrap
      ">
        <Link href="/" className="hover:text-[var(--text-secondary)] no-underline transition-colors duration-[var(--duration-fast)]">홈</Link>
        <span>›</span>
        <Link href={`/artist/${slug}`} className="hover:text-[var(--text-secondary)] no-underline transition-colors duration-[var(--duration-fast)]">
          {concert.artists?.name}
        </Link>
        <span>›</span>
        <span className="text-[var(--text-secondary)] truncate max-w-[200px]">{concert.title}</span>
      </nav>

      {/* ── 공연 헤더 — 포스터 느낌 ── */}
      <section
        className="relative overflow-hidden flex"
        style={{ backgroundColor: concert.artists?.theme_color ?? 'var(--bg-elevated)', minHeight: '160px' }}
      >
        {/* 좌측 포스터 영역 */}
        <div className="
          hidden md:flex
          w-[110px] flex-shrink-0
          bg-black/25
          border-r border-white/10
          items-center justify-center
          flex-col gap-[var(--sp-1)]
          text-white/30 text-[10px]
        ">
          {/* 추후 포스터 이미지로 교체 */}
          <span className="text-2xl">🖼</span>
          <span className="tracking-wide">포스터</span>
        </div>

        {/* 우측 공연 정보 */}
        <div className="
          relative flex-1
          px-[var(--sp-6)] md:px-[var(--sp-8)]
          py-[var(--sp-6)]
          flex flex-col justify-between
          z-10
        ">
          {/* 배경 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

          <div className="relative z-10">
            {/* 아이레브로 */}
            <p className="text-[9px] tracking-[3px] uppercase text-white/55 mb-[var(--sp-1)]">
              {concert.artists?.name} · {concert.tour_name ?? '단독 공연'}
            </p>

            {/*
              공연 제목: Cormorant Garamond 세리프 이탤릭
              전시 프로그램북 느낌의 핵심이에요
            */}
            <h1 className="
              font-[family-name:var(--font-serif)] italic
              text-[clamp(20px,3vw,32px)] text-white leading-[1.15]
              font-semibold
            ">
              {concert.title}
            </h1>

            {/* 메타 정보 */}
            <div className="flex flex-wrap gap-[var(--sp-4)] mt-[var(--sp-2)] text-[11px] text-white/60">
              <span>📅 {new Date(concert.date).toLocaleDateString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'
              })}</span>
              <span>📍 {concert.venue}{concert.city ? `, ${concert.city}` : ''}</span>
            </div>
          </div>

          {/* 통계 칩 */}
          <div className="
            relative z-10
            flex gap-[1px] mt-[var(--sp-4)]
            border border-white/15 rounded-[var(--radius-sm)]
            overflow-hidden self-start
          ">
            {[
              { num: totalSongs, label: '총 곡 수' },
              { num: concert.total_duration_min ? `${concert.total_duration_min}` : '—', label: '공연 시간(분)' },
              { num: encoreSections, label: '앵콜 섹션' },
            ].map(({ num, label }) => (
              <div key={label} className="px-[var(--sp-4)] py-[var(--sp-2)] bg-white/8 border-r border-white/10 last:border-r-0 text-center">
                <p className="font-[family-name:var(--font-display)] text-[20px] text-white leading-none">{num}</p>
                <p className="text-[9px] text-white/45 mt-[2px] whitespace-nowrap">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 서브 탭 ── */}
      <div className="
        bg-[var(--bg-elevated)]
        border-b border-[var(--border-subtle)]
        sticky top-[56px] z-30
      ">
        <div className="max-w-[1280px] mx-auto px-[var(--sp-6)]">
          <nav className="flex overflow-x-auto">
            {SUB_TABS.map(({ label, href }) => {
              const isActive = href === '/setlist'  // 현재 페이지
              return (
                <Link
                  key={href}
                  href={`/artist/${slug}/concert/${cid}${href}`}
                  className={[
                    'flex-shrink-0 px-[var(--sp-4)] py-[14px]',
                    'text-[12px] font-medium whitespace-nowrap',
                    'border-b-2 -mb-[2px] no-underline',
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

      {/* ── 세트리스트 본문 — 전시관 스타일 ── */}
      <div className="max-w-[1280px] mx-auto px-[var(--sp-6)] md:px-[var(--sp-10)] py-[var(--sp-8)]">
        {setlist.length === 0 ? (
          <EmptyState
            icon="🎵"
            title="등록된 세트리스트가 없어요"
            description="공연 세트리스트가 등록되면 여기에 표시돼요"
          />
        ) : (
          <div>
            {sectionKeys.map((section) => {
              const items = grouped[section]
              const firstNum = items[0]?.order_num
              const lastNum = items[items.length - 1]?.order_num
              const isEncore = isEncoreSection(section)

              // 의상 이미지가 있는 첫 번째 아이템 사용
              const outfitItem = items.find(i => i.outfit_image_url || i.outfit_description)

              return (
                <div key={section} className="mt-[var(--sp-10)] first:mt-0">

                  {/* ── 섹션 구분선 — 전시 챕터 느낌 ── */}
                  <div className="flex items-center gap-0 mb-[var(--sp-6)]">
                    {/*
                      Cormorant Garamond 세리프 이탤릭 + 구분선 + 곡 번호 범위
                      전시 프로그램북의 챕터 구분 느낌이에요
                    */}
                    <span className="
                      font-[family-name:var(--font-serif)] italic
                      text-[11px] tracking-[3px] uppercase
                      text-[var(--text-muted)]
                      pr-[var(--sp-4)] whitespace-nowrap
                      flex items-center gap-[var(--sp-2)]
                    ">
                      {isEncore && (
                        <span className="text-[var(--theme,var(--brand))]">✦</span>
                      )}
                      {section}
                    </span>
                    <div className="flex-1 h-[1px] bg-[var(--border-subtle)]" />
                    {firstNum && lastNum && (
                      <span className="
                        font-[family-name:var(--font-serif)] italic
                        text-[11px] tracking-[2px]
                        text-[var(--text-muted)]
                        pl-[var(--sp-4)] whitespace-nowrap
                      ">
                        {String(firstNum).padStart(2, '0')} — {String(lastNum).padStart(2, '0')}
                      </span>
                    )}
                  </div>

                  {/* ── 의상 패널 — 전시 캡션 카드 ── */}
                  {outfitItem && (
                    <div className="
                      bg-[var(--bg-elevated)]
                      border border-[var(--border-subtle)]
                      border-t-[3px]
                      rounded-b-[var(--radius-md)]
                      mb-[var(--sp-5)]
                      p-[var(--sp-4)]
                      flex items-start gap-[var(--sp-5)]
                    "
                    style={{
                      borderTopColor: isEncore
                        ? 'var(--border-strong)'
                        : 'var(--theme, var(--brand))'
                    }}
                    >
                      {/* 의상 레이블 */}
                      <div className="flex-shrink-0">
                        <p className="
                          font-[family-name:var(--font-serif)] italic
                          text-[13px] text-[var(--text-secondary)]
                          mb-[2px]
                        ">
                          {outfitItem.outfit_description ?? 'Costume'}
                        </p>
                        <p className="text-[9px] tracking-[2px] uppercase text-[var(--text-muted)]">
                          Section {sectionKeys.indexOf(section) + 1}
                        </p>
                      </div>

                      {/* 의상 이미지 or 플레이스홀더 */}
                      <div className="flex gap-[var(--sp-3)]">
                        {outfitItem.outfit_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={outfitItem.outfit_image_url}
                            alt="의상"
                            className="w-11 h-14 object-cover rounded-[var(--radius-sm)] border border-[var(--border-subtle)]"
                          />
                        ) : (
                          // 의상 이미지 없을 때 플레이스홀더
                          <div className="
                            w-11 h-14
                            bg-[var(--bg-overlay)]
                            border border-dashed border-[var(--border-default)]
                            rounded-[var(--radius-sm)]
                            flex items-center justify-center
                            text-[var(--text-muted)] text-[10px]
                          ">
                            👗
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── 세트리스트 테이블 ── */}
                  {/*
                    데스크톱: 테이블 형태 (#, 곡명, 이벤트, 액션)
                    모바일: 리스트 형태 (번호 + 곡명 + 태그 + 화살표)
                  */}

                  {/* 데스크톱 테이블 헤더 */}
                  <div className="hidden md:grid grid-cols-[32px_1fr_200px_160px] gap-0 border-b border-[var(--border-subtle)] pb-[var(--sp-2)] mb-[var(--sp-1)]">
                    {['#', '곡명', '이벤트', ''].map((h) => (
                      <p key={h} className="text-[9px] tracking-[2px] uppercase text-[var(--text-muted)] px-[var(--sp-3)] first:px-0 first:text-center last:text-right">
                        {h}
                      </p>
                    ))}
                  </div>

                  {/* 곡 목록 */}
                  <div className="divide-y divide-[var(--border-subtle)]/50">
                    {items.map((item) => (
                      <Link
                        key={item.id}
                        href={`/artist/${slug}/concert/${cid}/song/${item.id}`}
                        className="
                          group no-underline
                          flex md:grid md:grid-cols-[32px_1fr_200px_160px]
                          items-center gap-[var(--sp-3)] md:gap-0
                          px-0 py-[var(--sp-3)]
                          transition-colors duration-[var(--duration-fast)]
                          hover:bg-[color:var(--theme,var(--brand))]/5
                          rounded-[var(--radius-sm)]
                          -mx-[var(--sp-2)] px-[var(--sp-2)]
                        "
                      >
                        {/* 트랙 번호 */}
                        <span className="
                          font-[family-name:var(--font-serif)] italic
                          text-[14px] text-[var(--text-muted)]
                          text-center flex-shrink-0 w-8 md:w-auto
                        ">
                          {String(item.order_num ?? 0).padStart(2, '0')}
                        </span>

                        {/* 곡명 */}
                        <div className="flex-1 min-w-0 md:px-[var(--sp-3)]">
                          <p className="
                            text-[14px] font-medium
                            text-[var(--text-primary)]
                            group-hover:text-[var(--theme,var(--brand))]
                            transition-colors duration-[var(--duration-fast)]
                            truncate
                          ">
                            {item.songs?.title}
                          </p>
                        </div>

                        {/* 이벤트 태그 — 데스크톱 */}
                        <div className="hidden md:flex items-center gap-[var(--sp-1)] px-[var(--sp-3)]">
                          {item.slogan_event && (
                            <Badge variant="brand" className="text-[8px]">🪄 슬로건</Badge>
                          )}
                          {item.sing_along_event && (
                            <Badge variant="brand" className="text-[8px]">🎤 떼창</Badge>
                          )}
                          {!item.slogan_event && !item.sing_along_event && (
                            <span className="text-[11px] text-[var(--text-muted)]">—</span>
                          )}
                        </div>

                        {/* 액션 버튼 — 데스크톱 */}
                        <div className="hidden md:flex items-center justify-end gap-[var(--sp-2)]">
                          <span className="
                            text-[10px] px-[var(--sp-2)] py-[4px]
                            rounded-[var(--radius-sm)]
                            border border-[var(--border-default)]
                            text-[var(--text-muted)]
                            group-hover:border-[color:var(--theme,var(--brand))]
                            group-hover:text-[var(--theme,var(--brand))]
                            transition-colors duration-[var(--duration-fast)]
                            whitespace-nowrap
                          ">
                            🎬 영상
                          </span>
                          <span className="
                            text-[10px] px-[var(--sp-2)] py-[4px]
                            rounded-[var(--radius-sm)]
                            border border-[var(--border-default)]
                            text-[var(--text-muted)]
                            group-hover:border-[color:var(--theme,var(--brand))]
                            group-hover:text-[var(--theme,var(--brand))]
                            transition-colors duration-[var(--duration-fast)]
                            whitespace-nowrap
                          ">
                            💬 후기
                          </span>
                        </div>

                        {/* 모바일 이벤트 태그 + 화살표 */}
                        <div className="md:hidden flex items-center gap-[var(--sp-1)] ml-auto flex-shrink-0">
                          {item.slogan_event && (
                            <span className="text-[8px] px-[5px] py-[1px] rounded bg-[var(--brand-dim)] text-[var(--brand)]">🪄</span>
                          )}
                          {item.sing_along_event && (
                            <span className="text-[8px] px-[5px] py-[1px] rounded bg-[var(--brand-dim)] text-[var(--brand)]">🎤</span>
                          )}
                          <span className="text-[var(--text-muted)] text-[16px]">›</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 모바일 하단 탭바 여백 */}
      <div className="h-[56px] md:hidden" />
    </>
  )
}