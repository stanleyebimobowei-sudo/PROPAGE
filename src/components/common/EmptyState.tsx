type EmptyStateProps = {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="font-serif text-3xl text-stone-100">{title}</p>
      <p className="mt-3 text-sm leading-7 text-stone-copy">{description}</p>
    </section>
  )
}
