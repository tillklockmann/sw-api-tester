import { describe, it, expect } from 'vitest'
import { buildCustomPricePayload, defaultCustomPriceEntry } from '../custom-price'

describe('buildCustomPricePayload', () => {
  it('produces valid JSON with default entry', () => {
    const entry = defaultCustomPriceEntry()
    const result = buildCustomPricePayload(entry)
    const parsed = JSON.parse(result)

    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].action).toBe('upsert')
    expect(parsed[0].payload).toHaveLength(1)
  })

  it('includes productId with placeholder UUID when empty', () => {
    const entry = defaultCustomPriceEntry()
    const parsed = JSON.parse(buildCustomPricePayload(entry))
    expect(parsed[0].payload[0].productId).toBe('00000000-0000-0000-0000-000000000000')
  })

  it('includes optional fields only when set', () => {
    const entry = defaultCustomPriceEntry()
    entry.customerId = ''
    entry.ruleId = 'some-rule'
    const parsed = JSON.parse(buildCustomPricePayload(entry))
    const item = parsed[0].payload[0]

    expect(item).not.toHaveProperty('customerId')
    expect(item.ruleId).toBe('some-rule')
  })

  it('maps price tiers correctly', () => {
    const entry = defaultCustomPriceEntry()
    entry.priceTiers = [
      { quantityStart: 1, quantityEnd: 10, currencyId: 'abc', gross: 100, net: 84, linked: true },
      { quantityStart: 11, quantityEnd: null, currencyId: 'abc', gross: 90, net: 75, linked: false },
    ]
    const parsed = JSON.parse(buildCustomPricePayload(entry))
    const price = parsed[0].payload[0].price

    expect(price).toHaveLength(2)
    expect(price[0].quantityStart).toBe(1)
    expect(price[0].quantityEnd).toBe(10)
    expect(price[1]).not.toHaveProperty('quantityEnd')
    expect(price[0].price[0].gross).toBe(100)
    expect(price[0].price[0].linked).toBe(true)
  })

  it('handles delete action', () => {
    const entry = defaultCustomPriceEntry()
    entry.action = 'delete'
    const parsed = JSON.parse(buildCustomPricePayload(entry))
    expect(parsed[0].action).toBe('delete')
  })
})

describe('defaultCustomPriceEntry', () => {
  it('returns a fresh object each time', () => {
    const a = defaultCustomPriceEntry()
    const b = defaultCustomPriceEntry()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })

  it('has sensible defaults', () => {
    const entry = defaultCustomPriceEntry()
    expect(entry.action).toBe('upsert')
    expect(entry.priceTiers).toHaveLength(1)
  })
})
