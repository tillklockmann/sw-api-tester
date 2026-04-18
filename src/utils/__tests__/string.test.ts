import { describe, it, expect } from 'vitest'
import { toSnakeCase } from '../string'

describe('toSnakeCase', () => {
  it('converts PascalCase to snake_case', () => {
    expect(toSnakeCase('ProductManufacturer')).toBe('product_manufacturer')
  })

  it('returns snake_case strings unchanged', () => {
    expect(toSnakeCase('product_manufacturer')).toBe('product_manufacturer')
  })

  it('converts single word', () => {
    expect(toSnakeCase('Product')).toBe('product')
  })

  it('handles lowercase input', () => {
    expect(toSnakeCase('product')).toBe('product')
  })
})
