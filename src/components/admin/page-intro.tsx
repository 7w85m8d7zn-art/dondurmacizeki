interface PageIntroProps {
  eyebrow: string
  title: string
  description: string
}

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
        {eyebrow}
      </p>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-stone-500 sm:text-base">
          {description}
        </p>
      </div>
    </div>
  )
}
