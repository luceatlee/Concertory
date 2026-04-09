// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

type GlowVariant = 'brand' | 'artist'

interface GlowBackgroundProps {
  variant?: GlowVariant
  // 글로우 위치 — 페이지 성격에 따라 달라요
  // top: 히어로 섹션 위에서 내려오는 조명 느낌 (기본값)
  // bottom: 하단에서 올라오는 무대 조명 느낌
  // both: 상하 모두
  position?: 'top' | 'bottom' | 'both'
  className?: string
}

// ─────────────────────────────────────────────
// 컴포넌트
//
// 'use client' 없는 이유:
//   상태도 없고 이벤트도 없어요
//   CSS 변수만 참조하는 순수 표시용이라 서버 컴포넌트로 충분해요
//
// pointer-events-none + -z-10:
//   글로우는 순수 장식 요소예요
//   클릭이나 스크롤을 방해하면 안 되고,
//   항상 콘텐츠 뒤에 있어야 해요
//
// position: fixed vs absolute:
//   fixed를 써서 스크롤해도 글로우가 따라오지 않게 해요
//   페이지 전체 분위기를 잡는 배경이라 스크롤과 무관하게
//   항상 같은 자리에 있는 게 자연스러워요
// ─────────────────────────────────────────────

export function GlowBackground({
  variant = 'brand',
  position = 'top',
  className = '',
}: GlowBackgroundProps) {
  // variant에 따라 글로우 색상 CSS 변수를 결정해요
  // artist는 ArtistTheme.tsx가 --theme-glow를 주입하고,
  // brand는 globals.css의 --brand-glow를 직접 써요
  const glowColor =
    variant === 'artist'
      ? 'var(--theme-glow, var(--brand-glow))'
      : 'var(--brand-glow)'

  // 상단 글로우: 페이지 위에서 내려오는 조명
  const topGlow = `radial-gradient(ellipse 80% 40% at 50% -10%, ${glowColor}, transparent 70%)`

  // 하단 글로우: 무대 바닥에서 올라오는 조명
  const bottomGlow = `radial-gradient(ellipse 60% 30% at 50% 110%, ${glowColor}, transparent 70%)`

  const backgroundImage =
    position === 'both'
      ? `${topGlow}, ${bottomGlow}`
      : position === 'bottom'
      ? bottomGlow
      : topGlow

  return (
    <div
      aria-hidden="true"
      className={[
        'fixed inset-0 -z-10',
        'pointer-events-none',
        className,
      ].join(' ')}
      style={{ backgroundImage }}
    />
  )
}