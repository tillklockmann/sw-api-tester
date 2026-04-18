import type { OpenApiSpec, SummarySpec } from '@/types/openapi'
import type { ApiMode, ShopwareVersion } from '@/types/shopware'

// Static imports for summary files (small, loaded immediately)
import adminSummary67 from '@/specs/v6.7/adminapi.summary.json'
import storeSummary67 from '@/specs/v6.7/storeapi.summary.json'
import adminSummary66 from '@/specs/v6.6/adminapi.summary.json'
import storeSummary66 from '@/specs/v6.6/storeapi.summary.json'

const summaryMap: Record<string, SummarySpec> = {
  'admin-6.7': adminSummary67 as SummarySpec,
  'store-6.7': storeSummary67 as SummarySpec,
  'admin-6.6': adminSummary66 as SummarySpec,
  'store-6.6': storeSummary66 as SummarySpec,
}

// Cache for full specs (loaded once per session)
const specCache = new Map<string, OpenApiSpec>()

export function loadSummary(mode: ApiMode, version: ShopwareVersion): SummarySpec {
  const key = `${mode}-${version}`
  return summaryMap[key] ?? { paths: [] }
}

export async function loadFullSpec(
  mode: ApiMode,
  version: ShopwareVersion,
  includeCommercial: boolean = true,
): Promise<OpenApiSpec> {
  const key = `${mode}-${version}-${includeCommercial}`
  if (specCache.has(key)) {
    return specCache.get(key)!
  }

  let spec: OpenApiSpec

  // Dynamic imports for large spec files (code-split by Vite)
  if (mode === 'admin' && version === '6.7') {
    spec = (await import('@/specs/v6.7/adminapi.json')) as unknown as OpenApiSpec
    if (includeCommercial) {
      const commercial = (await import('@/specs/v6.7/SwagCommercial-adminapi.json')) as unknown as OpenApiSpec
      spec = mergeSpecs(spec, commercial)
    }
  } else if (mode === 'admin' && version === '6.6') {
    spec = (await import('@/specs/v6.6/adminapi.json')) as unknown as OpenApiSpec
    if (includeCommercial) {
      const commercial = (await import('@/specs/v6.6/SwagCommercial-adminapi.json')) as unknown as OpenApiSpec
      spec = mergeSpecs(spec, commercial)
    }
  } else if (mode === 'store' && version === '6.7') {
    spec = (await import('@/specs/v6.7/storeapi.json')) as unknown as OpenApiSpec
    if (includeCommercial) {
      const commercial = (await import('@/specs/v6.7/SwagCommercial-storeapi.json')) as unknown as OpenApiSpec
      spec = mergeSpecs(spec, commercial)
    }
  } else {
    spec = (await import('@/specs/v6.6/storeapi.json')) as unknown as OpenApiSpec
    if (includeCommercial) {
      const commercial = (await import('@/specs/v6.6/SwagCommercial-storeapi.json')) as unknown as OpenApiSpec
      spec = mergeSpecs(spec, commercial)
    }
  }

  specCache.set(key, spec)
  return spec
}

function mergeSpecs(base: OpenApiSpec, extension: OpenApiSpec): OpenApiSpec {
  return {
    ...base,
    paths: { ...base.paths, ...extension.paths },
    components: {
      ...base.components,
      schemas: {
        ...base.components?.schemas,
        ...extension.components?.schemas,
      },
    },
  }
}
