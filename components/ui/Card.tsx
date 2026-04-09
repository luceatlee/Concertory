import { HTMLAttributes, forwardRef } from 'react'

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

type CardVariant =
  | 'default'  // 기본 카드 — 대부분의 경우
  | 'artist'   // 아티스트 테마 컬러 hover 적용
  | 'flat'     // 테두리 없는 단순 배경 — 중첩 카드나 사이드바 내부용

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  // 클릭 가능한 카드일 때 true로 설정
  // hover 커서 + 인터랙션 스타일이 활성화돼요
  clickable?: boolean
}

// ─────────────────────────────────────────────
// 스타일 맵
//
// 디자인 시스템 스펙:
//   배경: --bg-surface
//   테두리: 1px solid --border-subtle
//   반경: --radius-lg (12px)
//   호버: border-color → --border-strong, box-shadow: --shadow-md
// ─────────────────────────────────────────────

const variantClasses: Record<CardVariant, string> = {
  default: [
    'bg-[var(--bg-surface)]',
    'border border-[var(--border-subtle)]',
  ].join(' '),

  // artist: hover 시 테두리가 아티스트 테마 컬러로 바뀌어요
  // --theme은 ArtistTheme.tsx가 주입하며, 폴백으로 --brand를 써요
  artist: [
    'bg-[var(--bg-surface)]',
    'border border-[var(--border-subtle)]',
    'hover:border-[color:var(--theme,var(--brand))]/50',
  ].join(' '),

  // flat: 테두리 없이 배경만 있는 카드
  // 카드 안에 카드가 중첩될 때 시각적 노이즈를 줄여줘요
  flat: [
    'bg-[var(--bg-elevated)]',
    'border border-transparent',
  ].join(' '),
}

// clickable일 때만 추가되는 스타일
// 항상 붙이면 클릭 안 되는 카드에도 커서가 바뀌어서 사용자를 혼란스럽게 해요
const clickableClasses = [
  'cursor-pointer',
  'hover:border-[var(--border-strong)]',
  'hover:shadow-[var(--shadow-md)]',
  'active:scale-[0.99]',  // 눌렸을 때 살짝 줄어드는 피드백
].join(' ')

// ─────────────────────────────────────────────
// 서브 컴포넌트
//
// Card.Header / Card.Body / Card.Footer 패턴을 쓰는 이유:
//   - 카드 내부 구조를 일관되게 유지할 수 있어요
//   - 사용하는 쪽에서 import를 Card 하나만 해도 돼요
//   - 예: <Card><Card.Header>...</Card.Header><Card.Body>...</Card.Body></Card>
//   - 강제는 아니라서 그냥 <Card>...</Card>로 써도 돼요
// ─────────────────────────────────────────────

function CardHeader({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        'px-[var(--sp-4)] pt-[var(--sp-4)] pb-[var(--sp-3)]',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}

function CardBody({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        'px-[var(--sp-4)] py-[var(--sp-3)]',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}

function CardFooter({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        'px-[var(--sp-4)] pt-[var(--sp-3)] pb-[var(--sp-4)]',
        // 푸터 위에 구분선을 그어서 본문과 분리해요
        'border-t border-[var(--border-subtle)]',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
// 메인 컴포넌트
//
// forwardRef를 쓰는 이유:
//   clickable 카드는 부모에서 ref로 포커스를 관리하거나
//   Intersection Observer(스크롤 감지)에 연결할 수 있어요
// ─────────────────────────────────────────────

export const Card = Object.assign(
  forwardRef<HTMLDivElement, CardProps>(
    (
      {
        variant = 'default',
        clickable = false,
        className = '',
        children,
        ...rest
      },
      ref
    ) => {
      return (
        <div
          ref={ref}
          className={[
            'rounded-[var(--radius-lg)]',
            // overflow-hidden: 자식 요소(이미지 등)가
            // 카드의 둥근 모서리 밖으로 삐져나오지 않게 해요
            'overflow-hidden',
            'transition-all duration-[var(--duration-normal,200ms)]',
            variantClasses[variant],
            clickable ? clickableClasses : '',
            className,
          ].join(' ')}
          // clickable 카드는 키보드로도 접근 가능하게 해요 (접근성)
          // role="button"과 tabIndex를 함께 써야 스크린 리더가 인식해요
          role={clickable ? 'button' : undefined}
          tabIndex={clickable ? 0 : undefined}
          {...rest}
        >
          {children}
        </div>
      )
    }
  ),
  // Object.assign으로 서브 컴포넌트를 Card에 붙여요
  // Card.Header, Card.Body, Card.Footer로 접근 가능해져요
  {
    Header: CardHeader,
    Body: CardBody,
    Footer: CardFooter,
  }
)

Card.displayName = 'Card'