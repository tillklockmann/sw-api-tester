import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { Plugin } from 'vite'

const CONFIG_DIR = '.api-tester'
const FILES: Record<string, string> = {
  shops: 'shops.json',
  'saved-requests': 'saved-requests.json',
}

export function configStoragePlugin(): Plugin {
  let projectRoot: string

  return {
    name: 'config-storage',
    configResolved(config) {
      projectRoot = config.root
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/__config/')) return next()

        const key = req.url.replace('/__config/', '')
        const filename = FILES[key]
        if (!filename) {
          res.statusCode = 404
          res.end(JSON.stringify({ error: 'Unknown config key' }))
          return
        }

        const dirPath = join(projectRoot, CONFIG_DIR)
        const filePath = join(dirPath, filename)

        if (req.method === 'GET') {
          try {
            const data = await readFile(filePath, 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(data)
          } catch {
            res.setHeader('Content-Type', 'application/json')
            res.end('[]')
          }
          return
        }

        if (req.method === 'POST') {
          try {
            const chunks: Buffer[] = []
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
            }
            const body = Buffer.concat(chunks).toString('utf-8')

            // Validate JSON
            JSON.parse(body)

            await mkdir(dirPath, { recursive: true })
            await writeFile(filePath, body, 'utf-8')

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (err) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: String(err) }))
          }
          return
        }

        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method not allowed' }))
      })
    },
  }
}
