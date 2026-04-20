import Link from 'next/link'
import { notFound } from 'next/navigation'
import ArtistTheme from '@/components/artist/ArtistTheme'
import {
  getSetlistItemById,
  getOtherAppearances,
  getSongComments,
  getSongVideos,
  getSetlistByConcert,
} from '@/lib/supabase/queries'
import { GlowBackground } from '@/components/ui/GlowBackground'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { SongReviewSection } from '@/components/song/SongReviewSection'

// ─────────────────────────────────────────────
// 곡 상세 (Laboratory)
//
// 섹션 순서 (와이어프레임 v3 확정):
//   1. Live Footage
//   2. Fan Event (슬로건/떼창 데이터 있을 때만 렌더링)
//   3. Fan Reviews (멤버 필터 + 작성폼 — 클라이언트 컴포넌트 분리)
//   4. Other Appearances
//   5. 이전/다음 곡 네비게이션
//
// 왜 SongReviewSection을 분리했나요?
//   멤버 필터 선택, 후기 작성폼, 로그인 상태 확인이
//   모두 클라이언트 상호작용이 필요해요
//   부모는 서버 컴포넌트로 유지하면서
//   인터랙션이 필요한 부분만 'use client'로 분리해요
// ─────────────────────────────────────────────

// 플랫폼별 뱃지 색상
const PLATFORM_STYLE: Record<string, { label: string; className: string }> = {
  youtube:   { label: 'YouTube', className: 'bg-[#ff0000] text-white' },
  twitter:   { label: 'X',       className: 'bg-black text-white' },
  instagram: { label: 'IG',      className: 'bg-[#E1306C] text-white' },
  tiktok:    { label: 'TikTok',  className: 'bg-black text-white' },
  other:     { label: 'LINK',    className: 'bg-[var(--bg-overlay)] text-[var(--text-muted)]' },
}

