// Bosch Intelligence Configuration
const instanceConfig = {
  branding: {
    name: "Bosch Intelligence",
    fullName: "Bosch Intelligence Platform",
    tagline: "AI-Powered Product Intelligence",
    logo: "/assets/bosch-logo.png",
    favicon: "/favicon-bosch.ico",
    primaryColor: "#0066CC",
    secondaryColor: "#004C99",
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
    baseUrl: 'http://192.168.145.10:8766/api',
  },
  features: {
    darkMode: true,
    commandPalette: true,
    quickAccess: true,
    userProfile: true,
  },
};
export default instanceConfig;
