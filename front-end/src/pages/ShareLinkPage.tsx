import QRCode from "qrcode"
import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import Skeleton from "../components/Skeleton"
import { usePaylink } from "../hooks/usePaylink"
import { formatIdrx } from "../utils/format"

function formatDate(value: number) {
  const date = new Date(value)
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getExpiryMeta(expiryAt: number) {
  const remainingMs = expiryAt - Date.now()
  const remainingDays = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)))
  return {
    expiryAt,
    remainingDays,
    isExpired: remainingMs <= 0,
  }
}

async function copyQrImage(dataUrl: string) {
  if (!navigator.clipboard || !window.ClipboardItem) return false
  const blob = await fetch(dataUrl).then(res => res.blob())
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
  return true
}

function ShareLinkPage() {
  const { id } = useParams()
  const [copied, setCopied] = useState(false)
  const [qrCopied, setQrCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState("")

  const paylinkQuery = usePaylink(id)
  const paylinkData = paylinkQuery.data
  
  console.log(paylinkQuery.error)

  const paylink = useMemo(() => {
    if (!id) return ""
    return `${window.location.origin}/pay/${id}`
  }, [id])

  useEffect(() => {
    if (!paylink) return
    QRCode.toDataURL(paylink, {
      width: 220,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(() => setQrDataUrl(""))
  }, [paylink])

  const handleCopy = async () => {
    if (!paylink) return
    try {
      await navigator.clipboard.writeText(paylink)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  const handleCopyQr = async () => {
    if (!qrDataUrl) return
    try {
      const ok = await copyQrImage(qrDataUrl)
      if (ok) {
        setQrCopied(true)
        window.setTimeout(() => setQrCopied(false), 1500)
      }
    } catch {
      setQrCopied(false)
    }
  }

  const waLink = useMemo(() => {
    if (!paylink) return ""
    const message = `BayarR paylink: ${paylink}`
    return `https://wa.me/?text=${encodeURIComponent(message)}`
  }, [paylink])

  if (paylinkQuery.isLoading) {
    return (
      <section className="w-full max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
      </section>
    )
  }

  if (!id || !paylinkData) {
    return (
      <section className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white/90 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Paylink not found
          </h1>
          <p className="text-slate-500">Create a paylink first.</p>
        </div>
        <div className="mt-6">
          <Link
            className="inline-flex rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
            to="/"
          >
            Back to create
          </Link>
        </div>
      </section>
    )
  }

  const expiryMeta = getExpiryMeta(paylinkData.expiryAt)

  return (
    <section className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white/90 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Share Paylink
        </h1>
        <p className="text-slate-500">Send this link or QR to the buyer.</p>
      </div>
      <div className="mt-6 space-y-4">
        <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">
          <div>
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
              Amount
            </span>
            <p className="text-lg font-semibold text-slate-900">
              {formatIdrx(paylinkData.amount)} IDRX
            </p>
          </div>
          <div>
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
              Expiry
            </span>
            <p className="text-lg font-semibold text-slate-900">
              {expiryMeta.isExpired
                ? "Expired"
                : `${expiryMeta.remainingDays} days left`}
            </p>
            <p className="text-xs text-slate-500">
              Expires on {formatDate(expiryMeta.expiryAt)}
            </p>
          </div>
          <div>
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
              Note
            </span>
            <p className="text-lg font-semibold text-slate-900">
              {paylinkData.note || "-"}
            </p>
          </div>
        </div>
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-3">
            <div className="break-all rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              {paylink}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex items-center rounded-xl bg-slate-900/5 px-4 py-2 text-sm font-semibold text-slate-900"
                type="button"
                onClick={handleCopy}
              >
                {copied ? "Copied" : "Copy Link"}
              </button>
              <a
                className="inline-flex items-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
                href={waLink}
                target="_blank"
                rel="noreferrer"
              >
                Share to WhatsApp
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-slate-50 p-4">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Paylink QR" className="h-40 w-40" />
            ) : (
              <div className="text-sm text-slate-400">QR unavailable</div>
            )}
            <button
              className="inline-flex items-center rounded-xl border border-dashed border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
              type="button"
              onClick={handleCopyQr}
              disabled={!qrDataUrl}
            >
              {qrCopied ? "QR copied" : "Copy QR"}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex rounded-xl border border-dashed border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900"
            to="/"
          >
            Create another
          </Link>
          <Link
            className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            to={`/pay/${id}`}
          >
            Preview pay page
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ShareLinkPage
