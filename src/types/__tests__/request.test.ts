import { describe, it, expect } from 'vitest'
import { getStatusCategory } from '../request'

describe('getStatusCategory', () => {
  it('categorizes 2xx statuses', () => {
    expect(getStatusCategory(200)).toBe('2xx')
    expect(getStatusCategory(201)).toBe('2xx')
    expect(getStatusCategory(299)).toBe('2xx')
  })

  it('categorizes 3xx statuses', () => {
    expect(getStatusCategory(301)).toBe('3xx')
    expect(getStatusCategory(304)).toBe('3xx')
  })

  it('categorizes 4xx statuses', () => {
    expect(getStatusCategory(400)).toBe('4xx')
    expect(getStatusCategory(404)).toBe('4xx')
    expect(getStatusCategory(422)).toBe('4xx')
  })

  it('categorizes 5xx statuses', () => {
    expect(getStatusCategory(500)).toBe('5xx')
    expect(getStatusCategory(503)).toBe('5xx')
  })

  it('falls back to 5xx for edge cases', () => {
    expect(getStatusCategory(100)).toBe('5xx')
    expect(getStatusCategory(600)).toBe('5xx')
  })
})
