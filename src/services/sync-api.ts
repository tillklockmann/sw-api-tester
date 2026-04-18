import type { OpenApiSpec } from '@/types/openapi'
import { generateTemplateJson } from './schema-template'
import { toSnakeCase } from '@/utils/string'

export function buildSyncPayload(
  spec: OpenApiSpec | null,
  entity: string,
  action: 'upsert' | 'delete',
): string {
  const operationName = `${entity}-${action}`
  let innerPayload: unknown = {}

  if (spec && action === 'upsert') {
    // Try to find the entity schema and generate a template
    const schemaName = entityToSchemaName(entity)
    const schema = spec.components?.schemas?.[schemaName]
    if (schema) {
      const template = generateTemplateJson(spec, schema)
      if (template) {
        try {
          innerPayload = JSON.parse(template)
        } catch {
          // fallback
        }
      }
    }
  }

  if (action === 'delete') {
    innerPayload = { id: '00000000-0000-0000-0000-000000000000' }
  }

  const payload = {
    [operationName]: {
      entity: toSnakeCase(entity),
      action,
      payload: [innerPayload],
    },
  }

  return JSON.stringify(payload, null, 2)
}

function entityToSchemaName(entity: string): string {
  // Convert "product_manufacturer" -> "ProductManufacturer"
  return entity
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

