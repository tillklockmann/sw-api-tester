export interface OpenApiSpec {
  openapi: string
  info: { title: string; version: string }
  paths: Record<string, OpenApiPathItem>
  components?: {
    schemas?: Record<string, OpenApiSchema>
  }
}

export interface OpenApiPathItem {
  [method: string]: OpenApiOperation
}

export interface OpenApiOperation {
  tags?: string[]
  summary?: string
  description?: string
  operationId?: string
  parameters?: OpenApiParameter[]
  requestBody?: {
    content?: {
      'application/json'?: {
        schema?: OpenApiSchema | { $ref: string }
      }
    }
  }
  responses?: Record<string, unknown>
}

export interface OpenApiParameter {
  name: string
  in: 'path' | 'query' | 'header'
  required?: boolean
  schema?: OpenApiSchema
  description?: string
}

export interface OpenApiSchema {
  type?: string
  format?: string
  description?: string
  properties?: Record<string, OpenApiSchema>
  required?: string[]
  items?: OpenApiSchema | { $ref: string }
  enum?: string[]
  $ref?: string
  oneOf?: OpenApiSchema[]
  allOf?: OpenApiSchema[]
  anyOf?: OpenApiSchema[]
  readOnly?: boolean
  writeOnly?: boolean
  default?: unknown
  nullable?: boolean
}

export interface SummarySpec {
  paths: string[]
}

export interface EndpointInfo {
  path: string
  methods: string[]
  group: 'crud' | 'search' | 'aggregate' | 'action' | 'other'
  summary?: string
}

export interface EndpointDetail {
  path: string
  method: string
  summary?: string
  description?: string
  parameters: OpenApiParameter[]
  requestBodySchema: OpenApiSchema | null
  tags: string[]
}
