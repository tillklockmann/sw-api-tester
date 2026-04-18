import type { OpenApiSpec, OpenApiSchema } from '@/types/openapi'
import { resolveRef } from './openapi-parser'

const MAX_DEPTH = 3

export function generateTemplate(
  spec: OpenApiSpec,
  schema: OpenApiSchema | null,
  depth: number = 0,
  visited: Set<string> = new Set(),
): unknown {
  if (!schema || depth > MAX_DEPTH) return null

  // Handle $ref
  if (schema.$ref) {
    if (visited.has(schema.$ref)) return null // circular ref
    visited.add(schema.$ref)
    const resolved = resolveRef(spec, schema.$ref)
    if (!resolved) return null
    return generateTemplate(spec, resolved, depth, visited)
  }

  // Handle allOf — merge all schemas
  if (schema.allOf) {
    const merged: Record<string, unknown> = {}
    for (const sub of schema.allOf) {
      const result = generateTemplate(spec, sub, depth, new Set(visited))
      if (result && typeof result === 'object' && !Array.isArray(result)) {
        Object.assign(merged, result)
      }
    }
    return merged
  }

  // Handle oneOf — use first option
  if (schema.oneOf && schema.oneOf.length > 0) {
    return generateTemplate(spec, schema.oneOf[0], depth, new Set(visited))
  }

  // Handle anyOf — use first option
  if (schema.anyOf && schema.anyOf.length > 0) {
    return generateTemplate(spec, schema.anyOf[0], depth, new Set(visited))
  }

  // Handle by type
  switch (schema.type) {
    case 'object':
      return generateObjectTemplate(spec, schema, depth, visited)
    case 'array':
      return generateArrayTemplate(spec, schema, depth, visited)
    case 'string':
      if (schema.enum && schema.enum.length > 0) return schema.enum[0]
      if (schema.format === 'date-time') return '2024-01-01T00:00:00.000Z'
      if (schema.format === 'uuid') return '00000000-0000-0000-0000-000000000000'
      if (schema.format === 'date') return '2024-01-01'
      if (schema.default !== undefined) return schema.default
      return ''
    case 'integer':
    case 'number':
      if (schema.default !== undefined) return schema.default
      return 0
    case 'boolean':
      if (schema.default !== undefined) return schema.default
      return false
    default:
      return null
  }
}

function generateObjectTemplate(
  spec: OpenApiSpec,
  schema: OpenApiSchema,
  depth: number,
  visited: Set<string>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  if (!schema.properties) return result

  const requiredSet = new Set(schema.required ?? [])

  for (const [key, propSchema] of Object.entries(schema.properties)) {
    // Skip read-only fields (like `id`, `createdAt`, `updatedAt` in responses)
    if (propSchema.readOnly) continue

    // For depth > 1, only include required fields to avoid massive templates
    if (depth > 1 && !requiredSet.has(key)) continue

    const value = generateTemplate(spec, propSchema, depth + 1, new Set(visited))
    result[key] = value
  }

  return result
}

function generateArrayTemplate(
  spec: OpenApiSpec,
  schema: OpenApiSchema,
  depth: number,
  visited: Set<string>,
): unknown[] {
  if (!schema.items || depth > MAX_DEPTH - 1) return []

  const itemSchema = '$ref' in schema.items ? (schema.items as OpenApiSchema) : schema.items
  const item = generateTemplate(spec, itemSchema as OpenApiSchema, depth + 1, new Set(visited))
  return item !== null ? [item] : []
}

export function generateTemplateJson(
  spec: OpenApiSpec,
  schema: OpenApiSchema | null,
): string {
  if (!schema) return ''
  const template = generateTemplate(spec, schema)
  if (template === null) return ''
  return JSON.stringify(template, null, 2)
}
