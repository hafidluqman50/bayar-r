import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ConnectWallet } from "@coinbase/onchainkit/wallet"
import {
  Transaction,
  TransactionButton,
  TransactionToast,
} from "@coinbase/onchainkit/transaction"
import { useAccount, usePublicClient } from "wagmi"
import { baseSepolia } from "wagmi/chains"
import Skeleton from "../components/Skeleton"
import StatusModal from "../components/StatusModal"
import { usePaylink } from "../hooks/usePaylink"
import { formatIdrx } from "../utils/format"
import { MOCK_IDRX_ADDRESS, PAYLINK_ADDRESS } from "../config/contracts"
import { mockIdrxAbi } from "../contracts/mockIdrxAbi"
import { paylinkAbi } from "../contracts/paylinkAbi"

function getExpiryMeta(expiryAt: number) {
  const remainingMs = expiryAt - Date.now()
  const remainingDays = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)))
  return {
    remainingDays,
    isExpired: remainingMs <= 0,
  }
}

function parseNumericId(id?: string) {
  if (!id) return null
  if (!/^\d+$/.test(id)) return null
  return BigInt(id)
}

function PayPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const [errorModal, setErrorModal] = useState({
    open: false,
    message: "",
  })

  const paylinkQuery = usePaylink(id)
  const paylinkData = paylinkQuery.data
  const numericId = parseNumericId(id)

  const calls = useMemo(() => {
    return async () => {
      if (!PAYLINK_ADDRESS || !MOCK_IDRX_ADDRESS) {
        throw new Error("Contracts not configured.")
      }
      if (!publicClient) {
        throw new Error("RPC client unavailable.")
      }
      if (!address) {
        throw new Error("Connect wallet to continue.")
      }
      if (!numericId || !paylinkData) {
        throw new Error("Invalid paylink.")
      }
      if (paylinkData.paid) {
        throw new Error("Paylink already paid.")
      }
      if (address.toLowerCase() === paylinkData.creator.toLowerCase()) {
        throw new Error("Creator cannot pay their own link.")
      }
      if (paylinkData.expiryAt < Date.now()) {
        throw new Error("Paylink expired.")
      }

      const amountWei = BigInt(paylinkData.amount) * 10n ** 18n

      const [balance, allowance] = await Promise.all([
        publicClient.readContract({
          address: MOCK_IDRX_ADDRESS,
          abi: mockIdrxAbi,
          functionName: "balanceOf",
          args: [address],
        }),
        publicClient.readContract({
          address: MOCK_IDRX_ADDRESS,
          abi: mockIdrxAbi,
          functionName: "allowance",
          args: [address, PAYLINK_ADDRESS],
        }),
      ])

      if (balance < amountWei) {
        throw new Error("Insufficient IDRX balance.")
      }

      await publicClient.simulateContract({
        address: MOCK_IDRX_ADDRESS,
        abi: mockIdrxAbi,
        functionName: "approve",
        args: [PAYLINK_ADDRESS, amountWei],
        account: address,
      })

      if (allowance >= amountWei) {
        await publicClient.simulateContract({
          address: PAYLINK_ADDRESS,
          abi: paylinkAbi,
          functionName: "pay",
          args: [numericId],
          account: address,
        })
      }

      return [
        {
          address: MOCK_IDRX_ADDRESS,
          abi: mockIdrxAbi,
          functionName: "approve",
          args: [PAYLINK_ADDRESS, amountWei],
        },
        {
          address: PAYLINK_ADDRESS,
          abi: paylinkAbi,
          functionName: "pay",
          args: [numericId],
        },
      ]
    }
  }, [address, numericId, paylinkData, publicClient])

  if (paylinkQuery.isLoading) {
    return (
      <section className="w-full max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
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
          <p className="text-slate-500">Ask the seller for a new link.</p>
        </div>
      </section>
    )
  }

  const expiryMeta = getExpiryMeta(paylinkData.expiryAt)
  const isExpired = expiryMeta.isExpired
  const isPaid = paylinkData.paid
  const isCreator = address && address.toLowerCase() === paylinkData.creator.toLowerCase()

  return (
    <section className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white/90 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Pay with IDRX</h1>
        <p className="text-slate-500">Pay this request on Base Sepolia.</p>
      </div>
      <div className="mt-6 space-y-4">
        <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">
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
              Expiry
            </span>
            <p className="text-lg font-semibold text-slate-900">
              {expiryMeta.isExpired
                ? "Expired"
                : `${expiryMeta.remainingDays} days left`}
            </p>
          </div>
        </div>
        {isCreator ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Use a buyer wallet to pay this link.
          </div>
        ) : null}
        {isPaid ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            This paylink is already paid.
          </div>
        ) : null}
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
          <ConnectWallet className="w-full" />
        </div>
        <Transaction
          calls={calls}
          chainId={baseSepolia.id}
          onSuccess={response => {
            const receipt = response.transactionReceipts.at(-1)
            if (!receipt) return
            const txHash = receipt.transactionHash
            navigate(`/receipt/${id}?tx=${txHash}`)
          }}
          onError={error => {
            const message = error?.message ?? "Payment failed."
            setErrorModal({
              open: true,
              message,
            })
          }}
        >
          <TransactionButton
            render={({ context, onSubmit, isDisabled, status }) => {
              const label = isExpired
                ? "Paylink expired"
                : isPaid
                  ? "Already paid"
                  : isCreator
                    ? "Creator wallet"
                    : context.receipt
                      ? "View receipt"
                      : status === "pending"
                        ? "Processing..."
                        : status === "error"
                          ? "Try again"
                          : "Pay Now"
              return (
                <button
                  className={`w-full rounded-xl px-4 py-3 text-base font-semibold text-white ${
                    isDisabled || isExpired || isPaid || isCreator
                      ? "bg-slate-300"
                      : "bg-slate-900"
                  }`}
                  type="button"
                  onClick={() => {
                    if (context.receipt) {
                      navigate(`/receipt/${id}`)
                      return
                    }
                    onSubmit()
                  }}
                  disabled={isDisabled || isExpired || isPaid || isCreator}
                >
                  {label}
                </button>
              )
            }}
          />
          <TransactionToast position="bottom-center" />
        </Transaction>
        <p className="text-sm text-slate-500">
          Confirm the payment in your wallet to complete the transfer.
        </p>
      </div>
      <StatusModal
        open={errorModal.open}
        title="Payment failed"
        description={errorModal.message}
        tone="error"
        onClose={() => setErrorModal({ open: false, message: "" })}
      />
    </section>
  )
}

export default PayPage
