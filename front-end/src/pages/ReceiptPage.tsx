import { Link, useParams, useSearchParams } from "react-router-dom"
import { useState } from "react"
import Skeleton from "../components/Skeleton"
import { usePaylink } from "../hooks/usePaylink"
import { formatIdrx } from "../utils/format"

function formatDateTime(value: number) {
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function ReceiptPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [copied, setCopied] = useState(false)
  const paylinkQuery = usePaylink(id)
  const txHash = searchParams.get("tx")

  if (paylinkQuery.isLoading) {
    return (
      <section className="w-full max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-16 w-full" />
      </section>
    )
  }

  const paylinkData = paylinkQuery.data

  if (!id || !paylinkData) {
    return (
      <section className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white/90 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Receipt missing</h1>
          <p className="text-slate-500">We could not load this receipt.</p>
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

  const status = paylinkData.paid ? "success" : "pending"

  const handleCopy = async () => {
    if (!txHash) return
    try {
      await navigator.clipboard.writeText(txHash)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white/90 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Payment Receipt</h1>
        <p className="text-slate-500">Onchain confirmation.</p>
      </div>
      <div className="mt-6 space-y-4">
        <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Status
            </span>
            <p className="text-lg font-semibold text-slate-900">{status}</p>
            {paylinkData.paidAt ? (
              <p className="text-xs text-slate-500">
                Paid at {formatDateTime(paylinkData.paidAt)}
              </p>
            ) : null}
          </div>
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Amount
            </span>
            <p className="text-lg font-semibold text-slate-900">
              {formatIdrx(paylinkData.amount)} IDRX
            </p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Note
            </span>
            <p className="text-lg font-semibold text-slate-900">
              {paylinkData.note || "-"}
            </p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Paylink ID
            </span>
            <p className="text-lg font-semibold text-slate-900">{id}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Transaction
          </span>
          <p className="mt-2 break-all text-sm text-slate-600">
            {txHash || "Transaction hash available in your wallet history."}
          </p>
          {txHash ? (
            <button
              type="button"
              className="mt-3 inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
              onClick={handleCopy}
            >
              {copied ? "Copied" : "Copy tx hash"}
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            to="/"
          >
            Create new paylink
          </Link>
          <Link
            className="inline-flex rounded-xl border border-dashed border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900"
            to={`/pay/${id}`}
          >
            Back to pay page
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ReceiptPage
