import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { createMcpServer } from "@/mcp/create-server"

// Stateless: cada request crea su propio servidor y transport.
// Funciona en Vercel (serverless) sin problema.
async function handleMcp(req: Request): Promise<Response> {
  const server = createMcpServer()
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  })
  await server.connect(transport)
  return transport.handleRequest(req)
}

export async function GET(req: Request) {
  return handleMcp(req)
}

export async function POST(req: Request) {
  return handleMcp(req)
}

export async function DELETE(req: Request) {
  return handleMcp(req)
}
