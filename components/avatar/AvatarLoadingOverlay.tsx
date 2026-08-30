'use client'

type Props = {
  label: string
  /** Remplit le parent (overlay canvas) ou une boîte autonome */
  fill?: boolean
}

export default function AvatarLoadingOverlay({ label, fill = true }: Props) {
  return (
    <div
      className={
        fill
          ? 'absolute inset-0 z-20 flex flex-col items-center justify-center gap-4'
          : 'flex flex-col items-center justify-center gap-4 w-full h-full min-h-[320px]'
      }
      style={{ background: fill ? 'var(--stage, #0f172a)' : 'var(--stage, #0f172a)' }}
    >
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#5ba4b0] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-[#5ba4b0] opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </div>
      <p className="text-sm font-medium text-slate-400 animate-pulse font-sans">{label}</p>
    </div>
  )
}
