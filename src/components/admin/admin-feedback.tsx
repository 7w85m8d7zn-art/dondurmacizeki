interface AdminFeedbackProps {
  message: string
  tone?: "default" | "error" | "success"
}

export function AdminFeedback({
  message,
  tone = "default",
}: AdminFeedbackProps) {
  const styles =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-stone-200 bg-white text-stone-700"

  return (
    <div className={`rounded-[1.4rem] border px-4 py-3 text-sm shadow-sm ${styles}`}>
      {message}
    </div>
  )
}
