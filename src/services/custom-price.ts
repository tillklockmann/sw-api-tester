export type CustomPriceAction = 'upsert' | 'delete'

export interface CustomPriceEntry {
  action: CustomPriceAction
  productId: string
  customerId: string
  customerGroupId: string
  ruleId: string
  priceTiers: CustomPriceTier[]
}

export interface CustomPriceTier {
  quantityStart: number
  quantityEnd: number | null
  currencyId: string
  gross: number
  net: number
  linked: boolean
}

export function buildCustomPricePayload(entry: CustomPriceEntry): string {
  // Build the inner payload object
  const payloadItem: Record<string, unknown> = {
    productId: entry.productId || '00000000-0000-0000-0000-000000000000',
  }

  if (entry.customerId) {
    payloadItem.customerId = entry.customerId
  }
  if (entry.customerGroupId) {
    payloadItem.customerGroupId = entry.customerGroupId
  }
  if (entry.ruleId) {
    payloadItem.ruleId = entry.ruleId
  }

  // Build price tiers — each tier has a nested "price" array with currency details
  payloadItem.price = entry.priceTiers.map((tier) => ({
    quantityStart: tier.quantityStart,
    ...(tier.quantityEnd !== null ? { quantityEnd: tier.quantityEnd } : {}),
    price: [
      {
        currencyId: tier.currencyId || '00000000-0000-0000-0000-000000000000',
        gross: tier.gross,
        net: tier.net,
        linked: tier.linked,
      },
    ],
  }))

  // Top-level is an array of operations (sync-API-like structure)
  const operations = [
    {
      action: entry.action,
      payload: [payloadItem],
    },
  ]

  return JSON.stringify(operations, null, 2)
}

export function defaultCustomPriceEntry(): CustomPriceEntry {
  return {
    action: 'upsert',
    productId: '',
    customerId: '',
    customerGroupId: '',
    ruleId: '',
    priceTiers: [
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
