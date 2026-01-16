import { RouterProvider } from "react-router-dom"
import { createConfig, http, WagmiProvider } from "wagmi"
import { baseSepolia } from "wagmi/chains"
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { WalletProvider } from "@coinbase/onchainkit/wallet"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { router } from "./router"

const walletConnectProjectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ??
  "e11626027da1ee5b8b3ea34496552146"

const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: "BayarR",
    }),
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true,
      metadata: {
        name: "BayarR",
        description: "IDRX Paylink Mini-App",
        url: "https://bayarr.local",
        icons: ["https://avatars.githubusercontent.com/u/1885080?s=200&v=4"],
      },
    }),
    injected(),
  ],
  transports: {
    [baseSepolia.id]: http(
      import.meta.env.VITE_BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org",
    ),
  },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <OnchainKitProvider
          apiKey={import.meta.env.VITE_ONCHAINKIT_API_KEY ?? ""}
          chain={baseSepolia}
          config={{
            wallet: {
              display: "modal",
            },
          }}
        >
          <WalletProvider>
            <RouterProvider router={router} />
          </WalletProvider>
        </OnchainKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}

export default App
