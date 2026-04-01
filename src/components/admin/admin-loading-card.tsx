export function AdminLoadingCard() {
  return (
    <div className="rounded-[1.6rem] border border-stone-200 bg-white p-5 shadow-sm">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-28 rounded-full bg-stone-200" />
        <div className="h-8 w-3/4 rounded-full bg-stone-200" />
        <div className="h-4 w-full rounded-full bg-stone-100" />
        <div className="h-4 w-5/6 rounded-full bg-stone-100" />
      </div>
    </div>
  )
}
