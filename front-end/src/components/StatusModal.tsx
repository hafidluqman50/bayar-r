type StatusModalProps = {
  open: boolean
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  onClose: () => void
  tone?: "success" | "error" | "info"
}

function StatusModal({
  open,
  title,
  description,
  actionLabel,
  onAction,
  onClose,
  tone = "info",
}: StatusModalProps) {
  if (!open) return null

  const toneStyles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-rose-200 bg-rose-50 text-rose-900",
    info: "border-slate-200 bg-slate-50 text-slate-900",
  }[tone]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-[1px] px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
        <div className={`rounded-xl border px-3 py-2 text-xs font-semibold ${toneStyles}`}>
          {tone.toUpperCase()}
        </div>
        <div className="mt-4 space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          {description ? (
            <p className="text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {actionLabel ? (
            <button
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              type="button"
              onClick={onAction}
            >
              {actionLabel}
            </button>
          ) : null}
          <button
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default StatusModal
