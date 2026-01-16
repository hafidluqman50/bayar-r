import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAccount } from "wagmi"
import { PAYLINK_ADDRESS } from "../config/contracts"
import { useCreatePaylink } from "../hooks/usePaylink"
import StatusModal from "../components/StatusModal"
import { formatIdrx, parseAmountInput } from "../utils/format"

function CreateLinkPage() {
  const navigate = useNavigate()
  const { isConnected } = useAccount()
  const [amount, setAmount] = useState(25000)
  const [amountInput, setAmountInput] = useState(formatIdrx(25000))
  const [note, setNote] = useState("")
  const [expiry, setExpiry] = useState(7)
  const [modal, setModal] = useState({
    open: false,
    title: "",
    description: "",
    tone: "info" as "info" | "success" | "error",
    actionLabel: "",
    actionRoute: "",
  })

  const createPaylink = useCreatePaylink()
  const needsWallet = Boolean(PAYLINK_ADDRESS)
  const isDisabled =
    createPaylink.isPending || (needsWallet && !isConnected) || amount <= 0

  const closeModal = () =>
    setModal(prev => ({ ...prev, open: false, actionRoute: "" }))

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseAmountInput(event.target.value)
    setAmount(parsed.amount)
    setAmountInput(parsed.formatted)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isDisabled) return

    createPaylink.mutate(
      { amount, note, expiryDays: expiry },
      {
        onSuccess: paylink => {
          setModal({
            open: true,
            title: "Paylink created",
            description: "Ready to share with your buyer.",
            tone: "success",
            actionLabel: "Go to share",
            actionRoute: `/share/${paylink.id}`,
          })
        },
        onError: error => {
          const message =
            error instanceof Error
              ? error.message.split("\n")[0]
              : "Something went wrong."
          setModal({
            open: true,
            title: "Create failed",
            description: message,
            tone: "error",
            actionLabel: "Try again",
            actionRoute: "",
          })
        },
      },
    )
  }

  return (
    <section className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white/90 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Create Paylink
        </h1>
        <p className="text-slate-500">
          Generate a one-time IDRX payment link in seconds.
        </p>
      </div>
      {needsWallet && !isConnected ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Connect wallet to publish paylink onchain.
        </div>
      ) : null}
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
          Amount (IDRX)
          <input
            type="text"
            inputMode="numeric"
            placeholder="25.000"
            value={amountInput}
            onChange={handleAmountChange}
            required
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
          Note (optional)
          <input
            type="text"
            placeholder="Design deposit"
            value={note}
            onChange={event => setNote(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
          Expiry (days)
          <input
            type="number"
            min={1}
            max={30}
            value={expiry}
            onChange={event => setExpiry(Number(event.target.value))}
            required
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base"
          />
        </label>
        <button
          className={`w-full rounded-xl px-4 py-3 text-base font-semibold text-white ${
            isDisabled ? "bg-slate-300" : "bg-slate-900"
          }`}
          type="submit"
          disabled={isDisabled}
        >
          {createPaylink.isPending ? "Creating..." : "Create Link"}
        </button>
      </form>
      <StatusModal
        open={modal.open}
        title={modal.title}
        description={modal.description}
        tone={modal.tone}
        actionLabel={modal.actionLabel}
        onAction={() => {
          if (modal.actionRoute) {
            navigate(modal.actionRoute)
          }
          closeModal()
        }}
        onClose={closeModal}
      />
    </section>
  )
}

export default CreateLinkPage
