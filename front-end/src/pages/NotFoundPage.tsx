import { Link } from "react-router-dom"

function NotFoundPage() {
  return (
    <section className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white/90 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-slate-500">We could not find that page.</p>
      </div>
      <div className="mt-6">
        <Link
          className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          to="/"
        >
          Back to home
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage
