import { ButtonHTMLAttributes, forwardRef } from 'react'

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'artist'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  // artist variant 전용: 아티스트 테마 컬러를 인라인 스타일로 주입할 때 사용
  // 예: <Button variant="artist" artistColor="#9CEAFE" artistGlow="rgba(156,234,254,0.35)">
  artistColor?: string
  artistGlow?: string
}

// ─────────────────────────────────────────────
// 스타일 맵
//
// 왜 객체 맵으로 관리하나요?
//   - 조건부 문자열 연결(if/else나 삼항 연산자 중첩)보다 가독성이 높아요
//   - variant나 size가 추가될 때 이 맵만 수정하면 되므로 유지보수가 쉬워요
//   - TypeScript가 키를 타입으로 검사해줘서 오타를 빌드 타임에 잡아줘요
// ─────────────────────────────────────────────

const variantClasses: Record<ButtonVariant, string> = {
  // Primary: 브랜드 컬러 배경 + 글로우 효과
  // box-shadow의 glow는 CSS 변수 --brand-glow를 사용해
  // 전역 디자인 시스템과 연동돼요
  primary: [
    'bg-[var(--brand)] text-white',
    'shadow-[0_0_16px_var(--brand-glow)]',
    'hover:shadow-[0_0_24px_var(--brand-glow)]',
    'disabled:bg-[var(--bg-overlay)] disabled:text-[var(--text-muted)]',
    'disabled:shadow-none disabled:opacity-50',
  ].join(' '),

  // Secondary: 투명 배경 + 브랜드 컬러 테두리
  // 배경 없이 테두리만 있어서 Primary보다 시각적 무게가 가벼워요
  secondary: [
    'bg-transparent text-[var(--brand)]',
    'border border-[var(--brand)]',
    'hover:bg-[var(--brand-dim)]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),

  // Ghost: 가장 가볍고 덜 강조되는 버튼
  // 툴바나 카드 내부 보조 액션에 사용해요
  ghost: [
    'bg-transparent text-[var(--text-secondary)]',
    'border border-[var(--border-default)]',
    'hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),

  // Danger: 삭제/신고 등 파괴적 액션 전용
  // 빨간색이 눈에 띄어서 실수로 누르는 걸 방지해요
  danger: [
    'bg-transparent text-[var(--error)]',
    'border border-[color:var(--error)]/30',
    'hover:bg-[color:var(--error)]/10 hover:border-[var(--error)]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),

  // Artist: 아티스트 페이지 전용 CTA
  // CSS 변수 --theme, --theme-glow는 ArtistTheme.tsx에서
  // 아티스트별로 동적으로 주입돼요
  // artistColor/artistGlow prop으로 직접 넘길 수도 있어요
  artist: [
    'text-white',
    'bg-[var(--theme,var(--brand))]',
    'shadow-[0_0_16px_var(--theme-glow,var(--brand-glow))]',
    'hover:shadow-[0_0_24px_var(--theme-glow,var(--brand-glow))]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
  ].join(' '),
}

const sizeClasses: Record<ButtonSize, string> = {
  // 디자인 시스템 스펙: sm=11px/6px 14px, md=13px/9px 20px, lg=14px/12px 28px
  sm: 'text-[11px] px-[14px] py-[6px]',
  md: 'text-[13px] px-[20px] py-[9px]',
  lg: 'text-[14px] px-[28px] py-[12px]',
}

// ─────────────────────────────────────────────
// 컴포넌트
//
// forwardRef를 쓰는 이유:
//   부모 컴포넌트가 버튼 DOM 노드에 직접 접근해야 할 때
//   (예: focus 관리, 애니메이션 라이브러리 연동)를 위해서예요
//   아직 당장 필요하지 않더라도 처음부터 지원해두면
//   나중에 컴포넌트를 갈아엎을 필요가 없어요
// ─────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      artistColor,
      artistGlow,
      className = '',
      children,
      disabled,
      style,
      ...rest
    },
    ref
  ) => {
    // artist variant에서 prop으로 색상을 직접 넘긴 경우
    // CSS 변수를 인라인으로 주입해요
    // ArtistTheme 컨텍스트 밖에서도 독립적으로 쓸 수 있게요
    const artistStyle =
      variant === 'artist' && (artistColor || artistGlow)
        ? ({
            '--theme': artistColor,
            '--theme-glow': artistGlow,
            ...style,
          } as React.CSSProperties)
        : style

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={artistStyle}
        className={[
          // 공통 기본 스타일
          // font-weight: 500(medium)은 버튼 텍스트의 기본 굵기예요
          // tracking-wide는 대문자 레이블에 letter-spacing을 줘서 레이블처럼 보이게 해요
          'inline-flex items-center justify-center gap-2',
          'font-medium tracking-wide',
          'rounded-[var(--radius-sm)]',
          // transition: 디자인 시스템 --duration-fast(120ms), --ease 변수 사용
          'transition-all duration-[var(--duration-fast,120ms)]',
          'cursor-pointer select-none',
          'whitespace-nowrap',
          // variant / size 스타일 적용
          variantClasses[variant],
          sizeClasses[size],
          // 외부에서 추가 클래스 주입 가능 (확장성)
          className,
        ].join(' ')}
        {...rest}
      >
        {/* 로딩 상태일 때 스피너 표시 */}
        {isLoading && (
          <span
            // animate-spin은 Tailwind 기본 유틸리티예요
            className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    )
  }
)

// displayName 지정:
// React DevTools에서 컴포넌트 이름이 'ForwardRef'가 아닌
// 'Button'으로 표시되어 디버깅이 편해져요
Button.displayName = 'Button'