# Quick Start Guide

## For Users (Claude Desktop)

### Step 1: Open Configuration File

**macOS**:
```bash
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows**:
```cmd
notepad %APPDATA%\Claude\claude_desktop_config.json
```

### Step 2: Add This Configuration

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

### Step 3: Restart Claude Desktop

Quit and reopen Claude Desktop.

### Step 4: Try It!

Ask Claude:
- "What categories are available in the Latch knowledge base?"
- "Search for Latch M2 installation guides"
- "Show me all available runbooks"

Done! 🎉

---

## For Developers

### Publish to NPM

```bash
cd "/Users/guille/Disco/Proyectos AI/MCP/mcp-http-client"
npm login
npm publish --access public
```

See `PUBLISH_TO_NPM.md` for detailed instructions.

### Test Locally

```bash
# Test connection
node index.js https://latch-support-mcp-production.up.railway.app

# Run test script
./test-client.sh
```

### Create Your Own MCP Server

Your HTTP server needs these endpoints:

```
GET  /health           -> {status, service, documents}
GET  /api/search       -> {query, totalResults, results[]}
GET  /api/document     -> {id, title, content, ...}
GET  /api/categories   -> {categories{}, totalDocuments}
```

See https://github.com/guillelagoria/latch-support-mcp for a complete example.

---

## Troubleshooting

### "Client won't start"
- Check Node.js version: `node --version` (need 18+)
- Verify server URL: `curl https://your-server/health`

### "No tools in Claude Desktop"
1. Save config file
2. Completely restart Claude Desktop (quit and reopen)
3. Check Claude Desktop logs

### "Connection failed"
- Verify server is running: `curl https://your-server/health`
- Check internet connection
- Wait 30 seconds and try again (server may be waking up)

---

## Links

- **Documentation**: https://github.com/guillelagoria/mcp-http-client
- **Example Server**: https://github.com/guillelagoria/latch-support-mcp
- **Issues**: https://github.com/guillelagoria/mcp-http-client/issues
