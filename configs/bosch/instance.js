// Bosch Intelligence Configuration
// Used by the UI ConfigProvider for runtime branding
const instanceConfig = {
  branding: {
    name: "Bosch Intelligence",
    fullName: "Bosch Product Intelligence",
    tagline: "AI-Powered Product Intelligence",
    logo: "/assets/bosch-logo.svg",
    favicon: "/assets/bosch-favicon.ico",
    primaryColor: "#E20015",
    secondaryColor: "#005691",
    accentColor: "#00A651",
  },
  modules: {
    assistant: true,
    dashboard: true,
    skills: true,
    knowledgeBase: true,
    automation: true,
    integrations: true,
    publishing: true,
    gallery: true,
    reports: true,
    product: true,
    analytics: true,
    intelligence: true,
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
