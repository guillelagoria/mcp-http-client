# MCP HTTP Client

> 🚀 **Generic HTTP client for MCP servers** - Connect Claude Desktop to remote MCP knowledge bases without downloading anything!

## What is this?

This is a lightweight (~20KB) client that allows you to connect [Claude Desktop](https://claude.ai/download) to remote MCP (Model Context Protocol) servers over HTTP/HTTPS. Instead of downloading large repositories with PDFs and running them locally, this client connects to a remote server and fetches content on-demand.

## Features

- ✅ **Zero local storage** - No need to download 100+ MB of PDFs
- ✅ **Always up-to-date** - The remote server is updated automatically
- ✅ **Works everywhere** - Cross-platform (macOS, Windows, Linux)
- ✅ **Simple setup** - One-line configuration in Claude Desktop
- ✅ **Multiple servers** - Connect to different knowledge bases easily

## Installation

### For Claude Desktop

1. Open your Claude Desktop configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the server configuration:

```json
{
  "mcpServers": {
    "latch-knowledge": {
      "command": "npx",
      "args": ["-y", "mcp-http-client", "https://latch-support-mcp-production.up.railway.app"]
    }
  }
}
```

3. Restart Claude Desktop

That's it! 🎉

## Available Servers

### Latch Support Knowledge Base
```json
{
  "mcpServers": {
    "latch-knowledge": {
      "command": "npx",
      "args": ["-y", "mcp-http-client", "https://latch-support-mcp-production.up.railway.app"]
    }
  }
}
```

**Content**: 225+ documents including installation guides, spec sheets, troubleshooting, and more.

### Door Support Knowledge Base (Coming Soon)
```json
{
  "mcpServers": {
    "door-knowledge": {
      "command": "npx",
      "args": ["-y", "mcp-http-client", "https://door-support-mcp-production.up.railway.app"]
    }
  }
}
```

## Available Tools

Once connected, Claude Desktop will have access to these tools:

### 1. `search_knowledge`
Search the knowledge base for relevant documents.

**Parameters**:
- `query` (required): Search query (e.g., "installation", "troubleshooting")
- `category` (optional): Filter by category
- `limit` (optional): Maximum number of results (default: 10)

### 2. `get_document`
Get the complete content of a specific document by its ID.

**Parameters**:
- `document_id` (required): Document ID from search results

### 3. `list_categories`
List all available categories in the knowledge base with document counts.

## Usage Examples

After configuring Claude Desktop, you can ask Claude questions like:

- "Search for Latch M2 installation guides"
- "Show me all runbooks for Latch devices"
- "What categories are available in the knowledge base?"
- "Get the full content of document XYZ"

Claude will automatically use the appropriate tools to answer your questions.

## Command Line Usage

You can also run the client directly from the command line:

```bash
# Using npx (no installation needed)
npx -y mcp-http-client https://your-server.railway.app

# Or install globally
npm install -g mcp-http-client
mcp-http-client https://your-server.railway.app

# Using environment variable
export MCP_SERVER_URL=https://your-server.railway.app
mcp-http-client
```

## Troubleshooting

### Client won't start
- Check that Node.js 18+ is installed: `node --version`
- Verify the server URL is correct and accessible: `curl https://your-server/health`

### No results in searches
- Try different keywords
- Use `list_categories` to see available content
- Check that the server is responding: `curl https://your-server/health`

### Claude Desktop doesn't see the tools
1. Make sure you saved the configuration file correctly
2. Restart Claude Desktop completely (quit and reopen)
3. Check Claude Desktop logs for errors

## For Developers

### Creating Your Own MCP Server

This client can connect to any MCP server that exposes these HTTP endpoints:

```
GET /health           - Health check (returns {status, service, documents})
GET /api/search       - Search documents (query params: query, category?, limit?)
GET /api/document     - Get document by ID (query param: id)
GET /api/categories   - List all categories
```

See the [Latch Support MCP repository](https://github.com/guillelagoria/latch-support-mcp) for a complete server implementation example.

### Local Development

```bash
# Clone the repository
git clone https://github.com/guillelagoria/mcp-http-client.git
cd mcp-http-client

# Install dependencies
npm install

# Test with a server
node index.js https://your-server.railway.app
```

## Architecture

```
User
  ↓
Claude Desktop (local)
  ↓
mcp-http-client (NPM package, ~20KB)
  ↓
HTTP/HTTPS
  ↓
Railway Server (your API)
  ↓
Knowledge Base (documents)
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Author

Guille Lagoria

## Links

- **GitHub**: https://github.com/guillelagoria/mcp-http-client
- **NPM**: https://www.npmjs.com/package/mcp-http-client
- **Example Server**: https://github.com/guillelagoria/latch-support-mcp
- **MCP Documentation**: https://modelcontextprotocol.io

## Support

If you encounter any issues, please file a bug report at:
https://github.com/guillelagoria/mcp-http-client/issues
