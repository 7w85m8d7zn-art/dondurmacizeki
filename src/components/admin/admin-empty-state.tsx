interface AdminEmptyStateProps {
  title: string
  description: string
}

export function AdminEmptyState({ title, description }: AdminEmptyStateProps) {
  return (
    <div className="rounded-[1.6rem] border border-dashed border-stone-300 bg-stone-50 p-6 text-center">
      <h3 className="text-lg font-semibold tracking-tight text-stone-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p>
    </div>
  )
}
