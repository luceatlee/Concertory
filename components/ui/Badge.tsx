import { HTMLAttributes } from 'react'

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

type BadgeVariant =
  | 'brand'    // 브랜드 핑크 — 서비스 전반 포인트
  | 'artist'   // 아티스트 테마 색 — ArtistTheme 컨텍스트 안에서 사용
  | 'success'  // 승인 / 완료
  | 'warning'  // 대기 / 주의
  | 'error'    // 오류 / 반려 / 신고
  | 'info'     // 정보 / 안내
  | 'muted'    // 비활성 / 일반 태그

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  // artist variant 전용: ArtistTheme 밖에서도 색상을 직접 넘길 수 있어요
  artistColor?: string
  artistDim?: string
  artistBorder?: string
}

// ─────────────────────────────────────────────
// 스타일 맵
//
// 디자인 시스템 스펙:
//   font-size: 10px / font-weight: 600
//   padding: 3px 9px / border-radius: --radius-full
//
// 각 variant는 dim(배경) + color(텍스트) + border 조합으로 구성돼요
// 시맨틱 컬러(success/warning/error/info)는 globals.css의
// CSS 변수를 직접 참조해서 디자인 시스템과 항상 동기화돼요
// ─────────────────────────────────────────────

const variantClasses: Record<BadgeVariant, string> = {
  brand: [
    'bg-[var(--brand-dim)]',
    'text-[var(--brand)]',
    'border border-[color:var(--brand)]/25',
  ].join(' '),

  // CSS 변수 --theme, --theme-dim은 ArtistTheme.tsx가 주입해요
  // 폴백으로 --brand 계열을 써서 컨텍스트 밖에서도 깨지지 않아요
  artist: [
    'bg-[var(--theme-dim,var(--brand-dim))]',
    'text-[var(--theme,var(--brand))]',
    'border border-[color:var(--theme,var(--brand))]/25',
  ].join(' '),

  success: [
    'bg-[color:var(--success)]/15',
    'text-[var(--success)]',
    'border border-[color:var(--success)]/25',
  ].join(' '),

  warning: [
    'bg-[color:var(--warning)]/15',
    'text-[var(--warning)]',
    'border border-[color:var(--warning)]/25',
  ].join(' '),

  error: [
    'bg-[color:var(--error)]/15',
    'text-[var(--error)]',
    'border border-[color:var(--error)]/25',
  ].join(' '),

  info: [
    'bg-[color:var(--info)]/15',
    'text-[var(--info)]',
    'border border-[color:var(--info)]/25',
  ].join(' '),

  // 태그, 라벨 등 강조가 필요 없는 일반 배지
  muted: [
    'bg-white/[0.06]',
    'text-[var(--text-muted)]',
    'border border-white/10',
  ].join(' '),
}

// ─────────────────────────────────────────────
// 컴포넌트
//
// Button과 달리 forwardRef를 쓰지 않은 이유:
//   Badge는 순수 표시용 요소라 DOM 직접 접근이
//   거의 필요하지 않아요. 불필요한 복잡도는 안 넣는 게 좋아요.
//   나중에 필요해지면 그때 추가하면 돼요 (YAGNI 원칙)
// ─────────────────────────────────────────────

export function Badge({
  variant = 'brand',
  artistColor,
  artistDim,
  artistBorder,
  className = '',
  style,
  children,
  ...rest
}: BadgeProps) {
  // artist variant에 색상을 직접 prop으로 넘긴 경우
  // 인라인 CSS 변수로 주입해요
  const artistStyle =
    variant === 'artist' && (artistColor || artistDim || artistBorder)
      ? ({
          '--theme': artistColor,
          '--theme-dim': artistDim,
          '--theme-border': artistBorder,
          ...style,
        } as React.CSSProperties)
      : style

  return (
    <span
      style={artistStyle}
      className={[
        // 공통 기본 스타일
        // uppercase + tracking-widest: 10px 소문자는 너무 작아서
        // 대문자 + 자간으로 레이블처럼 보이게 해요
        'inline-flex items-center',
        'text-[10px] font-semibold uppercase tracking-widest',
        'px-[9px] py-[3px]',
        'rounded-[var(--radius-full)]',
        'leading-none',            // 줄 높이를 딱 텍스트 높이로 맞춰요
        'whitespace-nowrap',       // 뱃지 텍스트가 줄바꿈 되지 않게 해요
        variantClasses[variant],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </span>
  )
}