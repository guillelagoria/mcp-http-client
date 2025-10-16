# mcp-http-client

HTTP transport adapter for MCP SDK stdio protocol implementation.

## Description

Implements HTTP/HTTPS transport layer for Model Context Protocol servers using stdio-based communication. Requires compatible MCP server endpoint.

## Usage

Requires MCP-compatible server with HTTP API endpoints.

```bash
npx mcp-http-client <server-url>
```

### Configuration

Edit Claude Desktop config file:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "mcp-http-client", "<server-url>"]
    }
  }
}
```

## Server Requirements

MCP server must implement these endpoints:

```
GET /health
GET /api/search?query=<string>&category=<string>&limit=<number>
GET /api/document?id=<string>
GET /api/categories
```

## Tools

- `search_knowledge`: Query document search
- `get_document`: Retrieve document by ID
- `list_categories`: List available categories

## Technical Details

Transport: StdioServerTransport
Protocol: MCP SDK v0.6.0
Node: >=18.0.0

## License

MIT
