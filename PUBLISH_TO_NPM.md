# How to Publish to NPM

## Prerequisites

1. You need an NPM account. If you don't have one, create it at: https://www.npmjs.com/signup

2. You need to be logged in via the command line.

## Step-by-Step Publishing Guide

### 1. Log in to NPM

```bash
cd "/Users/guille/Disco/Proyectos AI/MCP/mcp-http-client"
npm login
```

This will prompt you for:
- **Username**: Your NPM username
- **Password**: Your NPM password
- **Email**: Your NPM email
- **One-time password**: If you have 2FA enabled, you'll need to enter the code from your authenticator app

### 2. Verify you're logged in

```bash
npm whoami
```

This should display your NPM username.

### 3. Test the package locally (Optional but Recommended)

```bash
# Simulate what will be published
npm pack

# This creates a .tgz file showing exactly what will be uploaded
# You can inspect it to make sure everything looks good
```

### 4. Publish to NPM

```bash
npm publish --access public
```

**Note**: The `--access public` flag is required for scoped packages or to ensure the package is public.

### 5. Verify the publication

After publishing, visit:
- https://www.npmjs.com/package/mcp-http-client

You should see your package listed with all the information from package.json and the README.md displayed.

### 6. Test the published package

```bash
# In a different directory, test installing via npx
npx -y mcp-http-client https://your-mcp-server.example.com
```

This should connect to your server and show:
```
🔌 Connecting to https://your-mcp-server.example.com...
✅ Connected to your-service-name
   📄 XXX documents available
```

## Troubleshooting

### "Package name already exists"
If someone else already published a package with this name, you'll need to:
1. Choose a different name (e.g., `@your-username/mcp-http-client`)
2. Update the `name` field in package.json
3. Try publishing again

### "Need to log in"
Run `npm login` again and make sure you enter the correct credentials.

### "Version already published"
If you need to republish, increment the version in package.json:
```bash
npm version patch  # 1.0.0 -> 1.0.1
npm publish --access public
```

## After Publishing

### Test with Claude Desktop

1. Open Claude Desktop config: `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Add the configuration:
```json
{
  "mcpServers": {
    "my-knowledge-base": {
      "command": "npx",
      "args": ["-y", "mcp-http-client", "https://your-mcp-server.example.com"]
    }
  }
}
```
3. Restart Claude Desktop
4. Test by asking Claude to search your knowledge base

## Future Updates

When you need to update the package:

```bash
cd "/Users/guille/Disco/Proyectos AI/MCP/mcp-http-client"

# Make your changes to the code

# Commit to git
git add .
git commit -m "Description of changes"
git push

# Bump version (patch, minor, or major)
npm version patch  # or minor, or major

# Publish
npm publish --access public
```

## Package URLs

After publishing, your package will be available at:
- **NPM**: https://www.npmjs.com/package/mcp-http-client
- **GitHub**: https://github.com/guillelagoria/mcp-http-client
- **Install**: `npx -y mcp-http-client <server-url>`

## Summary

✅ Repository created: https://github.com/guillelagoria/mcp-http-client
✅ Code is ready
✅ README is complete
⏳ Waiting for NPM publish (requires manual `npm login`)

Once you run `npm publish --access public`, users worldwide will be able to install your MCP client with a single command!
