import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 7712;
const ZERO711_API = process.env.ZERO711_API || 'http://localhost:7711';

app.use(cors());
app.use(express.json());

// Helper to call 0711-C API
async function callAPI(endpoint: string, method = "GET", body?: any): Promise<any> {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);
  
  const response = await fetch(`${ZERO711_API}${endpoint}`, options);
  return response.json();
}

// Load JSON files from directory
function loadJsonFiles(dir: string): any[] {
  const files: any[] = [];
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) return files;
  
  for (const file of fs.readdirSync(dirPath)) {
    if (file.endsWith('.json')) {
      const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
      files.push(JSON.parse(content));
    }
  }
  return files;
}

// Initialize: Register agents and workflows with 0711-C
async function initialize() {
  console.log('🔧 Initializing Bosch 0711-C Integration...\n');
  
  // Check 0711-C health
  try {
    const health = await callAPI('/health');
    console.log(`✅ 0711-C API: ${health.status} (v${health.version})`);
  } catch (e) {
    console.error('❌ Cannot connect to 0711-C API at', ZERO711_API);
    console.error('   Make sure 0711-C is running on port 7711');
    process.exit(1);
  }

  // Register Bosch agents
  console.log('\n📦 Registering Bosch Agents...');
  const agents = loadJsonFiles('agents');
  for (const agent of agents) {
    try {
      const existing = await callAPI('/api/agents');
      const exists = existing.agents?.some((a: any) => a.name === agent.name);
      
      if (!exists) {
        await callAPI('/api/agents', 'POST', agent);
        console.log(`   ✅ ${agent.name}`);
      } else {
        console.log(`   ⏭️  ${agent.name} (already exists)`);
      }
    } catch (e: any) {
      console.log(`   ❌ ${agent.name}: ${e.message}`);
    }
  }

  // Register Bosch workflows
  console.log('\n📦 Registering Bosch Workflows...');
  const workflows = loadJsonFiles('workflows');
  for (const workflow of workflows) {
    try {
      const existing = await callAPI('/api/workflows');
      const exists = existing.workflows?.some((w: any) => w.name === workflow.name);
      
      if (!exists) {
        await callAPI('/api/workflows', 'POST', workflow);
        console.log(`   ✅ ${workflow.name}`);
      } else {
        console.log(`   ⏭️  ${workflow.name} (already exists)`);
      }
    } catch (e: any) {
      console.log(`   ❌ ${workflow.name}: ${e.message}`);
    }
  }

  console.log('\n✅ Initialization complete!\n');
}

// ============================================================================
// PROXY ROUTES - Forward to 0711-C
// ============================================================================

// Health
app.get('/health', async (req, res) => {
  const health = await callAPI('/health');
  res.json({ ...health, integration: 'bosch', port: PORT });
});

// Agents
app.get('/api/agents', async (req, res) => {
  res.json(await callAPI('/api/agents'));
});

app.get('/api/agents/:id', async (req, res) => {
  res.json(await callAPI(`/api/agents/${req.params.id}`));
});

app.post('/api/agents/:id/execute', async (req, res) => {
  res.json(await callAPI(`/api/agents/${req.params.id}/execute`, 'POST', req.body));
});

// Workflows
app.get('/api/workflows', async (req, res) => {
  res.json(await callAPI('/api/workflows'));
});

app.get('/api/workflows/:id', async (req, res) => {
  res.json(await callAPI(`/api/workflows/${req.params.id}`));
});

app.post('/api/workflows/:id/run', async (req, res) => {
  res.json(await callAPI(`/api/workflows/${req.params.id}/run`, 'POST', req.body));
});

app.get('/api/workflows/:id/runs', async (req, res) => {
  res.json(await callAPI(`/api/workflows/${req.params.id}/runs`));
});

// Runs
app.get('/api/runs', async (req, res) => {
  res.json(await callAPI('/api/runs'));
});

app.get('/api/runs/:id', async (req, res) => {
  res.json(await callAPI(`/api/runs/${req.params.id}`));
});

// Skills
app.get('/api/skills', async (req, res) => {
  res.json(await callAPI('/api/skills'));
});

app.post('/api/skills/:id/execute', async (req, res) => {
  res.json(await callAPI(`/api/skills/${req.params.id}/execute`, 'POST', req.body));
});

// Exports
app.get('/api/export-templates', async (req, res) => {
  res.json(await callAPI('/api/export-templates'));
});

app.post('/api/export', async (req, res) => {
  const result = await callAPI('/api/export', 'POST', req.body);
  res.json(result);
});

