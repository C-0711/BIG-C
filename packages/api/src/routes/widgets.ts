/**
 * Widget API Routes
 * 0711-C-Intelligence
 */

import { Router, Request, Response } from 'express';
import { MCPConnector } from '../services/mcp-connector';
import type { WidgetConfig, WidgetDataResponse, DashboardConfig } from '../types/widget';

const router = Router();

// Simple in-memory cache
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

// Helper: Get config
const getConfig = (req: Request) => {
  return (req as any).config || {};
};

// Helper: Parse refresh interval to ms
const parseInterval = (interval: string): number => {
  const match = interval.match(/^(\d+)(s|m|h)$/);
  if (!match) return 60000; // default 1 minute
  const value = parseInt(match[1]);
  switch (match[2]) {
    case 's': return value * 1000;
    case 'm': return value * 60000;
    case 'h': return value * 3600000;
    default: return 60000;
  }
};

// Helper: Execute MCP tool and get data
const fetchWidgetData = async (
  widget: WidgetConfig,
  config: any
): Promise<WidgetDataResponse> => {
  const dsConfig = config.dataSources?.providers?.[widget.dataSource];
  
  if (!dsConfig || dsConfig.type !== 'mcp') {
    return { success: false, error: 'Data source not found or not MCP type' };
  }

  const cacheKey = `${widget.id}:${JSON.stringify(widget.args)}`;
  const cached = dataCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      success: true,
      data: cached.data,
      cachedAt: new Date(cached.timestamp).toISOString(),
      refreshIn: Math.ceil((CACHE_TTL - (Date.now() - cached.timestamp)) / 1000)
    };
  }

  const connector = new MCPConnector({
    command: dsConfig.command,
    args: dsConfig.args || [],
    cwd: dsConfig.cwd,
    env: dsConfig.env,
  });

  try {
    await connector.connect(10000);
    const result = await connector.callTool(widget.tool, widget.args || {});
    connector.dispose();

    // Parse content if it's MCP format
    let data = result;
    if (result?.content?.[0]?.text) {
      try {
        data = JSON.parse(result.content[0].text);
      } catch {
        data = result.content[0].text;
      }
    }

    // Cache the result
    dataCache.set(cacheKey, { data, timestamp: Date.now() });

    return {
      success: true,
      data,
      refreshIn: Math.ceil(CACHE_TTL / 1000)
    };
  } catch (error: any) {
    connector.dispose();
    return { success: false, error: error.message };
  }
};

// ========================================
// PUBLIC ROUTES (User Frontend)
// ========================================

// GET /api/widgets - List published widgets
router.get('/', (req: Request, res: Response) => {
  const config = getConfig(req);
  const widgets = config.widgets || {};
  
  const published = Object.entries(widgets)
    .filter(([_, w]: [string, any]) => w.published)
    .map(([id, w]: [string, any]) => ({ id, ...w }));
  
  res.json({ success: true, widgets: published });
});

// GET /api/widgets/:id - Get widget config
router.get('/:id', (req: Request, res: Response) => {
  const config = getConfig(req);
  const widget = config.widgets?.[req.params.id];
  
  if (!widget) {
    return res.status(404).json({ error: 'Widget not found' });
  }
  
  if (!widget.published && !(req as any).isAdmin) {
    return res.status(403).json({ error: 'Widget not published' });
  }
  
  res.json({ success: true, widget: { id: req.params.id, ...widget } });
});

// GET /api/widgets/:id/data - Get widget data from MCP
router.get('/:id/data', async (req: Request, res: Response) => {
  const config = getConfig(req);
  const widget = config.widgets?.[req.params.id];
  
  if (!widget) {
    return res.status(404).json({ error: 'Widget not found' });
  }
  
  if (!widget.published && !(req as any).isAdmin) {
    return res.status(403).json({ error: 'Widget not published' });
  }

  const response = await fetchWidgetData({ id: req.params.id, ...widget }, config);
  res.json(response);
});

// ========================================
// DASHBOARD ROUTES
// ========================================

// GET /api/dashboards - List published dashboards
router.get('/dashboards', (req: Request, res: Response) => {
  const config = getConfig(req);
  const dashboards = config.dashboards || {};
  
  const published = Object.entries(dashboards)
    .filter(([_, d]: [string, any]) => d.published)
    .map(([id, d]: [string, any]) => ({ id, ...d }));
  
  res.json({ success: true, dashboards: published });
});

// GET /api/dashboards/:id - Get dashboard with widgets
router.get('/dashboards/:id', (req: Request, res: Response) => {
  const config = getConfig(req);
  const dashboard = config.dashboards?.[req.params.id];
  
  if (!dashboard) {
    return res.status(404).json({ error: 'Dashboard not found' });
  }
  
  if (!dashboard.published && !(req as any).isAdmin) {
    return res.status(403).json({ error: 'Dashboard not published' });
  }

  // Get widgets for this dashboard
  const widgets = (dashboard.widgets || [])
    .map((widgetId: string) => {
      const w = config.widgets?.[widgetId];
      return w ? { id: widgetId, ...w } : null;
    })
    .filter(Boolean);
  
  res.json({ 
    success: true, 
    dashboard: { id: req.params.id, ...dashboard },
    widgets 
  });
});

// ========================================
// ADMIN ROUTES
// ========================================

// POST /api/admin/widgets - Create widget
router.post('/admin', (req: Request, res: Response) => {
  const { id, ...widgetConfig } = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'Widget ID required' });
  }

  // Will be handled by config update
  res.json({ 
    success: true, 
    message: 'Use PATCH /api/config to update widgets',
    widget: { id, ...widgetConfig }
  });
});

// POST /api/admin/widgets/:id/preview - Preview widget with data
router.post('/admin/:id/preview', async (req: Request, res: Response) => {
  const config = getConfig(req);
  const widgetConfig = req.body;
  
  // Use provided config or existing
  const widget = widgetConfig.tool ? widgetConfig : config.widgets?.[req.params.id];
  
  if (!widget) {
    return res.status(404).json({ error: 'Widget config required' });
  }

  const response = await fetchWidgetData({ id: req.params.id, ...widget }, config);
  res.json(response);
});

// POST /api/admin/widgets/:id/test-tool - Test MCP tool directly
router.post('/admin/:id/test-tool', async (req: Request, res: Response) => {
  const config = getConfig(req);
  const { dataSource, tool, args } = req.body;
  
  const dsConfig = config.dataSources?.providers?.[dataSource];
  
  if (!dsConfig || dsConfig.type !== 'mcp') {
    return res.status(404).json({ error: 'MCP data source not found' });
  }

  const connector = new MCPConnector({
    command: dsConfig.command,
    args: dsConfig.args || [],
    cwd: dsConfig.cwd,
    env: dsConfig.env,
  });

  try {
    await connector.connect(10000);
    const result = await connector.callTool(tool, args || {});
    connector.dispose();
    res.json({ success: true, result });
  } catch (error: any) {
    connector.dispose();
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
