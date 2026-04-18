import type { OpenApiSpec, OpenApiSchema, EndpointInfo, EndpointDetail, OpenApiOperation } from '@/types/openapi'
import type { HttpMethod } from '@/types/shopware'

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const

export function classifyPath(path: string): EndpointInfo['group'] {
  if (path.startsWith('/search/')) return 'search'
  if (path.startsWith('/aggregate/')) return 'aggregate'
  if (path.startsWith('/_action/')) return 'action'
  if (path.includes('{')) return 'crud'
  return 'crud'
}

export function extractEndpoints(spec: OpenApiSpec): EndpointInfo[] {
  const endpoints: EndpointInfo[] = []

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    const methods = Object.keys(pathItem).filter((m) =>
      HTTP_METHODS.includes(m as (typeof HTTP_METHODS)[number]),
    )

    if (methods.length > 0) {
      const firstOp = pathItem[methods[0]] as OpenApiOperation
      endpoints.push({
        path,
        methods: methods.map((m) => m.toUpperCase()),
        group: classifyPath(path),
        summary: firstOp?.summary,
      })
    }
  }

  return endpoints.sort((a, b) => a.path.localeCompare(b.path))
}

export function getEndpointDetail(
  spec: OpenApiSpec,
  path: string,
  method: string,
): EndpointDetail | null {
  const pathItem = spec.paths[path]
  if (!pathItem) return null

  const operation = pathItem[method.toLowerCase()] as OpenApiOperation | undefined
  if (!operation) return null

  let requestBodySchema: OpenApiSchema | null = null
  const bodyRef = operation.requestBody?.content?.['application/json']?.schema
  if (bodyRef) {
    if ('$ref' in bodyRef && bodyRef.$ref) {
      requestBodySchema = resolveRef(spec, bodyRef.$ref)
    } else {
      requestBodySchema = bodyRef as OpenApiSchema
    }
  }

  return {
    path,
    method: method.toUpperCase(),
    summary: operation.summary,
    description: operation.description,
    parameters: operation.parameters ?? [],
    requestBodySchema,
    tags: operation.tags ?? [],
  }
}

export function resolveRef(spec: OpenApiSpec, ref: string): OpenApiSchema | null {
  // Handle "#/components/schemas/Product"
  const parts = ref.replace('#/', '').split('/')
  let current: unknown = spec
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return null
    }
  }
  return current as OpenApiSchema
}

export function getEntityNames(spec: OpenApiSpec): string[] {
  if (!spec.components?.schemas) return []
  return Object.keys(spec.components.schemas)
    .filter((name) => {
      const schema = spec.components!.schemas![name]
      return schema.type === 'object' && schema.properties && !name.includes('JsonApi')
    })
    .sort()
}

export function getMethodsForPath(spec: OpenApiSpec, path: string): HttpMethod[] {
  const pathItem = spec.paths[path]
  if (!pathItem) return ['GET']

  return Object.keys(pathItem)
    .filter((m) => HTTP_METHODS.includes(m as (typeof HTTP_METHODS)[number]))
    .map((m) => m.toUpperCase() as HttpMethod)
}
