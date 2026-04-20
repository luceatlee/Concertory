'use client'

import { useState } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────

// getSongComments는 select('*')라서 join 데이터가 없어요
// members, users는 향후 select 쿼리 확장 시 추가 예정
interface Comment {
  id: string
  content: string
  created_at: string | null
  member_id: string | null
  user_id: string | null
  setlist_item_id: string | null
}

interface SongReviewSectionProps {
  comments: Comment[]
  setlistItemId: string
  slug: string
  cid: string
}

// ─────────────────────────────────────────────
// SongReviewSection
//
// 'use client'가 필요한 이유:
//   - 멤버 필터 선택 상태 관리 (useState)
//   - 후기 작성폼 인터랙션
//   - 로그인 상태에 따른 폼/프롬프트 분기
//     (현재는 항상 로그인 프롬프트로 처리하고
//     로그인 기능 구현 시 Supabase Auth와 연동)
// ─────────────────────────────────────────────

const REACTIONS = [
  { type: '공감' as const, emoji: '💗', label: '공감해요' },
  { type: '좋아요' as const, emoji: '❤️', label: '좋아요' },
  { type: '사랑해요' as const, emoji: '🥹', label: '사랑해요' },
]

export function SongReviewSection({
  comments,
  setlistItemId,
  slug,
  cid,
}: SongReviewSectionProps) {
  // 멤버 필터 선택 상태
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  // 멤버 목록 및 필터:
  // getSongComments가 select('*')라 member join이 없어요
  // 향후 쿼리에 members join 추가 시 아래 로직 활성화 예정
  const members: string[] = []
  const filteredComments = comments

  return (
    <div>
      {/* 멤버 필터 칩 */}
      {members.length > 0 && (
        <div className="flex flex-wrap items-center gap-[var(--sp-2)] mb-[var(--sp-4)]">
          <span className="text-[10px] text-[var(--text-muted)]">멤버 필터</span>
          <button
            onClick={() => setSelectedMember(null)}
            className={[
              'text-[10px] px-[var(--sp-2)] py-[3px]',
              'rounded-[var(--radius-full)]',
              'border transition-all duration-[var(--duration-fast)]',
              'cursor-pointer',
              selectedMember === null
                ? 'bg-[var(--theme,var(--brand))] text-white border-[color:var(--theme,var(--brand))]'
                : 'bg-transparent text-[var(--text-muted)] border-[var(--border-default)] hover:border-[var(--border-strong)]',
            ].join(' ')}
          >
            전체
          </button>
          {members.map((member) => (
            <button
              key={member}
              onClick={() => setSelectedMember(member)}
              className={[
                'text-[10px] px-[var(--sp-2)] py-[3px]',
                'rounded-[var(--radius-full)]',
                'border transition-all duration-[var(--duration-fast)]',
                'cursor-pointer',
                selectedMember === member
                  ? 'bg-[var(--theme,var(--brand))] text-white border-[color:var(--theme,var(--brand))]'
                  : 'bg-transparent text-[var(--text-muted)] border-[var(--border-default)] hover:border-[var(--border-strong)]',
              ].join(' ')}
            >
              {member}
            </button>
          ))}
        </div>
      )}

      {/* 후기 목록 */}
      {filteredComments.length === 0 ? (
        <EmptyState
          icon="💬"
          title="아직 후기가 없어요"
          description="이 곡의 첫 번째 후기를 남겨보세요"
        />
      ) : (
        <div className="divide-y divide-[var(--border-subtle)]/50">
          {filteredComments.map((comment) => (
            <div key={comment.id} className="py-[var(--sp-3)]">
              {/* 후기 헤더 */}
              <div className="flex items-center gap-[var(--sp-2)] mb-[var(--sp-2)]">
                {/* 아바타 플레이스홀더 */}
                {/* getSongComments에 users join 추가 후 실제 아바타로 교체 예정 */}
                <div className="
                  w-6 h-6 rounded-full flex-shrink-0
                  bg-[var(--bg-overlay)]
                  border border-[var(--border-subtle)]
                " />
                {/* 닉네임: user_id만 있어서 현재는 익명으로 표시 */}
                {/* getSongComments에 users join 추가 후 실제 닉네임으로 교체 예정 */}
                <span className="text-[11px] font-medium text-[var(--text-primary)]">
                  익명
                </span>
                {/* 날짜 */}
                <span className="text-[10px] text-[var(--text-muted)] ml-auto">
                  {comment.created_at
                    ? new Date(comment.created_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
                    : ''}
                </span>
              </div>

              {/* 후기 본문 */}
              <p className="text-[13px] text-[var(--text-primary)] leading-relaxed mb-[var(--sp-2)]">
                {comment.content}
              </p>

              {/* 이모지 반응 — 현재는 정적 표시, EmojiReaction 컴포넌트 연동은 추후 */}
              <div className="flex gap-[var(--sp-2)]">
                {REACTIONS.map(({ emoji, label }) => (
                  <button
                    key={label}
                    className="
                      inline-flex items-center gap-[4px]
                      text-[11px]
                      px-[var(--sp-2)] py-[4px]
                      rounded-[var(--radius-full)]
                      border border-[var(--border-default)]
                      text-[var(--text-muted)]
                      bg-transparent
                      hover:border-[var(--border-strong)]
                      transition-all duration-[var(--duration-fast)]
                      cursor-pointer
                    "
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 후기 작성 영역 */}
      <div className="mt-[var(--sp-6)]">
        <p className="
          font-[family-name:var(--font-serif)] italic
          text-[11px] tracking-[3px] uppercase
          text-[var(--text-muted)]
          mb-[var(--sp-3)]
        ">
          Leave a Review
        </p>

        {/*
          현재는 항상 로그인 프롬프트를 보여줘요
          Supabase Auth 연동 후 로그인 상태에 따라 분기 예정
        */}
        <div className="
          bg-[var(--bg-surface)]
          border border-dashed border-[var(--border-default)]
          rounded-[var(--radius-md)]
          px-[var(--sp-6)] py-[var(--sp-6)]
          text-center
        ">
          <p className="text-[13px] text-[var(--text-muted)]">
            <span className="text-[var(--theme,var(--brand))] font-medium">로그인</span>하고 이 곡의 후기를 남겨보세요 ✍️
          </p>
          <Button variant="artist" size="sm" className="mt-[var(--sp-3)]">
            소셜 로그인
          </Button>
        </div>
      </div>
    </div>
  )
}