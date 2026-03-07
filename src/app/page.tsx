import Feed from '@/components/Feed'

export default function Home() {
  return (
    <div className="space-y-8 pb-12">
      <header className="py-6 border-b border-stone-200/60">
        <h1 className="text-3xl font-sans font-semibold text-stone-800 tracking-tight">Our Memories</h1>
        <p className="text-stone-500 mt-2 font-sans text-sm">Share and look back at our favorite moments.</p>
      </header>

      {/* We use React Suspense natively supported in App Router by making Feed async */}
      <Feed />
    </div>
  )
}