export default async function SongPage({
  params,
}: {
  params: Promise<{ slug: string; cid: string; sid: string }>
}) {
  const { slug, cid, sid } = await params
  const item = await getSetlistItemById(sid).catch(() => null)

  if (!item) notFound()

  // 병렬 fetch — Promise.all로 동시에 요청해요
  const [appearances, comments, videos, fullSetlist] = await Promise.all([
    getOtherAppearances(item.song_id ?? '', sid),
    getSongComments(sid),
    getSongVideos(sid),
    getSetlistByConcert(cid),   // 이전/다음 곡 계산용
  ])

  // 이전/다음 곡 계산
  // order_num 기준으로 정렬 후 현재 항목의 인접 항목을 찾아요
  const sortedSetlist = [...fullSetlist].sort(
    (a, b) => (a.order_num ?? 0) - (b.order_num ?? 0)
  )
  const currentIndex = sortedSetlist.findIndex((s) => s.id === sid)
  const prevItem = currentIndex > 0 ? sortedSetlist[currentIndex - 1] : null
  const nextItem = currentIndex < sortedSetlist.length - 1 ? sortedSetlist[currentIndex + 1] : null

  // Other Appearances 더보기 처리 — 처음 5개만 표시 + 더보기 카드
  const APPEARANCES_INITIAL = 5
  const visibleAppearances = appearances.slice(0, APPEARANCES_INITIAL)
  const remainingCount = appearances.length - APPEARANCES_INITIAL

  // 팬 이벤트 여부
  const hasFanEvent = !!(item.slogan_event || item.sing_along_event)

  const themeColor = item.concerts?.artists?.theme_color ?? 'var(--bg-elevated)'

  return (
    <>
      <ArtistTheme themeColor={item.concerts?.artists?.theme_color ?? null} />
      <GlowBackground variant="artist" position="top" />

      {/* ── 브레드크럼 ── */}
      <nav className="
        px-[var(--sp-6)] py-[var(--sp-2)]
        bg-[var(--bg-elevated)]
        border-b border-[var(--border-subtle)]
        text-[11px] text-[var(--text-muted)]
        flex items-center gap-[var(--sp-1)] flex-wrap
      ">
        <Link href="/" className="hover:text-[var(--text-secondary)] no-underline transition-colors duration-[var(--duration-fast)]">홈</Link>
        <span>›</span>
        <Link href={`/artist/${slug}`} className="hover:text-[var(--text-secondary)] no-underline transition-colors duration-[var(--duration-fast)]">
          {item.concerts?.artists?.name}
        </Link>
        <span>›</span>
        <Link href={`/artist/${slug}/concert/${cid}/setlist`} className="hover:text-[var(--text-secondary)] no-underline transition-colors duration-[var(--duration-fast)]">
          세트리스트
        </Link>
        <span>›</span>
        <span className="text-[var(--text-secondary)]">{item.songs?.title}</span>
      </nav>

      {/* ── 곡 헤더 ── */}
      <section
        className="relative overflow-hidden px-[var(--sp-6)] md:px-[var(--sp-12)] py-[var(--sp-8)]"
        style={{ backgroundColor: themeColor }}
      >
        {/* 배경 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/25 to-transparent" />

        <div className="relative z-10 flex items-flex-end justify-between gap-[var(--sp-6)]">

          {/* 좌측: 곡 정보 */}
          <div>
            {/* 아이레브로 */}
            <p className="text-[9px] tracking-[4px] uppercase text-white/50 mb-[var(--sp-2)]">
              {item.concerts?.artists?.name}
              {item.order_num && ` · Track ${String(item.order_num).padStart(2, '0')}`}
              {item.section && ` · ${item.section}`}
            </p>

            {/*
              곡명: Cormorant Garamond 세리프 이탤릭
              이 페이지의 가장 중요한 타이포그래피 포인트예요
            */}
            <h1 className="
              font-[family-name:var(--font-serif)] italic
              text-[clamp(36px,6vw,60px)] text-white leading-none
              font-semibold
            ">
              {item.songs?.title}
            </h1>

            {/* 메타 + 이벤트 태그 */}
            <div className="flex flex-wrap items-center gap-[var(--sp-4)] mt-[var(--sp-3)] text-[11px] text-white/55">
              <span>
                📅 {item.concerts?.date
                  ? new Date(item.concerts.date).toLocaleDateString('ko-KR')
                  : '—'}
                {item.concerts?.venue && ` · ${item.concerts.venue}`}
              </span>
              {item.slogan_event && (
                <span className="text-[9px] px-[var(--sp-2)] py-[2px] rounded-[var(--radius-sm)] bg-[var(--brand)]/40 text-white border border-[var(--brand)]/50">
                  🪄 슬로건 이벤트
                </span>
              )}
              {item.sing_along_event && (
                <span className="text-[9px] px-[var(--sp-2)] py-[2px] rounded-[var(--radius-sm)] bg-[var(--brand)]/40 text-white border border-[var(--brand)]/50">
                  🎤 떼창 이벤트
                </span>
              )}
            </div>

            {/* 이전/다음 버튼 (모바일) */}
            <div className="flex gap-[var(--sp-2)] mt-[var(--sp-4)] md:hidden">
              {prevItem ? (
                <Link
                  href={`/artist/${slug}/concert/${cid}/song/${prevItem.id}`}
                  className="
                    text-[10px] px-[var(--sp-3)] py-[4px]
                    rounded-[var(--radius-sm)]
                    bg-white/12 text-white/70
                    border border-white/15
                    no-underline
                    transition-colors duration-[var(--duration-fast)]
                    hover:bg-white/20
                  "
                >
                  ← 이전
                </Link>
              ) : (
                <span className="text-[10px] px-[var(--sp-3)] py-[4px] text-white/20">← 이전</span>
              )}
              {nextItem && (
                <Link
                  href={`/artist/${slug}/concert/${cid}/song/${nextItem.id}`}
                  className="
                    text-[10px] px-[var(--sp-3)] py-[4px]
                    rounded-[var(--radius-sm)]
                    bg-white/12 text-white/70
                    border border-white/15
                    no-underline
                    transition-colors duration-[var(--duration-fast)]
                    hover:bg-white/20
                  "
                >
                  다음 → {nextItem.songs?.title}
                </Link>
              )}
            </div>
          </div>

          {/* 우측: 트랙 번호 장식 + 이전/다음 (데스크톱) */}
          <div className="hidden md:flex flex-col items-end flex-shrink-0">
            {/*
              트랙 번호를 매우 크게 표시해서 배경 장식으로 써요
              opacity가 낮아서 콘텐츠를 방해하지 않아요
            */}
            <p className="
              font-[family-name:var(--font-serif)] italic
              text-[96px] text-white/10 leading-none
              select-none
            ">
              {String(item.order_num ?? 0).padStart(2, '0')}
            </p>
            <div className="flex gap-[var(--sp-2)] mt-[var(--sp-1)]">
              {prevItem ? (
                <Link
                  href={`/artist/${slug}/concert/${cid}/song/${prevItem.id}`}
                  className="
                    text-[11px] px-[var(--sp-3)] py-[5px]
                    rounded-[var(--radius-sm)]
                    bg-white/12 text-white/70
                    border border-white/15
                    no-underline
                    transition-colors duration-[var(--duration-fast)]
                    hover:bg-white/20
                  "
                >
                  ← 이전 곡
                </Link>
              ) : (
                <span className="text-[11px] px-[var(--sp-3)] py-[5px] text-white/20">← 이전 곡</span>
              )}
              {nextItem ? (
                <Link
                  href={`/artist/${slug}/concert/${cid}/song/${nextItem.id}`}
                  className="
                    text-[11px] px-[var(--sp-3)] py-[5px]
                    rounded-[var(--radius-sm)]
                    bg-white/12 text-white/70
                    border border-white/15
                    no-underline
                    transition-colors duration-[var(--duration-fast)]
                    hover:bg-white/20
                  "
                >
                  다음 곡 →
                </Link>
              ) : (
                <span className="text-[11px] px-[var(--sp-3)] py-[5px] text-white/20">다음 곡 →</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 본문 — 전시관 스타일 ── */}
      <div className="max-w-[780px] mx-auto px-[var(--sp-6)] pb-[var(--sp-16)]">

        {/* ── 1. Live Footage ── */}
        <section className="py-[var(--sp-8)] border-b border-[var(--border-subtle)]">
          <ExhibitLabel>Live Footage</ExhibitLabel>

          {videos.length === 0 ? (
            <EmptyState
              icon="🎬"
              title="등록된 영상이 없어요"
              description="현장 영상 링크를 알고 있다면 등록해주세요"
            />
          ) : (
            <>
              {/* 데스크톱: 3열 그리드 */}
              <div className="hidden md:grid grid-cols-3 gap-[var(--sp-3)]">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
              {/* 모바일: 가로 스크롤 */}
              <div className="md:hidden flex gap-[var(--sp-3)] overflow-x-auto pb-[var(--sp-2)]">
                {videos.map((video) => (
                  <div key={video.id} className="min-w-[160px] flex-shrink-0">
                    <VideoCard video={video} />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ── 2. Fan Event (조건부) ── */}
        {hasFanEvent && (
          <section className="py-[var(--sp-8)] border-b border-[var(--border-subtle)]">
            <ExhibitLabel>Fan Event</ExhibitLabel>
            <div className="flex flex-col gap-[var(--sp-3)]">
              {item.slogan_event && (
                <div className="
                  bg-[var(--brand-dim)]
                  border border-[color:var(--brand)]/18
                  border-l-[3px] border-l-[var(--brand)]
                  rounded-r-[var(--radius-sm)]
                  px-[var(--sp-4)] py-[var(--sp-3)]
                ">
                  <p className="text-[10px] font-bold tracking-[1px] text-[var(--brand)] mb-[var(--sp-1)]">
                    🪄 슬로건 이벤트
                  </p>
                  <p className="text-[13px] text-[var(--text-primary)] leading-relaxed">
                    {item.slogan_event}
                  </p>
                </div>
              )}
              {item.sing_along_event && (
                <div className="
                  bg-[var(--brand-dim)]
                  border border-[color:var(--brand)]/18
                  border-l-[3px] border-l-[var(--brand)]
                  rounded-r-[var(--radius-sm)]
                  px-[var(--sp-4)] py-[var(--sp-3)]
                ">
                  <p className="text-[10px] font-bold tracking-[1px] text-[var(--brand)] mb-[var(--sp-1)]">
                    🎤 떼창 이벤트
                  </p>
                  <p className="text-[13px] text-[var(--text-primary)] leading-relaxed">
                    {item.sing_along_event}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 3. Fan Reviews ── */}
        {/*
          SongReviewSection은 'use client' 컴포넌트예요
          멤버 필터 선택, 후기 작성폼이 클라이언트 인터랙션이 필요해요
          서버에서 fetch한 comments와 slug를 props로 내려줘요
        */}
        <section className="py-[var(--sp-8)] border-b border-[var(--border-subtle)]">
          <ExhibitLabel>Fan Reviews</ExhibitLabel>
          <SongReviewSection
            comments={comments}
            setlistItemId={sid}
            slug={slug}
            cid={cid}
          />
        </section>

        {/* ── 4. Other Appearances ── */}
        <section className="py-[var(--sp-8)] border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-[var(--sp-3)] mb-[var(--sp-5)]">
            <ExhibitLabel className="mb-0">Other Appearances</ExhibitLabel>
            {appearances.length > 0 && (
              <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">
                총 {appearances.length}번 공연에서 불림
              </span>
            )}
          </div>

          {appearances.length === 0 ? (
            <EmptyState
              icon="🎵"
              title="다른 공연 기록이 없어요"
              description="이 곡이 다른 공연에서 불리면 여기에 표시돼요"
            />
          ) : (
            <>
              {/* 데스크톱: 3열 그리드 */}
              <div className="hidden md:grid grid-cols-3 gap-[var(--sp-3)]">
                {visibleAppearances.map((appearance) => (
                  <AppearanceCard
                    key={appearance.id}
                    appearance={appearance}
                    slug={appearance.concerts?.artists?.slug ?? slug}
                  />
                ))}
                {/* 더보기 카드 */}
                {remainingCount > 0 && (
                  <div className="
                    flex items-center justify-center
                    rounded-[var(--radius-md)]
                    border border-dashed border-[var(--border-default)]
                    bg-[var(--bg-elevated)]
                    text-[11px] text-[var(--text-muted)]
                    cursor-pointer
                    hover:border-[var(--border-strong)]
                    hover:text-[var(--text-secondary)]
                    transition-colors duration-[var(--duration-fast)]
                    min-h-[80px]
                  ">
                    +{remainingCount}개 더보기 →
                  </div>
                )}
              </div>

              {/* 모바일: 리스트 */}
              <div className="md:hidden flex flex-col gap-[var(--sp-2)]">
                {visibleAppearances.slice(0, 2).map((appearance) => (
                  <AppearanceCard
                    key={appearance.id}
                    appearance={appearance}
                    slug={appearance.concerts?.artists?.slug ?? slug}
                    compact
                  />
                ))}
                {appearances.length > 2 && (
                  <div className="
                    text-center py-[var(--sp-3)]
                    border border-dashed border-[var(--border-default)]
                    rounded-[var(--radius-sm)]
                    text-[10px] text-[var(--text-muted)]
                    bg-[var(--bg-elevated)]
                  ">
                    +{appearances.length - 2}개 공연 더보기 →
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        {/* ── 5. 이전/다음 곡 네비게이션 ── */}
        <div className="flex border-t border-[var(--border-subtle)] mt-[var(--sp-4)]">
          {/* 이전 곡 */}
          <div className="flex-1">
            {prevItem ? (
              <Link
                href={`/artist/${slug}/concert/${cid}/song/${prevItem.id}`}
                className="
                  flex items-center gap-[var(--sp-3)]
                  px-[var(--sp-4)] py-[var(--sp-4)]
                  no-underline group
                  hover:bg-[var(--bg-surface)]
                  transition-colors duration-[var(--duration-fast)]
                  rounded-bl-[var(--radius-lg)]
                "
              >
                <div>
                  <p className="
                    font-[family-name:var(--font-serif)] italic
                    text-[10px] tracking-[2px] uppercase
                    text-[var(--text-muted)]
                  ">
                    ← 이전 곡
                  </p>
                  <p className="
                    text-[14px] font-medium
                    text-[var(--text-primary)]
                    group-hover:text-[var(--theme,var(--brand))]
                    transition-colors duration-[var(--duration-fast)]
                    mt-[2px]
                  ">
                    {prevItem.songs?.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="px-[var(--sp-4)] py-[var(--sp-4)]">
                <p className="font-[family-name:var(--font-serif)] italic text-[10px] tracking-[2px] uppercase text-[var(--text-muted)]">← 이전 곡</p>
                <p className="text-[14px] text-[var(--text-muted)] mt-[2px]">—</p>
              </div>
            )}
          </div>

          {/* 구분선 */}
          <div className="w-[1px] bg-[var(--border-subtle)]" />

          {/* 다음 곡 */}
          <div className="flex-1">
            {nextItem ? (
              <Link
                href={`/artist/${slug}/concert/${cid}/song/${nextItem.id}`}
                className="
                  flex items-center justify-end gap-[var(--sp-3)]
                  px-[var(--sp-4)] py-[var(--sp-4)]
                  no-underline group
                  hover:bg-[var(--bg-surface)]
                  transition-colors duration-[var(--duration-fast)]
                  rounded-br-[var(--radius-lg)]
                "
              >
                <div className="text-right">
                  <p className="
                    font-[family-name:var(--font-serif)] italic
                    text-[10px] tracking-[2px] uppercase
                    text-[var(--text-muted)]
                  ">
                    다음 곡 →
                  </p>
                  <p className="
                    text-[14px] font-medium
                    text-[var(--text-primary)]
                    group-hover:text-[var(--theme,var(--brand))]
                    transition-colors duration-[var(--duration-fast)]
                    mt-[2px]
                  ">
                    {nextItem.songs?.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="px-[var(--sp-4)] py-[var(--sp-4)] text-right">
                <p className="font-[family-name:var(--font-serif)] italic text-[10px] tracking-[2px] uppercase text-[var(--text-muted)]">다음 곡 →</p>
                <p className="text-[14px] text-[var(--text-muted)] mt-[2px]">—</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 모바일 하단 탭바 여백 */}
      <div className="h-[56px] md:hidden" />
    </>
  )
}

// ─────────────────────────────────────────────
// 서브 컴포넌트 — 이 파일 안에서만 쓰는 작은 컴포넌트들
// 페이지 전용이라 별도 파일로 분리하지 않아요
// ─────────────────────────────────────────────

// 섹션 레이블 — Cormorant Garamond 이탤릭 + 구분선
function ExhibitLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-[var(--sp-3)] mb-[var(--sp-5)] ${className}`}>
      <span className="
        font-[family-name:var(--font-serif)] italic
        text-[11px] tracking-[4px] uppercase
        text-[var(--text-muted)]
        whitespace-nowrap
      ">
        {children}
      </span>
      <div className="flex-1 h-[1px] bg-[var(--border-subtle)]" />
    </div>
  )
}

// 영상 카드
function VideoCard({ video }: { video: { id: string; video_url: string; platform: string | null; title: string | null } }) {
  const platform = video.platform ?? 'other'
  const style = PLATFORM_STYLE[platform] ?? PLATFORM_STYLE.other

  return (
    <a
      href={video.video_url}
      target="_blank"
      rel="noreferrer noopener"
      className="
        block no-underline group
        rounded-[var(--radius-md)]
        border border-[var(--border-subtle)]
        bg-[var(--bg-surface)]
        overflow-hidden
        transition-all duration-[var(--duration-fast)]
        hover:border-[color:var(--theme,var(--brand))]/50
        hover:shadow-[var(--shadow-md)]
      "
    >
      {/* 썸네일 — 16:9 */}
      <div className="relative w-full aspect-video bg-[var(--bg-overlay)] flex items-center justify-center">
        <span className="
          w-8 h-8 rounded-full
          bg-black/50
          flex items-center justify-center
          text-white text-[12px]
          group-hover:scale-110
          transition-transform duration-[var(--duration-fast)]
        ">
          ▶
        </span>
        {/* 플랫폼 배지 */}
        <span className={`
          absolute top-[6px] right-[6px]
          text-[8px] font-bold px-[5px] py-[2px] rounded-[3px]
          ${style.className}
        `}>
          {style.label}
        </span>
      </div>
      {/* 영상 정보 */}
      <div className="px-[var(--sp-2)] py-[var(--sp-2)]">
        <p className="text-[10px] font-medium text-[var(--text-secondary)] leading-snug line-clamp-2">
          {video.title ?? video.video_url}
        </p>
      </div>
    </a>
  )
}

// Other Appearances 카드
function AppearanceCard({
  appearance,
  slug,
  compact = false,
}: {
  appearance: {
    id: string
    order_num: number
    concerts: {
      id: string
      title: string
      date: string
      tour_name: string | null
      artist_id: string | null
      artists: { slug: string } | null
    } | null
  }
  slug: string
  compact?: boolean
}) {
  const concert = appearance.concerts
  if (!concert) return null

  const href = `/artist/${slug}/concert/${concert.id}/song/${appearance.id}`

  return (
    <Link
      href={href}
      className={[
        'block no-underline group',
        'rounded-[var(--radius-md)]',
        'border border-[var(--border-subtle)]',
        'bg-[var(--bg-surface)]',
        'transition-all duration-[var(--duration-fast)]',
        'hover:border-[color:var(--theme,var(--brand))]/50',
        'hover:shadow-[var(--shadow-sm)]',
        compact ? 'px-[var(--sp-3)] py-[var(--sp-3)]' : 'px-[var(--sp-3)] py-[var(--sp-3)]',
      ].join(' ')}
    >
      {/* 콘서트명 */}
      <p className="
        text-[12px] font-medium
        text-[var(--text-primary)]
        group-hover:text-[var(--theme,var(--brand))]
        transition-colors duration-[var(--duration-fast)]
        leading-snug mb-[var(--sp-1)]
        flex items-start gap-[5px]
      ">
        <span
          className="inline-block w-[7px] h-[7px] rounded-full mt-[4px] flex-shrink-0"
          style={{ backgroundColor: 'var(--theme, var(--brand))' }}
        />
        {concert.title}
      </p>
      {/* 날짜 + 장소 */}
      <p className="text-[10px] text-[var(--text-muted)]">
        {new Date(concert.date).toLocaleDateString('ko-KR')}
  
      </p>
      {/* 트랙 번호 */}
      {appearance.order_num && (
        <span className="
          inline-block mt-[var(--sp-2)]
          text-[9px] px-[5px] py-[1px]
          rounded-[3px]
          bg-[color:var(--theme,var(--brand))]/10
          text-[var(--theme,var(--brand))]
          border border-[color:var(--theme,var(--brand))]/25
        ">
          Track {String(appearance.order_num).padStart(2, '0')}
        </span>
      )}
    </Link>
  )
}