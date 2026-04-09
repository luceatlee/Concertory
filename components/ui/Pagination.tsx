'use client'

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

interface PaginationProps {
  // 전체 페이지 수
  totalPages: number
  // 현재 페이지 (1-based)
  currentPage: number
  // 페이지 변경 시 호출 — 부모가 실제 데이터 fetch를 담당해요
  onPageChange: (page: number) => void
  // 더보기 모드(모바일)에서 "마지막 페이지인지" 여부
  // 더보기는 페이지 개념 대신 "불러올 게 더 있는가"로 판단해요
  hasMore?: boolean
  // 더보기 버튼 클릭 시 호출
  onLoadMore?: () => void
  // 더보기 로딩 중 여부
  isLoadingMore?: boolean
}

// ─────────────────────────────────────────────
// 헬퍼: 페이지 번호 배열 계산
//
// 전체 페이지가 많을 때 모두 보여주면 UI가 지저분해져요
// 현재 페이지 주변 번호 + 첫/마지막 페이지 + 생략(...) 패턴을 써요
// 예: 1 ... 4 5 6 ... 10
// ─────────────────────────────────────────────

function getPageNumbers(current: number, total: number): (number | '...')[] {
  // 페이지가 7개 이하면 전부 보여줘요
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = [1]

  // 현재 페이지가 앞쪽에 가까우면
  if (current <= 4) {
    pages.push(2, 3, 4, 5, '...', total)
  }
  // 현재 페이지가 뒤쪽에 가까우면
  else if (current >= total - 3) {
    pages.push('...', total - 4, total - 3, total - 2, total - 1, total)
  }
  // 중간에 있으면
  else {
    pages.push('...', current - 1, current, current + 1, '...', total)
  }

  return pages
}

// ─────────────────────────────────────────────
// 공통 버튼 스타일
// ─────────────────────────────────────────────

const basePageBtn = [
  'inline-flex items-center justify-center',
  'w-8 h-8 text-[13px] font-medium',
  'rounded-[var(--radius-sm)]',
  'border',
  'transition-all duration-[var(--duration-fast,120ms)]',
  'cursor-pointer select-none',
].join(' ')

// ─────────────────────────────────────────────
// 컴포넌트
//
// 'use client'가 필요한 이유:
//   onClick 이벤트 핸들러가 있어서 브라우저에서 실행돼야 해요
//
// 모바일/데스크톱 분기 방식:
//   Tailwind의 반응형 접두사(md:)로 CSS에서 처리해요
//   JS로 화면 너비를 감지하지 않아요 — 서버 사이드 렌더링과 충돌 없이
//   깜빡임(flash) 없이 전환돼요
// ─────────────────────────────────────────────

export function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
}: PaginationProps) {
  // 페이지가 1개 이하면 페이지네이션 불필요
  if (totalPages <= 1 && !hasMore) return null

  const pageNumbers = getPageNumbers(currentPage, totalPages)

  return (
    <>
      {/* ── 모바일: 더보기 버튼 (md 이상에서 숨김) ── */}
      {hasMore && (
        <div className="flex justify-center md:hidden">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className={[
              'text-[13px] font-medium',
              'px-[var(--sp-6)] py-[var(--sp-3)]',
              'rounded-[var(--radius-sm)]',
              'border border-[var(--border-default)]',
              'text-[var(--text-secondary)]',
              'hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]',
              'transition-all duration-[var(--duration-fast,120ms)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            ].join(' ')}
          >
            {isLoadingMore ? (
              // 로딩 중 스피너
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                불러오는 중
              </span>
            ) : (
              '더보기'
            )}
          </button>
        </div>
      )}

      {/* ── 데스크톱: 페이지 번호 (md 미만에서 숨김) ── */}
      <nav
        aria-label="페이지 탐색"
        className="hidden md:flex items-center justify-center gap-[var(--sp-1)]"
      >
        {/* 이전 페이지 버튼 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="이전 페이지"
          className={[
            basePageBtn,
            currentPage === 1
              ? 'border-[var(--border-subtle)] text-[var(--text-muted)] opacity-40 cursor-not-allowed'
              : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]',
          ].join(' ')}
        >
          ‹
        </button>

        {/* 페이지 번호 목록 */}
        {pageNumbers.map((page, idx) =>
          page === '...' ? (
            // 생략 표시 — 클릭 불가
            <span
              key={`ellipsis-${idx}`}
              className="w-8 h-8 inline-flex items-center justify-center text-[var(--text-muted)] text-[13px]"
            >
              ···
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-label={`${page}페이지`}
              aria-current={currentPage === page ? 'page' : undefined}
              className={[
                basePageBtn,
                currentPage === page
                  ? [
                      // 활성 페이지: 브랜드 컬러 + 글로우
                      'bg-[var(--brand)] text-white',
                      'border-[var(--brand)]',
                      'shadow-[0_0_10px_var(--brand-glow)]',
                    ].join(' ')
                  : [
                      'bg-transparent text-[var(--text-secondary)]',
                      'border-[var(--border-default)]',
                      'hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]',
                    ].join(' '),
              ].join(' ')}
            >
              {page}
            </button>
          )
        )}

        {/* 다음 페이지 버튼 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="다음 페이지"
          className={[
            basePageBtn,
            currentPage === totalPages
              ? 'border-[var(--border-subtle)] text-[var(--text-muted)] opacity-40 cursor-not-allowed'
              : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]',
          ].join(' ')}
        >
          ›
        </button>
      </nav>
    </>
  )
}