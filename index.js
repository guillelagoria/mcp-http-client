#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

/**
 * Generic HTTP MCP Client
 * Connects to any MCP server that exposes an HTTP API
 */

class HTTPMCPClient {
  constructor(serverUrl) {
    if (!serverUrl) {
      throw new Error('Server URL is required');
    }

    this.serverUrl = serverUrl.replace(/\/$/, ''); // Remove trailing slash
    this.serverInfo = null;

    this.server = new Server(
      {
        name: 'http-mcp-client',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();

    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.serverUrl}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      const data = await response.json();
      this.serverInfo = data;
      return true;
    } catch (error) {
      console.error(`❌ Failed to connect to ${this.serverUrl}`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Make sure the server is running and accessible.`);
      return false;
    }
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search_knowledge',
          description: 'Search the knowledge base for documents matching your query. Returns a list of relevant documents with summaries.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query (e.g., "installation", "troubleshooting")',
              },
              category: {
                type: 'string',
                description: 'Optional: Filter by category',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results (default: 10)',
                default: 10,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_document',
          description: 'Get the complete content of a specific document by its ID (obtained from search_knowledge)',
          inputSchema: {
            type: 'object',
            properties: {
              document_id: {
                type: 'string',
                description: 'Document ID from search results',
              },
            },
            required: ['document_id'],
          },
        },
        {
          name: 'list_categories',
          description: 'List all available categories in the knowledge base with document counts',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'search_knowledge':
            return await this.searchKnowledge(request.params.arguments);
          case 'get_document':
            return await this.getDocument(request.params.arguments);
          case 'list_categories':
            return await this.listCategories();
          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async searchKnowledge(args) {
    const { query, category, limit = 10 } = args;

    const params = new URLSearchParams({ query, limit: limit.toString() });
    if (category) {
      params.set('category', category);
    }

    const response = await fetch(`${this.serverUrl}/api/search?${params}`);

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No results found for: "${query}"\n\nTry:\n- Using different keywords\n- Broadening your search\n- Using list_categories to see available content`,
          },
        ],
      };
    }

    // Format results
    let text = `🔍 Found ${data.results.length} results for: "${query}"\n\n`;

    data.results.forEach((doc, i) => {
      text += `${i + 1}. **${doc.title}**\n`;
      text += `   📁 ${doc.category}${doc.subcategory ? ` > ${doc.subcategory}` : ''}\n`;
      text += `   📄 ID: \`${doc.id}\`\n`;
      if (doc.summary) {
        const summary = doc.summary.substring(0, 150);
        text += `   📝 ${summary}${doc.summary.length > 150 ? '...' : ''}\n`;
      }
      text += `\n`;
    });

    text += `\n💡 Use get_document with the ID to see full content.`;

    return {
      content: [
        {
          type: 'text',
          text,
        },
      ],
    };
  }

  async getDocument(args) {
    const { document_id } = args;

    const response = await fetch(
      `${this.serverUrl}/api/document?id=${encodeURIComponent(document_id)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Document not found: ${document_id}`);
      }
      throw new Error(`Failed to get document: ${response.status} ${response.statusText}`);
    }

    const doc = await response.json();

    let text = `# ${doc.title}\n\n`;
    text += `**Category:** ${doc.category}`;
    if (doc.subcategory) {
      text += ` > ${doc.subcategory}`;
    }
    text += `\n`;
    if (doc.type) {
      text += `**Type:** ${doc.type}\n`;
    }
    if (doc.url) {
      text += `**URL:** ${doc.url}\n`;
    }
    text += `\n---\n\n`;
    text += doc.content || 'No content available';

    return {
      content: [
        {
          type: 'text',
          text,
        },
      ],
    };
  }

  async listCategories() {
    const response = await fetch(`${this.serverUrl}/api/categories`);

    if (!response.ok) {
      throw new Error(`Failed to list categories: ${response.status}`);
    }

    const data = await response.json();

    let text = `# 📚 Knowledge Base Categories\n\n`;
    text += `**Total Documents:** ${data.totalDocuments}\n`;
    if (data.generatedAt) {
      text += `**Last Updated:** ${new Date(data.generatedAt).toLocaleString()}\n`;
    }
    text += `\n---\n\n`;

    Object.entries(data.categories).forEach(([catName, catData]) => {
      text += `## 📁 ${catName}\n`;
      text += `**Documents:** ${catData.count}\n\n`;

      if (catData.subcategories && Object.keys(catData.subcategories).length > 0) {
        text += `**Subcategories:**\n`;
        Object.entries(catData.subcategories).forEach(([subName, subData]) => {
          text += `  - ${subName} (${subData.count} docs)\n`;
        });
        text += `\n`;
      }
    });

    text += `\n💡 Use search_knowledge to find specific documents.`;

    return {
      content: [
        {
          type: 'text',
          text,
        },
      ],
    };
  }

  async run() {
    // Test connection first
    console.error(`🔌 Connecting to ${this.serverUrl}...`);
    const connected = await this.testConnection();

    if (!connected) {
      process.exit(1);
    }

    console.error(`✅ Connected to ${this.serverInfo.service || 'MCP Server'}`);
    if (this.serverInfo.documents) {
      console.error(`   📄 ${this.serverInfo.documents} documents available`);
    }
    console.error(``);

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

// Support both positional and --url flag
let serverUrl;
if (args[0] === '--url' || args[0] === '-u') {
  serverUrl = args[1];
} else if (args[0] && !args[0].startsWith('-')) {
  serverUrl = args[0];
} else {
  serverUrl = process.env.MCP_SERVER_URL;
}

if (!serverUrl) {
  console.error(`
❌ Error: Server URL is required

Usage:
  mcp-http-client <server-url>
  mcp-http-client --url <server-url>

Examples:
  mcp-http-client https://your-mcp-server.example.com
  mcp-http-client https://api.example.com

Environment Variable:
  export MCP_SERVER_URL=https://your-mcp-server.example.com
  mcp-http-client

Claude Desktop Configuration:
  {
    "mcpServers": {
      "knowledge-base": {
        "command": "npx",
        "args": ["-y", "mcp-http-client", "https://your-mcp-server.example.com"]
      }
    }
  }
`);
  process.exit(1);
}

// Start the client
const client = new HTTPMCPClient(serverUrl);
client.run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
