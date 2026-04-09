'use client'

import { useState } from 'react'

// ─────────────────────────────────────────────
// 타입 정의
//
// DB 스키마 comment_reactions.reaction_type enum과 동일하게 맞춰요
// DB 값이 바뀌면 여기도 같이 바꿔야 해요
// ─────────────────────────────────────────────

export type ReactionType = '공감' | '좋아요' | '사랑해요'

interface Reaction {
  type: ReactionType
  emoji: string
  // 현재 반응 수 — 서버에서 받아온 초기값
  count: number
}

interface EmojiReactionProps {
  // 댓글(한 줄 후기) ID — 서버 액션 호출 시 필요해요
  commentId: string
  // 서버에서 받아온 반응 데이터
  reactions: Reaction[]
  // 현재 로그인한 사용자가 이미 선택한 반응 타입
  // null이면 아직 반응 안 한 상태
  myReaction?: ReactionType | null
  // 로그인하지 않은 상태에서 반응 시도 시 호출돼요
  // 로그인 유도 모달 등을 띄울 때 사용해요
  onLoginRequired?: () => void
  // 실제 반응 등록/취소 서버 액션
  // 부모(서버 컴포넌트 or page)에서 주입해서 컴포넌트를 서버 로직과 분리해요
  onReact?: (commentId: string, type: ReactionType) => Promise<void>
}

// ─────────────────────────────────────────────
// 반응 타입별 이모지 매핑
// ─────────────────────────────────────────────

const REACTION_EMOJI: Record<ReactionType, string> = {
  '공감': '🫂',
  '좋아요': '💙',
  '사랑해요': '💗',
}

// ─────────────────────────────────────────────
// 컴포넌트
//
// 'use client'가 필요한 이유:
//   - 클릭 시 낙관적 업데이트(optimistic update)로 카운트를 즉시 반영해요
//   - 서버 응답을 기다리지 않고 UI를 먼저 바꿔서 반응이 빠르게 느껴져요
//   - 실패하면 원래 값으로 되돌려요
//
// 낙관적 업데이트란?
//   서버에 요청을 보내는 동시에 UI를 먼저 바꿔요
//   카운트가 즉시 +1 되는 것처럼 보이고,
//   실패하면 다시 원래대로 돌아와요
//   소셜 앱의 좋아요 버튼이 대부분 이 방식이에요
// ─────────────────────────────────────────────

export function EmojiReaction({
  commentId,
  reactions,
  myReaction = null,
  onLoginRequired,
  onReact,
}: EmojiReactionProps) {
  // 낙관적 업데이트를 위한 로컬 상태
  // 서버 응답 전에 UI를 먼저 반영하고, 실패 시 롤백해요
  const [localReactions, setLocalReactions] = useState(reactions)
  const [localMyReaction, setLocalMyReaction] = useState(myReaction)
  const [isLoading, setIsLoading] = useState(false)

  async function handleReact(type: ReactionType) {
    // 로그인 안 된 상태면 로그인 유도
    if (!onReact) {
      onLoginRequired?.()
      return
    }

    // 이미 처리 중이면 중복 클릭 방지
    if (isLoading) return

    // 낙관적 업데이트: 서버 요청 전에 UI 먼저 반영
    const prevReactions = localReactions
    const prevMyReaction = localMyReaction

    const isCanceling = localMyReaction === type  // 같은 타입 클릭 = 취소

    setLocalMyReaction(isCanceling ? null : type)
    setLocalReactions(prev =>
      prev.map(r => {
        if (r.type === type) {
          // 클릭한 반응: 취소면 -1, 새로 선택이면 +1
          return { ...r, count: r.count + (isCanceling ? -1 : 1) }
        }
        if (r.type === localMyReaction && !isCanceling) {
          // 이전에 선택했던 반응: 다른 걸 선택하면 -1
          return { ...r, count: r.count - 1 }
        }
        return r
      })
    )

    // 서버 액션 호출
    setIsLoading(true)
    try {
      await onReact(commentId, type)
    } catch {
      // 실패 시 원래 상태로 롤백
      setLocalReactions(prevReactions)
      setLocalMyReaction(prevMyReaction)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-[var(--sp-2)]">
      {localReactions.map(({ type, count }) => {
        const isSelected = localMyReaction === type

        return (
          <button
            key={type}
            onClick={() => handleReact(type)}
            disabled={isLoading}
            aria-label={`${type} 반응 ${count}개`}
            aria-pressed={isSelected}
            className={[
              'inline-flex items-center gap-[5px]',
              'text-[12px] font-medium',
              'px-[10px] py-[5px]',
              'rounded-[var(--radius-full)]',
              'border',
              'transition-all duration-[var(--duration-fast,120ms)]',
              'cursor-pointer select-none',
              // 선택된 반응은 브랜드 컬러로 강조해요
              isSelected
                ? [
                    'bg-[var(--brand-dim)]',
                    'border-[color:var(--brand)]/40',
                    'text-[var(--brand)]',
                    // 선택 시 살짝 커지는 피드백
                    'scale-105',
                  ].join(' ')
                : [
                    'bg-transparent',
                    'border-[var(--border-default)]',
                    'text-[var(--text-muted)]',
                    'hover:border-[var(--border-strong)]',
                    'hover:text-[var(--text-secondary)]',
                  ].join(' '),
              isLoading ? 'opacity-60' : '',
            ].join(' ')}
          >
            <span>{REACTION_EMOJI[type]}</span>
            {/* count가 0이면 숫자를 숨겨서 깔끔하게 보여요 */}
            {count > 0 && (
              <span className="tabular-nums">{count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}