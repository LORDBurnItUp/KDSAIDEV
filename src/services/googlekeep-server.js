#!/usr/bin/env node

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

// We import the user's google keep service
const keep = require("./googlekeep.js");

// Make sure to load environment variables from the root folder
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const server = new Server(
  {
    name: "google-keep-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "keep_list_notes",
        description: "List all notes from Google Keep",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "keep_search_notes",
        description: "Search Google Keep notes by query text",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The text to search for within titles and bodies of the notes",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "keep_create_note",
        description: "Create a new note in Google Keep",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The title of the new note",
            },
            body: {
              type: "string",
              description: "The body content of the note",
            },
          },
          required: ["title", "body"],
        },
      },
      {
        name: "keep_delete_note",
        description: "Delete a note from Google Keep by its ID",
        inputSchema: {
          type: "object",
          properties: {
            noteId: {
              type: "string",
              description: "The ID of the note to delete",
            },
          },
          required: ["noteId"],
        },
      },
      {
        name: "keep_dump_all",
        description: "Dump all notes as plain text (useful for memory seeding or full backup)",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "keep_health_check",
        description: "Check if Google Keep OAuth2 works correctly",
        inputSchema: {
          type: "object",
          properties: {},
        },
      }
    ],
  };
});

// Implement tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments } = request.params;
    
    switch (name) {
      case "keep_list_notes": {
        const notes = await keep.listNotes();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(notes, null, 2),
            },
          ],
        };
      }
      
      case "keep_search_notes": {
        const notes = await keep.searchNotes(arguments.query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(notes, null, 2),
            },
          ],
        };
      }
        
      case "keep_create_note": {
        const res = await keep.createNote(arguments.title, arguments.body);
        return {
          content: [{ type: "text", text: `Created Note: ${JSON.stringify(res, null, 2)}` }],
        };
      }
        
      case "keep_delete_note": {
        await keep.deleteNote(arguments.noteId);
        return {
          content: [{ type: "text", text: `Deleted Note: ${arguments.noteId}` }],
        };
      }
        
      case "keep_dump_all": {
        const text = await keep.dumpAllNotes();
        return {
          content: [{ type: "text", text }],
        };
      }
        
      case "keep_health_check": {
        const info = await keep.healthCheck();
        return {
          content: [{ type: "text", text: JSON.stringify(info) }],
        };
      }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing Google Keep tool: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
