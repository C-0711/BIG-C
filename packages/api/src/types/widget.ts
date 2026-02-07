/**
 * Widget System Types
 * 0711-C-Intelligence
 */

// Widget Types
export type WidgetType = 
  | 'stats-card'      // Single metric display
  | 'data-table'      // Table with rows
  | 'chart'           // Line/Bar/Pie charts
  | 'search-box'      // Search input + results
  | 'product-card'    // Product details
  | 'list'            // Simple list
  | 'text'            // Markdown/HTML text
  | 'custom';         // Custom component

// Data Mapping using JSONPath
export interface WidgetDataMapping {
  // For stats-card
  title?: string;
  value?: string;        // JSONPath: "$.total_products"
  subtitle?: string;
  icon?: string;
  trend?: string;        // JSONPath to trend value
  trendDirection?: 'up' | 'down' | 'neutral';
  
  // For data-table
  columns?: WidgetTableColumn[];
  rows?: string;         // JSONPath to array
  
  // For chart
  labels?: string;       // JSONPath to labels array
  datasets?: WidgetChartDataset[];
  
  // For search-box
  resultsPath?: string;  // JSONPath to results array
  displayFields?: string[];
  
  // For product-card
  imagePath?: string;
  titlePath?: string;
  descriptionPath?: string;
  pricePath?: string;
  
  // For list
  items?: string;        // JSONPath to array
  itemTemplate?: string; // Template string with {{field}}
}

export interface WidgetTableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'link';
  sortable?: boolean;
  width?: string;
}

export interface WidgetChartDataset {
  label: string;
  dataPath: string;      // JSONPath to data array
  color?: string;
  type?: 'line' | 'bar' | 'pie';
}

// Widget Refresh Configuration
export interface WidgetRefresh {
  enabled: boolean;
  interval: string;      // "30s", "5m", "1h"
  onFocus?: boolean;     // Refresh when tab becomes visible
}

// Widget Permissions
export interface WidgetPermissions {
  roles?: string[];      // ["admin", "viewer"]
  users?: string[];      // Specific user IDs
  public?: boolean;      // Available to all
}

// Position in Dashboard
export interface WidgetPosition {
  dashboard: string;     // Dashboard ID
  order: number;
  width?: 1 | 2 | 3 | 4; // Grid columns (1-4)
  height?: 1 | 2;        // Grid rows
}

// Main Widget Configuration
export interface WidgetConfig {
  id: string;
  name: string;
  description?: string;
  type: WidgetType;
  
  // Data Source
  dataSource: string;    // MCP datasource ID
  tool: string;          // MCP tool name
  args?: Record<string, any>;  // Tool arguments
  
  // Data Mapping
  mapping: WidgetDataMapping;
  
  // Behavior
  refresh?: WidgetRefresh;
  clickAction?: 'none' | 'expand' | 'navigate' | 'modal';
  clickTarget?: string;  // URL or modal ID
  
  // Display
  position?: WidgetPosition;
  style?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    padding?: string;
  };
  
  // State
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Widget Data Response
export interface WidgetDataResponse {
  success: boolean;
  data?: any;
  error?: string;
  cachedAt?: string;
  refreshIn?: number;    // Seconds until next refresh
}

// Dashboard Configuration
export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  widgets: string[];     // Widget IDs in order
  layout?: 'grid' | 'list' | 'masonry';
  columns?: number;      // Grid columns (default 4)
  published: boolean;
  isDefault?: boolean;
  permissions?: WidgetPermissions;
}

// Config Extension for widgets
export interface WidgetsConfig {
  widgets: Record<string, WidgetConfig>;
  dashboards: Record<string, DashboardConfig>;
}
