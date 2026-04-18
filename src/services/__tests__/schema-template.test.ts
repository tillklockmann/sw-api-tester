import { describe, it, expect } from 'vitest'
import { generateTemplate, generateTemplateJson } from '../schema-template'
import type { OpenApiSpec, OpenApiSchema } from '@/types/openapi'

const baseSpec: OpenApiSpec = {
  openapi: '3.0.0',
  info: { title: 'Test', version: '1.0' },
  paths: {},
  components: {
    schemas: {
      Address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
        },
      },
    },
  },
}

describe('generateTemplate', () => {
  it('generates string defaults', () => {
    expect(generateTemplate(baseSpec, { type: 'string' })).toBe('')
  })

  it('generates uuid format', () => {
    expect(generateTemplate(baseSpec, { type: 'string', format: 'uuid' })).toBe(
      '00000000-0000-0000-0000-000000000000',
    )
  })

  it('generates date-time format', () => {
    expect(generateTemplate(baseSpec, { type: 'string', format: 'date-time' })).toBe(
      '2024-01-01T00:00:00.000Z',
    )
  })

  it('generates number defaults', () => {
    expect(generateTemplate(baseSpec, { type: 'integer' })).toBe(0)
    expect(generateTemplate(baseSpec, { type: 'number' })).toBe(0)
  })

  it('generates boolean defaults', () => {
    expect(generateTemplate(baseSpec, { type: 'boolean' })).toBe(false)
  })

  it('picks first enum value', () => {
    expect(generateTemplate(baseSpec, { type: 'string', enum: ['active', 'inactive'] })).toBe('active')
  })

  it('generates object with properties', () => {
    const schema: OpenApiSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        count: { type: 'integer' },
      },
    }
    const result = generateTemplate(baseSpec, schema) as Record<string, unknown>
    expect(result.name).toBe('')
    expect(result.count).toBe(0)
  })

  it('skips readOnly fields', () => {
    const schema: OpenApiSchema = {
      type: 'object',
      properties: {
        id: { type: 'string', readOnly: true },
        name: { type: 'string' },
      },
    }
    const result = generateTemplate(baseSpec, schema) as Record<string, unknown>
    expect(result).not.toHaveProperty('id')
    expect(result).toHaveProperty('name')
  })

  it('resolves $ref', () => {
    const schema: OpenApiSchema = { $ref: '#/components/schemas/Address' }
    const result = generateTemplate(baseSpec, schema) as Record<string, unknown>
    expect(result).toHaveProperty('street')
    expect(result).toHaveProperty('city')
  })

  it('handles circular $ref without infinite loop', () => {
    const circularSpec: OpenApiSpec = {
      ...baseSpec,
      components: {
        schemas: {
          Node: {
            type: 'object',
            properties: {
              child: { $ref: '#/components/schemas/Node' },
              value: { type: 'string' },
            },
          },
        },
      },
    }
    const result = generateTemplate(circularSpec, { $ref: '#/components/schemas/Node' })
    expect(result).toBeTruthy()
  })

  it('returns null for null schema', () => {
    expect(generateTemplate(baseSpec, null)).toBeNull()
  })

  it('generates array templates', () => {
    const schema: OpenApiSchema = {
      type: 'array',
      items: { type: 'string' },
    }
    const result = generateTemplate(baseSpec, schema) as unknown[]
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(1)
    expect(result[0]).toBe('')
  })
})

describe('generateTemplateJson', () => {
  it('returns JSON string for valid schema', () => {
    const schema: OpenApiSchema = { type: 'object', properties: { x: { type: 'string' } } }
    const json = generateTemplateJson(baseSpec, schema)
    expect(JSON.parse(json)).toEqual({ x: '' })
  })

  it('returns empty string for null schema', () => {
    expect(generateTemplateJson(baseSpec, null)).toBe('')
  })
})
