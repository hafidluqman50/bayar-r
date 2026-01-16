export function formatIdrx(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

export function parseAmountInput(raw: string) {
  const digits = raw.replace(/[^\d]/g, "")
  const amount = digits ? Number(digits) : 0
  return {
    digits,
    amount,
    formatted: digits ? formatIdrx(amount) : "",
  }
}
