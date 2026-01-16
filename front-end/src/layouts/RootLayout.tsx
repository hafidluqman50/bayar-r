import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import {
  ConnectWallet,
  Wallet,
  WalletAdvancedAddressDetails,
  WalletAdvancedTokenHoldings,
  WalletAdvancedTransactionActions,
  WalletAdvancedWalletActions,
  WalletDropdown,
} from "@coinbase/onchainkit/wallet"

const steps = [
  { label: "Create", path: "/" },
  { label: "Share", path: "/share" },
  { label: "Pay", path: "/pay" },
  { label: "Receipt", path: "/receipt" },
]

function RootLayout() {
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  const [shareOpen, setShareOpen] = useState(false)
  const [shareId, setShareId] = useState("")

  const currentStepIndex = steps.findIndex(step =>
    pathname === step.path || pathname.startsWith(`${step.path}/`),
  )

  return (
    <div className="min-h-screen">
      <header className="px-5 pb-3 pt-5 sm:px-[8vw]">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 px-5 py-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/bayarr-logo.png"
              alt="BayarR logo"
              className="h-12 w-12 rounded-2xl border border-slate-200 bg-white"
            />
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold tracking-tight">BayarR</span>
              <span className="text-sm text-slate-500">
                IDRX Paylink Mini-App
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <nav className="flex w-full gap-3 sm:w-auto">
              <Link
                to="/"
                className={
                  pathname === "/"
                    ? "flex-1 rounded-full bg-slate-900 px-4 py-2.5 text-center text-base font-semibold text-white sm:flex-none"
                    : "flex-1 rounded-full bg-slate-900/5 px-4 py-2.5 text-center text-base font-semibold text-slate-900 sm:flex-none"
                }
              >
                Create
              </Link>
              <button
                type="button"
                onClick={() => setShareOpen(prev => !prev)}
                className={
                  pathname.startsWith("/share")
                    ? "flex-1 rounded-full bg-slate-900 px-4 py-2.5 text-center text-base font-semibold text-white sm:flex-none"
                    : "flex-1 rounded-full bg-slate-900/5 px-4 py-2.5 text-center text-base font-semibold text-slate-900 sm:flex-none"
                }
              >
                Share
              </button>
            </nav>
            <Wallet>
              <ConnectWallet className="w-full sm:w-auto" />
              <WalletDropdown>
                <WalletAdvancedWalletActions />
                <WalletAdvancedAddressDetails />
                <WalletAdvancedTransactionActions />
                <WalletAdvancedTokenHoldings />
              </WalletDropdown>
            </Wallet>
          </div>
        </div>
        <div className="mt-4">
          <div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 sm:flex">
            {steps.map((step, index) => (
              <div key={step.path} className="flex items-center gap-2">
                <span
                  className={
                    index <= currentStepIndex
                      ? "rounded-full bg-slate-900 px-3 py-1 text-[0.65rem] text-white"
                      : "rounded-full bg-slate-200 px-3 py-1 text-[0.65rem] text-slate-500"
                  }
                >
                  {step.label}
                </span>
                {index < steps.length - 1 ? (
                  <span className="h-px w-6 bg-slate-200" />
                ) : null}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 sm:hidden">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-[0.65rem] text-white">
              {steps[Math.max(0, currentStepIndex)]?.label ?? "Create"}
            </span>
            <span className="text-[0.65rem] text-slate-400">
              Step {Math.max(0, currentStepIndex) + 1} / {steps.length}
            </span>
            <div className="flex-1">
              <div className="h-1.5 w-full rounded-full bg-slate-200">
                <div
                  className="h-1.5 rounded-full bg-slate-900"
                  style={{
                    width: `${
                      ((Math.max(0, currentStepIndex) + 1) / steps.length) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>
      {shareOpen ? (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Close share"
            className="absolute inset-0 cursor-default bg-transparent"
            onClick={() => setShareOpen(false)}
          />
          <form
            className="absolute left-1/2 top-[5.6rem] w-[min(90vw,22rem)] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.12)] sm:left-auto sm:right-[8vw] sm:top-[6.6rem] sm:translate-x-0"
            onSubmit={event => {
              event.preventDefault()
              const cleanId = shareId.replace(/[^\d]/g, "")
              if (!cleanId) return
              setShareOpen(false)
              setShareId("")
              navigate(`/share/${cleanId}`)
            }}
          >
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Paylink ID
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              placeholder="e.g. 12"
              inputMode="numeric"
              value={shareId}
              onChange={event => setShareId(event.target.value)}
            />
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
              >
                Open
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                onClick={() => setShareOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
      <main className="flex flex-1 justify-center px-5 pb-10 sm:px-[8vw]">
        <Outlet />
      </main>
      <footer className="px-5 pb-8 text-xs text-slate-500 sm:px-[8vw]">
        IDRX on Base Sepolia
      </footer>
    </div>
  )
}

export default RootLayout
