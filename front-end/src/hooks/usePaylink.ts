import { useMutation, useQuery } from "@tanstack/react-query"
import { parseEventLogs, zeroAddress } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"
import { MOCK_IDRX_ADDRESS, PAYLINK_ADDRESS } from "../config/contracts"
import { mockIdrxAbi } from "../contracts/mockIdrxAbi"
import { paylinkAbi } from "../contracts/paylinkAbi"
import { type Paylink } from "../utils/paylink"

const DAY_MS = 24 * 60 * 60 * 1000
const DECIMALS = 18n

const paylinkPaidEvent = paylinkAbi.find(
  entry => entry.type === "event" && entry.name === "PaylinkPaid",
)

export type CreatePaylinkInput = {
  amount: number
  note: string
  expiryDays: number
}

function mapOnchainPaylink(id: string, data: any) {
  const creator = data?.creator ?? data?.[0]
  if (!creator || creator === zeroAddress) return null

  const amountValue = data?.amount ?? data?.[1]
  const expiryValue = data?.expiry ?? data?.[2]
  const noteValue = data?.note ?? data?.[3]
  const paidValue = data?.paid ?? data?.[4]
  const payerValue = data?.payer ?? data?.[5]
  const paidAtValue = data?.paidAt ?? data?.[6]

  if (amountValue === undefined || expiryValue === undefined) return null

  const rawAmount = typeof amountValue === "bigint" ? amountValue : BigInt(amountValue)
  const expirySeconds = typeof expiryValue === "bigint" ? expiryValue : BigInt(expiryValue)
  const expiryAt = Number(expirySeconds) * 1000
  const remainingDays = Math.max(1, Math.ceil((expiryAt - Date.now()) / DAY_MS))

  return {
    id,
    creator,
    amount: Number(rawAmount / 10n ** DECIMALS),
    note: noteValue ?? "",
    expiryAt,
    expiryDays: remainingDays,
    createdAt: expiryAt - remainingDays * DAY_MS,
    paid: Boolean(paidValue),
    payer: payerValue && payerValue !== zeroAddress ? payerValue : null,
    paidAt: paidAtValue ? Number(paidAtValue) * 1000 : null,
  } satisfies Paylink
}

function parseNumericId(id?: string) {
  if (!id) return null
  if (!/^\d+$/.test(id)) return null
  return BigInt(id)
}

export function usePaylink(id?: string) {
  const publicClient = usePublicClient()

  return useQuery({
    queryKey: ["paylink", id, PAYLINK_ADDRESS],
    queryFn: async () => {
      if (!id) return null
      const numericId = parseNumericId(id)
      if (!PAYLINK_ADDRESS || !publicClient || numericId === null) return null

      const onchain = await publicClient.readContract({
        address: PAYLINK_ADDRESS,
        abi: paylinkAbi,
        functionName: "getPaylink",
        args: [numericId],
      })
      return mapOnchainPaylink(id, onchain)
    },
    enabled: !!id,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  })
}

async function findPaidEventTxHash(
  publicClient: ReturnType<typeof usePublicClient>,
  id: bigint,
  paidAtMs: number,
) {
  if (!publicClient) return null
  const paidAtSeconds = Math.floor(paidAtMs / 1000)
  const latestBlock = await publicClient.getBlockNumber()
  let cursor = latestBlock

  for (let i = 0; i < 60; i += 1) {
    const block = await publicClient.getBlock({ blockNumber: cursor })
    if (!block?.timestamp) break

    const blockSeconds = Number(block.timestamp)
    if (blockSeconds <= paidAtSeconds || cursor <= 9n) {
      const fromBlock = cursor > 9n ? cursor - 9n : 0n
      const logs = await publicClient.getLogs({
        address: PAYLINK_ADDRESS,
        event: paylinkPaidEvent,
        args: {
          id,
        },
        fromBlock,
        toBlock: cursor,
      })

      if (!logs.length) return null
      return logs[logs.length - 1]?.transactionHash ?? null
    }

    cursor = cursor > 9n ? cursor - 9n : 0n
  }

  return null
}

export function useCreatePaylink() {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { isConnected } = useAccount()

  return useMutation({
    mutationFn: async (input: CreatePaylinkInput) => {
      if (!PAYLINK_ADDRESS || !walletClient || !publicClient || !isConnected) {
        throw new Error("Connect wallet to create onchain paylink.")
      }

      const createdAt = Date.now()
      const expiryAt = createdAt + input.expiryDays * DAY_MS
      const amountWei = BigInt(input.amount) * 10n ** DECIMALS

      const simulation = await publicClient.simulateContract({
        address: PAYLINK_ADDRESS,
        abi: paylinkAbi,
        functionName: "createPaylink",
        args: [amountWei, BigInt(input.expiryDays), input.note],
        account: walletClient.account,
      })

      const txHash = await walletClient.writeContract(simulation.request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
      const logs = parseEventLogs({
        abi: paylinkAbi,
        eventName: "PaylinkCreated",
        logs: receipt.logs,
      })
      const createdLog = logs[0]
      let id: string

      if (createdLog?.args?.id !== undefined) {
        id = createdLog.args.id.toString()
      } else {
        const nextId = await publicClient.readContract({
          address: PAYLINK_ADDRESS,
          abi: paylinkAbi,
          functionName: "nextId",
        })
        id = (nextId - 1n).toString()
      }

      return {
        id,
        creator: walletClient.account.address,
        amount: input.amount,
        note: input.note,
        expiryDays: input.expiryDays,
        expiryAt,
        createdAt,
        paid: false,
        payer: null,
        paidAt: null,
      } satisfies Paylink
    },
  })
}

export function usePayLinkMutation(id?: string, amount?: number) {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { isConnected } = useAccount()

  return useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Missing paylink")
      const numericId = parseNumericId(id)
      if (
        !PAYLINK_ADDRESS ||
        !MOCK_IDRX_ADDRESS ||
        !walletClient ||
        !publicClient ||
        !isConnected ||
        numericId === null ||
        amount === undefined
      ) {
        throw new Error("Connect wallet to pay onchain.")
      }

      const amountWei = BigInt(amount) * 10n ** DECIMALS

      const approveSimulation = await publicClient.simulateContract({
        address: MOCK_IDRX_ADDRESS,
        abi: mockIdrxAbi,
        functionName: "approve",
        args: [PAYLINK_ADDRESS, amountWei],
        account: walletClient.account,
      })
      const approveHash = await walletClient.writeContract(
        approveSimulation.request,
      )
      await publicClient.waitForTransactionReceipt({ hash: approveHash })

      const paySimulation = await publicClient.simulateContract({
        address: PAYLINK_ADDRESS,
        abi: paylinkAbi,
        functionName: "pay",
        args: [numericId],
        account: walletClient.account,
      })
      const payHash = await walletClient.writeContract(paySimulation.request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash: payHash })

      return receipt.transactionHash
    },
  })
}
