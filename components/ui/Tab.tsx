'use client' //useState로 활성 탭 관리

import { createContext, useContext, useState, ReactNode, HTMLAttributes } from 'react'

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

type TabVariant =
  | 'default'  // 기본 — 활성 탭이 --text-primary
  | 'artist'   // 아티스트 페이지 — 활성 탭이 --theme 컬러

interface TabContextValue {
  active: string
  setActive: (value: string) => void
  variant: TabVariant
}

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  // 기본으로 활성화될 탭의 value
  defaultValue: string
  variant?: TabVariant
  children: ReactNode
}

interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

interface TabTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  // Tab.Content의 value와 짝을 이뤄야 해요
  value: string
  children: ReactNode
}

interface TabContentProps extends HTMLAttributes<HTMLDivElement> {
  // Tab.Trigger의 value와 짝을 이뤄야 해요
  value: string
  children: ReactNode
}

// ─────────────────────────────────────────────
// Context
//
// 왜 Context를 쓰나요?
//   Tabs > TabList > TabTrigger 처럼 컴포넌트가 중첩돼 있을 때
//   "현재 어떤 탭이 활성화됐는지"를 props로 하나하나 내려주면
//   코드가 복잡해져요 (prop drilling)
//   Context를 쓰면 어느 깊이의 자식이든 바로 꺼내 쓸 수 있어요
// ─────────────────────────────────────────────

const TabContext = createContext<TabContextValue | null>(null)

function useTabContext() {
  const ctx = useContext(TabContext)
  if (!ctx) throw new Error('Tab 컴포넌트는 반드시 <Tabs> 안에서 사용해야 해요')
  return ctx
}

// ─────────────────────────────────────────────
// 서브 컴포넌트
// ─────────────────────────────────────────────

function TabList({ className = '', children, ...rest }: TabListProps) {
  return (
    <div
      role="tablist"
      className={[
        // 디자인 시스템 스펙:
        // 탭 컨테이너: --bg-surface, padding 3px,
        // border-radius: --radius-md, border: 1px solid --border-subtle
        'flex items-center gap-[2px]',
        'bg-[var(--bg-surface)]',
        'border border-[var(--border-subtle)]',
        'rounded-[var(--radius-md)]',
        'p-[3px]',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}

function TabTrigger({ value, className = '', children, ...rest }: TabTriggerProps) {
  const { active, setActive, variant } = useTabContext()
  const isActive = active === value

  return (
    <button
      role="tab"
      aria-selected={isActive}
      // aria-controls: 이 탭이 제어하는 패널 id를 가리켜요 (접근성)
      aria-controls={`tab-panel-${value}`}
      onClick={() => setActive(value)}
      className={[
        'flex-1 text-[13px] font-medium',
        'px-[var(--sp-3)] py-[6px]',
        'rounded-[calc(var(--radius-md)-3px)]',  // 컨테이너보다 살짝 작은 반경
        'transition-all duration-[var(--duration-fast,120ms)]',
        'whitespace-nowrap cursor-pointer',
        'outline-none',
        isActive
          ? [
              'bg-[var(--bg-overlay)]',
              // variant에 따라 활성 탭 텍스트 색이 달라져요
              variant === 'artist'
                ? 'text-[var(--theme,var(--brand))]'
                : 'text-[var(--text-primary)]',
            ].join(' ')
          : [
              // 비활성 탭
              'text-[var(--text-muted)]',
              'hover:text-[var(--text-secondary)]',
            ].join(' '),
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}

function TabContent({ value, className = '', children, ...rest }: TabContentProps) {
  const { active } = useTabContext()
  const isActive = active === value

  // 비활성 탭 패널은 DOM에서 숨겨요
  // display:none 대신 hidden 클래스를 써서 Tailwind와 일관성을 유지해요
  // hidden이어도 DOM에는 남아 있어서 초기 렌더링 비용은 한 번만 발생해요
  if (!isActive) return null

  return (
    <div
      role="tabpanel"
      id={`tab-panel-${value}`}
      className={className}
      {...rest}
    >
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────

export const Tabs = Object.assign(
  function Tabs({
    defaultValue,
    variant = 'default',
    className = '',
    children,
    ...rest
  }: TabsProps) {
    // 활성 탭 상태를 여기서 관리하고 Context로 내려줘요
    const [active, setActive] = useState(defaultValue)

    return (
      <TabContext.Provider value={{ active, setActive, variant }}>
        <div className={className} {...rest}>
          {children}
        </div>
      </TabContext.Provider>
    )
  },
  {
    List: TabList,
    Trigger: TabTrigger,
    Content: TabContent,
  }
)