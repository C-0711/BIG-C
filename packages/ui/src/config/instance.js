// 0711-C-Intelligence Instance Configuration
// Edit this file to customize your instance

const instanceConfig = {
  // Branding
  branding: {
    name: "Intelligence",                    // Main name
    fullName: "0711-C Intelligence",         // Full display name
    tagline: "AI-Powered Data Intelligence", // Subtitle
    logo: null,                              // Path to logo (null = use default)
    favicon: "/favicon.ico",
    primaryColor: "#3B82F6",                 // Blue
    secondaryColor: "#1E40AF",
  },

  // Modules - enable/disable sidebar sections
  modules: {
    assistant: true,
    dashboard: true,
    // Core
    skills: true,
    knowledgeBase: true,
    automation: true,
    workspaces: true,
    // Data
    integrations: true,       // Data Sources
    publishing: true,
    gallery: true,
    reports: true,
    // Business
    marketing: true,
    product: true,
    analytics: true,
    intelligence: true,
    productPass: true,
    service: true,
    // Settings
    settings: true,
  },

  // API Configuration
  api: {
    baseUrl: '/api',          // API base URL
    timeout: 30000,           // Request timeout (ms)
  },

  // Features
  features: {
    darkMode: true,
    commandPalette: true,
    quickAccess: true,
    userProfile: true,
  },
};

export default instanceConfig;
