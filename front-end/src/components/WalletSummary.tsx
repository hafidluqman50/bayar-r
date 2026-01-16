import { useMemo, useState } from "react"
import { useAccount, useBalance, useReadContract } from "wagmi"
import { formatUnits } from "viem"
import { MOCK_IDRX_ADDRESS } from "../config/contracts"
import { mockIdrxAbi } from "../contracts/mockIdrxAbi"

function formatAmount(value?: bigint | null, decimals = 18) {
  if (value === undefined || value === null) return "-"
  const formatted = formatUnits(value, decimals)
  const [whole, fraction] = formatted.split(".")
  if (!fraction) return whole
  return `${whole}.${fraction.slice(0, 4)}`
}

function WalletSummary() {
  const { address } = useAccount()
  const [copied, setCopied] = useState(false)

  const ethBalance = useBalance({ address })
  const idrxBalance = useReadContract({
    address: MOCK_IDRX_ADDRESS,
    abi: mockIdrxAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && MOCK_IDRX_ADDRESS),
      refetchInterval: 10000,
    },
  })

  const idrxAmount = useMemo(() => {
    if (typeof idrxBalance.data !== "bigint") return null
    return idrxBalance.data
  }, [idrxBalance.data])

  const handleCopy = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        Wallet overview
      </div>
      <div className="mt-2 space-y-2 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <span>Network</span>
          <span className="font-semibold">Base Sepolia</span>
        </div>
        <div className="flex items-center justify-between">
          <span>ETH</span>
          <span className="font-semibold">
            {ethBalance.isLoading ? "..." : ethBalance.data?.formatted ?? "-"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>IDRX</span>
          <span className="font-semibold">
            {idrxBalance.isLoading ? "..." : formatAmount(idrxAmount)}
          </span>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
          onClick={handleCopy}
        >
          {copied ? "Copied" : "Copy address"}
        </button>
        {address ? (
          <a
            className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-center text-xs font-semibold text-white"
            href={`https://sepolia.basescan.org/address/${address}`}
            target="_blank"
            rel="noreferrer"
          >
            View BaseScan
          </a>
        ) : null}
      </div>
    </div>
  )
}

export default WalletSummary
