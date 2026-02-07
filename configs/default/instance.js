// 0711-C-Intelligence Default Configuration
const instanceConfig = {
  branding: {
    name: "Intelligence",
    fullName: "0711-C Intelligence",
    tagline: "AI-Powered Data Intelligence",
    logo: null,
    favicon: "/favicon.ico",
    primaryColor: "#3B82F6",
    secondaryColor: "#1E40AF",
  },
  modules: {
    assistant: true,
    dashboard: true,
    skills: true,
    knowledgeBase: true,
    automation: true,
    workspaces: true,
    integrations: true,
    publishing: true,
    gallery: true,
    reports: true,
    marketing: true,
    product: true,
    analytics: true,
    intelligence: true,
    productPass: true,
    service: true,
    settings: true,
  },
  api: {
    baseUrl: '/api',
  },
  features: {
    darkMode: true,
    commandPalette: true,
    quickAccess: true,
    userProfile: true,
  },
};
export default instanceConfig;
