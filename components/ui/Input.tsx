import { InputHTMLAttributes, forwardRef, ReactNode } from 'react'

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

type InputStatus = 'default' | 'error'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  status?: InputStatus
  // 인풋 왼쪽에 아이콘을 넣을 수 있어요 (예: 검색 아이콘)
  // lucide-react 아이콘 컴포넌트를 그대로 넘기면 돼요
  leftIcon?: ReactNode
  // 인풋 오른쪽에 아이콘이나 버튼을 넣을 수 있어요 (예: 비밀번호 토글)
  rightIcon?: ReactNode
  // 에러 메시지 — status="error"일 때 인풋 아래에 표시돼요
  errorMessage?: string
  // 인풋 위에 표시되는 레이블
  label?: string
}

// ─────────────────────────────────────────────
// 스타일 맵
//
// 디자인 시스템 스펙:
//   배경: --bg-surface
//   테두리: 1px solid --border-default
//   반경: --radius-sm (4px)
//   포커스: border-color → --brand, box-shadow 0 0 0 3px --brand-dim
//   에러: border-color → --error, box-shadow 0 0 0 3px --error/10
//   placeholder: color --text-muted
// ─────────────────────────────────────────────

const statusClasses: Record<InputStatus, string> = {
  default: [
    'border-[var(--border-default)]',
    // focus-within: 래퍼 div 기준으로 포커스 감지해요
    // 인풋 자체가 아닌 래퍼에 스타일을 적용하기 때문에
    // leftIcon/rightIcon이 있어도 포커스 링이 올바르게 보여요
    'focus-within:border-[var(--brand)]',
    'focus-within:shadow-[0_0_0_3px_var(--brand-dim)]',
  ].join(' '),

  error: [
    'border-[var(--error)]',
    'focus-within:border-[var(--error)]',
    'focus-within:shadow-[0_0_0_3px_color:var(--error)]/10',
  ].join(' '),
}

// ─────────────────────────────────────────────
// 컴포넌트
//
// 왜 input을 div로 감싸나요?
//   leftIcon / rightIcon을 input 안쪽에 겹쳐 놓으려면
//   position: relative인 래퍼가 필요해요
//   또한 포커스 링을 래퍼에 적용해서 아이콘까지 포함한
//   전체 영역이 하나의 인풋처럼 보이게 해요
//
// forwardRef를 쓰는 이유:
//   폼 라이브러리(react-hook-form 등)가 ref로
//   인풋 DOM에 직접 접근해요. 없으면 연동이 안 돼요
// ─────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      status = 'default',
      leftIcon,
      rightIcon,
      errorMessage,
      label,
      className = '',
      id,
      disabled,
      ...rest
    },
    ref
  ) => {
    return (
      <div className="flex flex-col gap-[var(--sp-1)]">

        {/* 레이블 */}
        {label && (
          <label
            htmlFor={id}
            className={[
              'text-[12px] font-medium tracking-wide',
              // 비활성 상태면 레이블도 함께 흐려져요
              disabled
                ? 'text-[var(--text-muted)]'
                : 'text-[var(--text-secondary)]',
            ].join(' ')}
          >
            {label}
          </label>
        )}

        {/* 인풋 래퍼 */}
        <div
          className={[
            'flex items-center',
            'bg-[var(--bg-surface)]',
            'border rounded-[var(--radius-sm)]',
            'transition-all duration-[var(--duration-fast,120ms)]',
            statusClasses[status],
            // 비활성 상태 스타일
            disabled ? 'opacity-50 cursor-not-allowed' : '',
            className,
          ].join(' ')}
        >
          {/* 왼쪽 아이콘 */}
          {leftIcon && (
            <span className="pl-[var(--sp-3)] text-[var(--text-muted)] flex-shrink-0">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            className={[
              'flex-1 bg-transparent outline-none',
              'text-[14px] text-[var(--text-primary)]',
              'placeholder:text-[var(--text-muted)]',
              'py-[9px]',
              // 아이콘 유무에 따라 패딩을 조정해요
              // 아이콘이 없으면 래퍼 테두리와 텍스트 사이 여백을 인풋이 담당해요
              leftIcon ? 'pl-[var(--sp-2)]' : 'pl-[var(--sp-3)]',
              rightIcon ? 'pr-[var(--sp-2)]' : 'pr-[var(--sp-3)]',
              // disabled일 때 커서를 바꿔요
              disabled ? 'cursor-not-allowed' : '',
            ].join(' ')}
            {...rest}
          />

          {/* 오른쪽 아이콘 */}
          {rightIcon && (
            <span className="pr-[var(--sp-3)] text-[var(--text-muted)] flex-shrink-0">
              {rightIcon}
            </span>
          )}
        </div>

        {/* 에러 메시지 */}
        {status === 'error' && errorMessage && (
          <p className="text-[12px] text-[var(--error)]">
            {errorMessage}
          </p>
        )}

      </div>
    )
  }
)

Input.displayName = 'Input'