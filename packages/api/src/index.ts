import JSON5 from "json5";
import express from "express";
import { MCPConnector } from "./services/mcp-connector";
import cors from "cors";
import fs from "fs";
import path from "path";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

const app = express();
const PORT = process.env.PORT || 7075;
const CONFIG_PATH = process.env.CONFIG_PATH || path.join(process.env.HOME || "~", ".0711", "config.json");

const resolveConfigPath = (p: string) => {
  if (p.startsWith("~")) {
    return path.join(process.env.HOME || "", p.slice(1));
  }
  return p;
};

const configPath = resolveConfigPath(CONFIG_PATH);

// Helper to read config
const readConfig = () => {
  try {
    return JSON5.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (err) {
    console.error("Failed to read config:", err);
    return null;
  }
};

// Helper to write config
const writeConfig = (config: any) => {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
};

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Static files
app.use("/admin", express.static(path.join(__dirname, "../../admin/dist")));
app.use("/app", express.static(path.join(__dirname, "../../ui/dist")));

// ========================================
// CONFIG API
// ========================================

app.get("/api/config", (req, res) => {
  const config = readConfig();
  if (!config) return res.status(500).json({ error: "Failed to read config" });
  res.json(config);
});

app.put("/api/config", (req, res) => {
  try {
    writeConfig(req.body);
    broadcast("config.changed", { config: req.body });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/config", (req, res) => {
  try {
    const config = readConfig();
    const merged = { ...config, ...req.body };
    writeConfig(merged);
    broadcast("config.changed", { config: merged });
    res.json({ success: true, config: merged });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// AGENTS API
// ========================================

app.get("/api/agents", (req, res) => {
  const config = readConfig();
  res.json(config?.agents?.list || []);
});

app.post("/api/agents", (req, res) => {
  try {
    const config = readConfig();
    if (!config.agents) config.agents = { list: [] };
    config.agents.list.push(req.body);
    writeConfig(config);
    broadcast("config.changed", { config });
    res.json({ success: true, agent: req.body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/agents/:id", (req, res) => {
  try {
    const config = readConfig();
    const idx = config.agents?.list?.findIndex((a: any) => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Agent not found" });
    config.agents.list[idx] = { ...config.agents.list[idx], ...req.body };
    writeConfig(config);
    broadcast("config.changed", { config });
    res.json({ success: true, agent: config.agents.list[idx] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/agents/:id", (req, res) => {
  try {
    const config = readConfig();
    config.agents.list = config.agents.list.filter((a: any) => a.id !== req.params.id);
    writeConfig(config);
    broadcast("config.changed", { config });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// WORKFLOWS API
// ========================================

app.get("/api/workflows", (req, res) => {
  const config = readConfig();
  res.json(config?.workflows?.list || []);
});

app.post("/api/workflows/:id/run", (req, res) => {
  res.json({ success: true, message: `Workflow ${req.params.id} triggered` });
});

// ========================================
// DATA SOURCES API
// ========================================

app.get("/api/data-sources", (req, res) => {
  const config = readConfig();
  res.json(config?.dataSources?.providers || {});
});

app.post("/api/data-sources", (req, res) => {
  try {
    const config = readConfig();
    if (!config.dataSources) config.dataSources = { providers: {} };
    const { id, ...data } = req.body;
    config.dataSources.providers[id] = data;
    writeConfig(config);
    broadcast("config.changed", { config });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/data-sources/:id", (req, res) => {
  try {
    const config = readConfig();
    delete config.dataSources.providers[req.params.id];
    writeConfig(config);
    broadcast("config.changed", { config });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// OUTPUTS API
// ========================================

app.get("/api/outputs", (req, res) => {
  const config = readConfig();
  res.json(config?.outputs?.providers || {});
});

app.post("/api/outputs", (req, res) => {
  try {
    const config = readConfig();
    if (!config.outputs) config.outputs = { providers: {} };
    const { id, ...data } = req.body;
    config.outputs.providers[id] = data;
    writeConfig(config);
    broadcast("config.changed", { config });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// SKILLS API
// ========================================

app.get("/api/skills", (req, res) => {
  const config = readConfig();
  res.json({
    bundled: config?.skills?.bundled || [],
    workspace: config?.skills?.workspace || "~/.0711/workspace/skills/"
  });

app.put("/api/skills/:id", (req, res) => {
  try {
    const config = readConfig();
    if (!config) return res.status(500).json({ error: "Config not found" });
    const { id } = req.params;
    const skillData = req.body;
    if (!config.skills) config.skills = { bundled: [], definitions: {} };
    if (!config.skills.definitions) config.skills.definitions = {};
    config.skills.definitions[id] = {
      name: skillData.name,
      description: skillData.description,
      prompt: skillData.prompt,
      tools: skillData.tools || []
    };
    writeConfig(config);
    broadcast("config.changed", { config });
    res.json({ success: true, skill: config.skills.definitions[id] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
});

// ========================================
// HEALTH
// ========================================

app.get("/api/health", (req, res) => {
  const config = readConfig();
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    configPath,
    configExists: fs.existsSync(configPath),
    agents: config?.agents?.list?.length || 0,
    workflows: config?.workflows?.list?.length || 0
  });
});

// SPA fallbacks
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../admin/dist/index.html"));
});

app.get("/app/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../ui/dist/index.html"));
});

app.get("/", (req, res) => {
  res.redirect("/app");
});

// ========================================
// HTTP + WEBSOCKET SERVER
// ========================================

const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

// Broadcast to all connected clients
function broadcast(type: string, data: any) {
  const message = JSON.stringify({ type, ...data });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on("connection", (ws) => {
  console.log("[WS] Client connected");

  // Send initial config
  const config = readConfig();
  if (config) {
    ws.send(JSON.stringify({ type: "config.init", config }));
  }

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      console.log("[WS] Received:", msg.type);
      
      if (msg.type === "config.patch") {
        const config = readConfig();
        const merged = { ...config, ...msg.data };
        writeConfig(merged);
        broadcast("config.changed", { config: merged });
      }
    } catch (err) {
      console.error("[WS] Message error:", err);
    }
  });

  ws.on("close", () => {
    console.log("[WS] Client disconnected");
  });
});


// ========================================
// MCP API
// ========================================

app.post("/api/mcp/:id/test", async (req, res) => {
  const { id } = req.params;
  const config = readConfig();
  const dsConfig = config?.dataSources?.providers?.[id];
  if (!dsConfig || dsConfig.type !== "mcp") {
    return res.status(404).json({ error: "MCP datasource not found" });
  }
  try {
    const connector = new MCPConnector(dsConfig.command, dsConfig.args || []);
    connector.on("exit", () => {});
    setTimeout(() => connector.dispose(), 5000);
    res.json({ success: true, message: "MCP server started successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/mcp/:id/discover", async (req, res) => {
  const { id } = req.params;
  const config = readConfig();
  const dsConfig = config?.dataSources?.providers?.[id];
  if (!dsConfig || dsConfig.type !== "mcp") {
    return res.status(404).json({ error: "MCP datasource not found" });
  }
  try {
    const connector = new MCPConnector(dsConfig.command, dsConfig.args || []);
    const tools = await connector.sendRequest("tools/list");
    connector.dispose();
    res.json({ success: true, tools });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/mcp/:id/call", async (req, res) => {
  const { id } = req.params;
  const { tool, args } = req.body;
  const config = readConfig();
  const dsConfig = config?.dataSources?.providers?.[id];
  if (!dsConfig || dsConfig.type !== "mcp") {
    return res.status(404).json({ error: "MCP datasource not found" });
  }
  try {
    const connector = new MCPConnector(dsConfig.command, dsConfig.args || []);
    const result = await connector.sendRequest("tools/call", { name: tool, arguments: args });
    connector.dispose();
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
server.listen(PORT, () => {
  console.log(`🚀 0711-C-Intelligence Gateway running on port ${PORT}`);
  console.log(`📁 Config: ${configPath}`);
  console.log(`🔧 Admin UI: http://localhost:${PORT}/admin`);
  console.log(`📱 User UI: http://localhost:${PORT}/app`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
});
