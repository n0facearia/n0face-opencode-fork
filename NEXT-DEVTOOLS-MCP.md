# Next.js DevTools MCP Server

A Model Context Protocol server for Next.js development. Provides real-time insight into your Next.js app — server components, client components, layouts, loading states, route segments, and more.

## Configuration

Add to your MCP settings file:

```json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    }
  }
}
```

## Usage

Run this MCP server when working on Next.js projects. It helps debug and inspect:
- Server vs Client component boundaries
- Route segments and layouts
- Loading and error states
- Component rendering patterns
