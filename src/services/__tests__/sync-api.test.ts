import { describe, it, expect } from 'vitest'
import { buildSyncPayload } from '../sync-api'
import type { OpenApiSpec } from '@/types/openapi'

const minimalSpec: OpenApiSpec = {
  openapi: '3.0.0',
  info: { title: 'Test', version: '1.0' },
  paths: {},
  components: {
    schemas: {
      Product: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          active: { type: 'boolean' },
        },
        required: ['name'],
      },
    },
  },
}

describe('buildSyncPayload', () => {
  it('generates upsert payload with entity template from spec', () => {
    const result = buildSyncPayload(minimalSpec, 'Product', 'upsert')
    const parsed = JSON.parse(result)

    expect(parsed).toHaveProperty('Product-upsert')
    expect(parsed['Product-upsert'].entity).toBe('product')
    expect(parsed['Product-upsert'].action).toBe('upsert')
    expect(parsed['Product-upsert'].payload).toHaveLength(1)
  })

  it('generates delete payload with id placeholder', () => {
    const result = buildSyncPayload(minimalSpec, 'Product', 'delete')
    const parsed = JSON.parse(result)

    expect(parsed['Product-delete'].action).toBe('delete')
    expect(parsed['Product-delete'].payload[0].id).toBe('00000000-0000-0000-0000-000000000000')
  })

  it('converts PascalCase entity to snake_case', () => {
    const result = buildSyncPayload(null, 'ProductManufacturer', 'upsert')
    const parsed = JSON.parse(result)

    expect(parsed['ProductManufacturer-upsert'].entity).toBe('product_manufacturer')
  })

  it('handles null spec gracefully', () => {
    const result = buildSyncPayload(null, 'Product', 'upsert')
    const parsed = JSON.parse(result)

    expect(parsed['Product-upsert'].payload).toHaveLength(1)
    expect(parsed['Product-upsert'].payload[0]).toEqual({})
  })
})
