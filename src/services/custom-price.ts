export interface CustomPriceEntry {
  productId: string
  customerId: string
  customerGroupId: string
  ruleId: string
  prices: CustomPriceRow[]
}

export interface CustomPriceRow {
  quantityStart: number
  quantityEnd: number | null
  currencyId: string
  gross: number
  net: number
  linked: boolean
}

export function buildCustomPricePayload(entry: CustomPriceEntry): string {
  const priceArray = entry.prices.map((p) => ({
    quantityStart: p.quantityStart,
    ...(p.quantityEnd !== null ? { quantityEnd: p.quantityEnd } : {}),
    price: [
      {
        currencyId: p.currencyId || '00000000-0000-0000-0000-000000000000',
        gross: p.gross,
        net: p.net,
        linked: p.linked,
      },
    ],
  }))

  const payload: Record<string, unknown> = {
    productId: entry.productId || '00000000-0000-0000-0000-000000000000',
    price: priceArray,
  }

  if (entry.customerId) {
    payload.customerId = entry.customerId
  }
  if (entry.customerGroupId) {
    payload.customerGroupId = entry.customerGroupId
  }
  if (entry.ruleId) {
    payload.ruleId = entry.ruleId
  }

  return JSON.stringify({ prices: [payload] }, null, 2)
}

export function defaultCustomPriceEntry(): CustomPriceEntry {
  return {
    productId: '',
    customerId: '',
    customerGroupId: '',
    ruleId: '',
    prices: [
      {
        quantityStart: 1,
        quantityEnd: null,
        currencyId: '',
        gross: 0,
        net: 0,
        linked: false,
      },
    ],
  }
}
