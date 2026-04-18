import { describe, it, expect } from 'vitest'
import { classifyPath, resolveRef, extractEndpoints, getEntityNames, getMethodsForPath } from '../openapi-parser'
import type { OpenApiSpec } from '@/types/openapi'

describe('classifyPath', () => {
  it('classifies search paths', () => {
    expect(classifyPath('/search/product')).toBe('search')
  })

  it('classifies aggregate paths', () => {
    expect(classifyPath('/aggregate/product')).toBe('aggregate')
  })

  it('classifies action paths', () => {
    expect(classifyPath('/_action/sync')).toBe('action')
  })

  it('classifies parameterized paths as crud', () => {
    expect(classifyPath('/product/{id}')).toBe('crud')
  })

  it('classifies plain paths as crud', () => {
    expect(classifyPath('/product')).toBe('crud')
  })
})

describe('resolveRef', () => {
  const spec: OpenApiSpec = {
    openapi: '3.0.0',
    info: { title: 'Test', version: '1.0' },
    paths: {},
    components: {
      schemas: {
        Product: { type: 'object', properties: { name: { type: 'string' } } },
      },
    },
  }

  it('resolves a valid $ref', () => {
    const result = resolveRef(spec, '#/components/schemas/Product')
    expect(result).toBeTruthy()
    expect(result!.type).toBe('object')
  })

  it('returns null for invalid $ref', () => {
    expect(resolveRef(spec, '#/components/schemas/NonExistent')).toBeNull()
  })

  it('returns null for empty path parts', () => {
    expect(resolveRef(spec, '#/nonexistent/path')).toBeNull()
  })
})

describe('extractEndpoints', () => {
  it('extracts and sorts endpoints', () => {
    const spec: OpenApiSpec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0' },
      paths: {
        '/product': { get: { responses: {} }, post: { responses: {} } },
        '/category': { get: { responses: {} } },
      },
    }

    const endpoints = extractEndpoints(spec)
    expect(endpoints).toHaveLength(2)
    expect(endpoints[0].path).toBe('/category')
    expect(endpoints[1].path).toBe('/product')
    expect(endpoints[1].methods).toEqual(['GET', 'POST'])
  })
})

describe('getEntityNames', () => {
  it('returns schema names that are objects with properties', () => {
    const spec: OpenApiSpec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0' },
      paths: {},
      components: {
        schemas: {
          Product: { type: 'object', properties: { name: { type: 'string' } } },
          ProductJsonApi: { type: 'object', properties: { id: { type: 'string' } } },
          SimpleString: { type: 'string' },
        },
      },
    }

    const names = getEntityNames(spec)
    expect(names).toEqual(['Product'])
  })
})

describe('getMethodsForPath', () => {
  it('returns methods for existing path', () => {
    const spec: OpenApiSpec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0' },
      paths: {
        '/product': { get: { responses: {} }, delete: { responses: {} } },
      },
    }

    const methods = getMethodsForPath(spec, '/product')
    expect(methods).toEqual(['GET', 'DELETE'])
  })

  it('returns GET for non-existent path', () => {
    const spec: OpenApiSpec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0' },
      paths: {},
    }

    expect(getMethodsForPath(spec, '/nope')).toEqual(['GET'])
  })
})