// ============================================================================
// BOSCH-SPECIFIC CONVENIENCE ENDPOINTS
// ============================================================================

// Generate content for a product
app.post('/api/bosch/generate-content', async (req, res) => {
  const { productId, channels = ['website', 'amazon'], language = 'de' } = req.body;
  
  // Find content generation workflow
  const workflows = await callAPI('/api/workflows');
  const workflow = workflows.workflows?.find((w: any) => w.name === 'Product Content Generation');
  
  if (!workflow) {
    return res.status(404).json({ error: 'Content generation workflow not found' });
  }
  
  const result = await callAPI(`/api/workflows/${workflow.id}/run`, 'POST', {
    triggerData: { productId, channels, language }
  });
  
  res.json(result);
});

// Batch generate content
app.post('/api/bosch/batch-generate', async (req, res) => {
  const { productIds, channels = ['website'], language = 'de' } = req.body;
  
  const workflows = await callAPI('/api/workflows');
  const workflow = workflows.workflows?.find((w: any) => w.name === 'Batch Content Generation');
  
  if (!workflow) {
    return res.status(404).json({ error: 'Batch generation workflow not found' });
  }
  
  const result = await callAPI(`/api/workflows/${workflow.id}/run`, 'POST', {
    triggerData: { productIds, channels, language }
  });
  
  res.json(result);
});

// Run quality report
app.post('/api/bosch/quality-report', async (req, res) => {
  const workflows = await callAPI('/api/workflows');
  const workflow = workflows.workflows?.find((w: any) => w.name === 'Daily Quality Report');
  
  if (!workflow) {
    return res.status(404).json({ error: 'Quality report workflow not found' });
  }
  
  const result = await callAPI(`/api/workflows/${workflow.id}/run`, 'POST', {});
  res.json(result);
});

// Enrich product
app.post('/api/bosch/enrich-product', async (req, res) => {
  const { productId, fieldsToEnrich = ['description', 'features'] } = req.body;
  
  const workflows = await callAPI('/api/workflows');
  const workflow = workflows.workflows?.find((w: any) => w.name === 'Product Enrichment');
  
  if (!workflow) {
    return res.status(404).json({ error: 'Product enrichment workflow not found' });
  }
  
  const result = await callAPI(`/api/workflows/${workflow.id}/run`, 'POST', {
    triggerData: { productId, fieldsToEnrich }
  });
  
  res.json(result);
});

// Chat with product expert
app.post('/api/bosch/ask-expert', async (req, res) => {
  const { question } = req.body;
  
  const agents = await callAPI('/api/agents');
  const expert = agents.agents?.find((a: any) => a.name === 'Bosch Product Expert');
  
  if (!expert) {
    return res.status(404).json({ error: 'Product expert agent not found' });
  }
  
  const result = await callAPI(`/api/agents/${expert.id}/execute`, 'POST', {
    input: question
  });
  
  res.json(result);
});

// Translate text
app.post('/api/bosch/translate', async (req, res) => {
  const { text, targetLanguage = 'en' } = req.body;
  
  const agents = await callAPI('/api/agents');
  const translator = agents.agents?.find((a: any) => a.name === 'Product Translator');
  
  if (!translator) {
    return res.status(404).json({ error: 'Translator agent not found' });
  }
  
  const direction = targetLanguage === 'en' ? 'Deutsch nach Englisch' : 'Englisch nach Deutsch';
  const result = await callAPI(`/api/agents/${translator.id}/execute`, 'POST', {
    input: `Übersetze folgenden Text von ${direction}:\n\n${text}`
  });
  
  res.json(result);
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, async () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🔧 Bosch + 0711-C Integration Service                       ║
║                                                               ║
║   Integration API: http://localhost:${PORT}                    ║
║   0711-C Backend:  ${ZERO711_API}                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
  
  await initialize();
  
  console.log(`
📡 Bosch Endpoints:
   POST /api/bosch/generate-content  - Generate content for product
   POST /api/bosch/batch-generate    - Batch content generation
   POST /api/bosch/quality-report    - Run quality report
   POST /api/bosch/enrich-product    - Enrich product data
   POST /api/bosch/ask-expert        - Ask product expert
   POST /api/bosch/translate         - Translate text

📡 Proxy Endpoints (→ 0711-C):
   GET  /api/agents, /api/workflows, /api/runs, /api/skills
   POST /api/agents/:id/execute
   POST /api/workflows/:id/run
  `);
});
