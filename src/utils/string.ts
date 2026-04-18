export function toSnakeCase(name: string): string {
  // If already snake_case, return as-is
  if (name.includes('_')) return name
  // Convert PascalCase to snake_case
  return name
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
}
