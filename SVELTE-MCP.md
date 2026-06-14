# Svelte MCP Server

MCP server for comprehensive Svelte 5 and SvelteKit documentation. Automatically available when working on Svelte projects.

## Available Tools

### 1. list-sections

Use first to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.

When asked about Svelte or SvelteKit topics, always use this tool at the start to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.

After calling list-sections, analyze the returned sections (especially use_cases) and fetch ALL relevant sections for the task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.

Must use this tool whenever writing Svelte code before sending it to the user. Keep calling until no issues remain.

### 4. playground-link

Generates a Svelte Playground link with provided code.

After completing code, ask the user if they want a playground link. Only call after user confirmation and never if code was written to project files.

## Setup

- Local: `npx -y @sveltejs/mcp`
- Remote: `https://mcp.svelte.dev/mcp`
