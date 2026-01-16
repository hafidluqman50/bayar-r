export type Paylink = {
  id: string
  creator: `0x${string}`
  amount: number
  note: string
  expiryAt: number
  expiryDays: number
  createdAt: number
  paid: boolean
  payer: `0x${string}` | null
  paidAt: number | null
}
