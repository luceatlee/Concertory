'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ─────────────────────────────────────────────
// 네비게이션 링크 정의
// ─────────────────────────────────────────────

const NAV_LINKS = [
  { href: '/schedule', label: '일정' },
  { href: '/venue', label: '공연장' },
]

const BOTTOM_NAV = [
  { href: '/', label: '홈', icon: '🏠' },
  { href: '/schedule', label: '일정', icon: '📅' },
  { href: '/venue', label: '공연장', icon: '🏟️' },
  { href: '/my', label: 'MY', icon: '👤' },
]

// ─────────────────────────────────────────────
// Header
//
// 'use client'가 필요한 이유:
//   usePathname()으로 현재 경로를 읽어서
//   활성 링크 스타일을 적용해요
//   서버에서는 현재 경로를 알 수 없어요
// ─────────────────────────────────────────────

export default function Header() {
  const pathname = usePathname()

  return (
    <>
      {/* ── 상단 헤더 ── */}
      <header className="
        sticky top-0 z-40
        bg-[var(--bg-elevated)]
        border-b border-[var(--border-subtle)]
        backdrop-blur-md
      ">
        {/*
          sticky + backdrop-blur-md:
          스크롤해도 헤더가 상단에 고정되고,
          뒤 콘텐츠가 비쳐 보이는 반투명 효과로
          공연장 느낌을 살려요
        */}
        <div className="
          max-w-[1280px] mx-auto
          px-[var(--sp-6)] h-[56px]
          flex items-center gap-[var(--sp-8)]
        ">

          {/* 로고 */}
          <Link
            href="/"
            className="
              mr-auto
              font-[family-name:var(--font-display)]
              text-[22px] tracking-[3px]
              text-white no-underline
              transition-opacity duration-[var(--duration-fast)]
              hover:opacity-80
            "
          >
            {/*
              워드마크: CONC✦ERTORY
              ✦ 기호에 브랜드 컬러 + 글로우를 적용해서
              조명 빔 느낌을 표현해요
            */}
            CONC
            <span
              className="text-[var(--brand)]"
              style={{
                textShadow: '0 0 12px var(--brand-glow)',
              }}
            >
              ✦
            </span>
            ERTORY
          </Link>

          {/* 데스크톱 네비게이션 — 모바일에서 숨김 */}
          <nav className="hidden md:flex items-center gap-[var(--sp-6)]">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'relative',
                    'text-[11px] font-medium tracking-[1.5px] uppercase',
                    'no-underline',
                    'transition-colors duration-[var(--duration-fast)]',
                    // 활성/비활성 텍스트 색
                    isActive
                      ? 'text-white'
                      : 'text-white/50 hover:text-white/80',
                  ].join(' ')}
                >
                  {label}
                  {/*
                    활성 링크 언더라인:
                    after 수도 클래스 대신 별도 span으로 만들어요
                    Tailwind에서 after: 로 transition을 주는 게
                    번거롭기 때문이에요
                  */}
                  {isActive && (
                    <span
                      className="
                        absolute -bottom-[19px] left-0 right-0
                        h-[2px] rounded-full
                        bg-[var(--brand)]
                      "
                      style={{ boxShadow: '0 0 8px var(--brand-glow)' }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* 로그인 버튼 */}
          <Link
            href="/login"
            className="
              text-[11px] font-medium tracking-[0.5px]
              px-[14px] py-[6px]
              rounded-[var(--radius-full)]
              bg-[var(--brand)] text-white
              no-underline
              transition-all duration-[var(--duration-fast)]
              hover:shadow-[0_0_16px_var(--brand-glow)]
            "
          >
            로그인
          </Link>

        </div>
      </header>

      {/* ── 모바일 하단 탭바 — 데스크톱에서 숨김 ── */}
      <nav
        className="
          md:hidden
          fixed bottom-0 left-0 right-0 z-40
          h-[56px]
          bg-[var(--bg-elevated)]/95
          backdrop-blur-md
          border-t border-[var(--border-subtle)]
          flex
        "
      >
        {BOTTOM_NAV.map(({ href, label, icon }) => {
          const isActive = href === '/'
            ? pathname === '/'
            : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex-1 flex flex-col items-center justify-center gap-[3px]',
                'no-underline',
                'text-[9px] font-medium tracking-[0.5px] uppercase',
                'transition-colors duration-[var(--duration-fast)]',
                isActive
                  ? 'text-[var(--brand)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
              ].join(' ')}
            >
              <span
                className="text-[20px] leading-none"
                style={isActive
                  // 활성 아이콘에 글로우 효과 — 응원봉 불빛 표현
                  ? { filter: 'drop-shadow(0 0 6px var(--brand-glow))' }
                  : undefined
                }
              >
                {icon}
              </span>
              {label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}