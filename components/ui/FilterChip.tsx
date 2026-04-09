import { ButtonHTMLAttributes, ReactNode } from 'react'

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // 선택 여부 — 부모 컴포넌트가 상태를 관리하고 내려줘요
  // 왜 내부 상태로 안 쓰나요?
  //   필터 칩은 보통 여러 개가 함께 동작해요
  //   "아티스트 필터에서 aespa 선택 → SHINee도 추가 선택"처럼
  //   선택된 목록 전체를 부모가 알아야 실제 필터링이 가능해요
  //   칩 내부에서만 상태를 가지면 부모가 "지금 뭐가 선택됐는지"를
  //   알 방법이 없어요
  isSelected?: boolean
  // 칩 왼쪽에 아이콘이나 색상 점 등을 넣을 수 있어요
  // 예: 아티스트 테마 컬러 점, lucide 아이콘
  leftSlot?: ReactNode
  // artist 필터 칩 전용: 선택 시 테마 컬러 적용
  artistColor?: string
  artistDim?: string
}

// ─────────────────────────────────────────────
// 컴포넌트
//
// 디자인 시스템 스펙:
//   기본: border --border-default, color --text-muted
//   활성: border 강조, bg-dim, color 아티스트 테마 or 브랜드
// ─────────────────────────────────────────────

export function FilterChip({
  isSelected = false,
  leftSlot,
  artistColor,
  artistDim,
  className = '',
  style,
  children,
  disabled,
  ...rest
}: FilterChipProps) {
  // artistColor가 있으면 CSS 변수로 주입해요
  // 없으면 브랜드 컬러를 폴백으로 사용해요
  const chipStyle =
    artistColor
      ? ({
          '--chip-color': artistColor,
          '--chip-dim': artistDim ?? `${artistColor}26`, // 26 = 15% opacity (hex)
          ...style,
        } as React.CSSProperties)
      : style

  return (
    <button
      style={chipStyle}
      disabled={disabled}
      className={[
        // 기본 구조
        'inline-flex items-center gap-[var(--sp-1)]',
        'text-[12px] font-medium',
        'px-[var(--sp-3)] py-[6px]',
        'rounded-[var(--radius-full)]',   // 디자인 시스템: 칩은 pill 형태
        'border',
        'transition-all duration-[var(--duration-fast,120ms)]',
        'cursor-pointer select-none whitespace-nowrap',
        'outline-none',

        // 선택 상태에 따라 스타일 분기
        isSelected
          ? [
              // artistColor가 있으면 테마 컬러, 없으면 브랜드 컬러
              artistColor
                ? 'bg-[var(--chip-dim)] text-[var(--chip-color)] border-[color:var(--chip-color)]/40'
                : 'bg-[var(--brand-dim)] text-[var(--brand)] border-[color:var(--brand)]/40',
            ].join(' ')
          : [
              // 비선택 상태
              'bg-transparent',
              'text-[var(--text-muted)]',
              'border-[var(--border-default)]',
              'hover:text-[var(--text-secondary)]',
              'hover:border-[var(--border-strong)]',
            ].join(' '),

        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ].join(' ')}
      // 토글 버튼임을 스크린 리더에 알려줘요 (접근성)
      aria-pressed={isSelected}
      {...rest}
    >
      {leftSlot && (
        <span className="flex-shrink-0">{leftSlot}</span>
      )}
      {children}
    </button>
  )
}