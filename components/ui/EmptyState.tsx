import { ReactNode } from 'react'

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

interface EmptyStateProps {
  // 이모지 아이콘 — 디자인 시스템 스펙: 이모지 (opacity: 0.5)
  icon?: string
  // 주요 안내 문구 — 14px 500 --text-secondary
  title: string
  // 보조 안내 문구 — 12px --text-muted
  description?: string
  // 액션 버튼 등 추가 요소 (선택)
  // 예: <Button variant="primary">공연 둘러보기</Button>
  action?: ReactNode
  // 컨테이너 추가 클래스
  className?: string
}

// ─────────────────────────────────────────────
// 컴포넌트
//
// 왜 forwardRef, 'use client' 없나요?
//   순수 표시용 컴포넌트라 상태도 없고 DOM 접근도 필요 없어요
//   가장 단순한 형태로 유지해요
//
// 디자인 시스템 스펙:
//   border: 1px dashed --border-default
//   border-radius: --radius-lg
//   bg: --bg-surface
//   이모지: opacity 0.5
//   title: 14px / 500 / --text-secondary
//   description: 12px / --text-muted
// ─────────────────────────────────────────────

export function EmptyState({
  icon = '🎤',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={[
        // 디자인 시스템 스펙: dashed 테두리 + surface 배경
        'flex flex-col items-center justify-center text-center',
        'border border-dashed border-[var(--border-default)]',
        'rounded-[var(--radius-lg)]',
        'bg-[var(--bg-surface)]',
        // 충분한 상하 여백으로 "비어있음"을 공간감으로 표현해요
        'px-[var(--sp-6)] py-[var(--sp-10)]',
        'gap-[var(--sp-2)]',
        className,
      ].join(' ')}
    >
      {/* 이모지 아이콘 */}
      <span
        className="text-4xl leading-none"
        // opacity-50: 디자인 시스템 스펙
        // 너무 선명하면 시선을 끌어서 안내 문구보다 먼저 보여요
        style={{ opacity: 0.5 }}
        aria-hidden="true"
      >
        {icon}
      </span>

      {/* 주요 안내 문구 */}
      <p className="text-[14px] font-medium text-[var(--text-secondary)] mt-[var(--sp-1)]">
        {title}
      </p>

      {/* 보조 안내 문구 */}
      {description && (
        <p className="text-[12px] text-[var(--text-muted)]">
          {description}
        </p>
      )}

      {/* 액션 버튼 등 */}
      {action && (
        <div className="mt-[var(--sp-3)]">
          {action}
        </div>
      )}
    </div>
  )
}