import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  eyebrow: string
  title: string
  description: string
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
        {eyebrow}
      </p>
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
          {description}
        </p>
      </div>
    </div>
  )
}
