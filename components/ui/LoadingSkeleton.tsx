import { HTMLAttributes } from 'react'

// ─────────────────────────────────────────────
// 기본 Skeleton 블록
//
// 모든 스켈레톤의 기반이 되는 단일 블록이에요
// 너비/높이/반경을 props로 받아서 다양한 형태로 쓸 수 있어요
// ─────────────────────────────────────────────

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  // 너비 — Tailwind 클래스로 넘겨요 (예: 'w-full', 'w-32')
  width?: string
  // 높이 — Tailwind 클래스로 넘겨요 (예: 'h-4', 'h-48')
  height?: string
  // 반경 — Tailwind 클래스로 넘겨요 (예: 'rounded-full', 'rounded-lg')
  rounded?: string
}

export function Skeleton({
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded-[var(--radius-sm)]',
  className = '',
  ...rest
}: SkeletonProps) {
  return (
    <div
      className={[
        width,
        height,
        rounded,
        // --bg-overlay를 배경으로 써요
        // 디자인 시스템 스펙: 이미지 로딩 중 배경색으로 지정된 값이에요
        'bg-[var(--bg-overlay)]',
        // animate-pulse: Tailwind 기본 애니메이션
        // opacity가 1 → 0.5 → 1로 반복돼서 "깜빡이는" 느낌을 줘요
        // 사용자에게 "아직 로딩 중"이라는 시각적 신호가 돼요
        'animate-pulse',
        className,
      ].join(' ')}
      // 스크린 리더에 "로딩 중"임을 알려줘요 (접근성)
      aria-hidden="true"
      {...rest}
    />
  )
}

// ─────────────────────────────────────────────
// 프리셋 스켈레톤
//
// 매번 width/height를 조합하는 대신
// CONCERTORY에서 자주 쓰이는 형태를 미리 만들어요
// 사용하는 쪽에서 코드가 훨씬 간결해져요
// ─────────────────────────────────────────────

// 공연 카드 스켈레톤
// 메인 홈, 아티스트 홈의 공연 카드 그리드에 쓰여요
function ConcertCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      {/* 썸네일 영역 — 16:9 비율 */}
      <Skeleton width="w-full" height="h-0 pb-[56.25%]" rounded="rounded-none" />
      <div className="p-[var(--sp-4)] flex flex-col gap-[var(--sp-2)]">
        {/* 배지 */}
        <Skeleton width="w-16" height="h-[18px]" rounded="rounded-full" />
        {/* 공연명 */}
        <Skeleton width="w-3/4" height="h-5" />
        {/* 날짜 + 장소 */}
        <Skeleton width="w-1/2" height="h-4" />
      </div>
    </div>
  )
}

// 세트리스트 트랙 스켈레톤
// 세트리스트 페이지의 트랙 목록에 쓰여요
function TrackSkeleton() {
  return (
    <div className="flex items-center gap-[var(--sp-4)] py-[var(--sp-3)] border-b border-[var(--border-subtle)]">
      {/* 트랙 번호 */}
      <Skeleton width="w-6" height="h-4" />
      <div className="flex-1 flex flex-col gap-[var(--sp-1)]">
        {/* 곡 제목 */}
        <Skeleton width="w-2/5" height="h-4" />
        {/* 섹션 배지 */}
        <Skeleton width="w-16" height="h-[14px]" rounded="rounded-full" />
      </div>
      {/* 의상 썸네일 */}
      <Skeleton width="w-10" height="h-10" rounded="rounded-[var(--radius-sm)]" />
    </div>
  )
}

// 한 줄 후기 스켈레톤
// 곡 상세 페이지 Fan Reviews 섹션에 쓰여요
function CommentSkeleton() {
  return (
    <div className="flex gap-[var(--sp-3)] py-[var(--sp-3)] border-b border-[var(--border-subtle)]">
      {/* 아바타 */}
      <Skeleton width="w-8" height="h-8" rounded="rounded-full" />
      <div className="flex-1 flex flex-col gap-[var(--sp-2)]">
        {/* 닉네임 */}
        <Skeleton width="w-20" height="h-3" />
        {/* 후기 텍스트 */}
        <Skeleton width="w-full" height="h-4" />
        <Skeleton width="w-3/5" height="h-4" />
      </div>
    </div>
  )
}

// 아티스트 히어로 배너 스켈레톤
function ArtistHeroSkeleton() {
  return (
    <div className="w-full rounded-[var(--radius-xl)] overflow-hidden">
      <Skeleton width="w-full" height="h-48 md:h-64" rounded="rounded-none" />
    </div>
  )
}

// ─────────────────────────────────────────────
// 반복 렌더링 헬퍼
//
// 스켈레톤은 보통 여러 개를 반복해서 보여줘요
// Array.from으로 count만큼 반복 렌더링하는 헬퍼예요
// 예: <SkeletonList count={6} renderItem={() => <ConcertCardSkeleton />} />
// ─────────────────────────────────────────────

interface SkeletonListProps {
  count: number
  renderItem: (index: number) => React.ReactNode
  className?: string
}

function SkeletonList({ count, renderItem, className = '' }: SkeletonListProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        // index를 key로 써요
        // 스켈레톤은 순서가 바뀌거나 재정렬될 일이 없어서
        // index를 key로 써도 안전해요
        <div key={i}>{renderItem(i)}</div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// 네임스페이스로 묶어서 export
//
// import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
// <LoadingSkeleton.ConcertCard /> 처럼 쓸 수 있어요
// 어떤 스켈레톤인지 이름만 봐도 바로 알 수 있어요
// ─────────────────────────────────────────────

export const LoadingSkeleton = {
  Block: Skeleton,          // 기본 블록 (커스텀용)
  ConcertCard: ConcertCardSkeleton,
  Track: TrackSkeleton,
  Comment: CommentSkeleton,
  ArtistHero: ArtistHeroSkeleton,
  List: SkeletonList,
}