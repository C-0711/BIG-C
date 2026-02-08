/**
 * WidgetWizard - Orchestrates the widget creation wizard
 * Sprint 5.1 - Widget Wizard
 */

import { MCPClient, MCPToolSchema } from '../mcp/MCPClient';
import { ClaudeClient } from '../claude/ClaudeClient';
import { ToolAnalyzer, WidgetSuggestion, ToolAnalysis } from '../claude/ToolAnalyzer';
import { WidgetConfig } from '../widgets/WidgetConfig';
import { WidgetCreator, WidgetTemplate } from '../admin/WidgetCreator';
import { EventBus } from '../events/EventBus';
import {
  WizardState,
  WizardAction,
  WizardStep,
  createInitialState,
  wizardReducer,
  canProceed,
} from './WizardState';

export interface WidgetWizardConfig {
  mcpClient: MCPClient;
  claudeClient: ClaudeClient;
  widgetCreator?: WidgetCreator;
}

export class WidgetWizard {
  private mcpClient: MCPClient;
  private claudeClient: ClaudeClient;
  private toolAnalyzer: ToolAnalyzer;
  private widgetCreator: WidgetCreator;
  private state: WizardState;
  private tools: MCPToolSchema[] = [];
  private analysis: ToolAnalysis | null = null;
  private listeners: Set<(state: WizardState) => void> = new Set();

  constructor(config: WidgetWizardConfig) {
    this.mcpClient = config.mcpClient;
    this.claudeClient = config.claudeClient;
    this.toolAnalyzer = new ToolAnalyzer(config.claudeClient);
    this.widgetCreator = config.widgetCreator || new WidgetCreator();
    this.state = createInitialState();
  }

  /**
   * Initialize the wizard - load tools and analyze
   */
  async initialize(): Promise<void> {
    this.dispatch({ type: 'SET_LOADING', loading: true });
    
    try {
      // Load MCP tools
      this.tools = await this.mcpClient.listTools();
      
      // Analyze tools with Claude
      this.analysis = await this.toolAnalyzer.analyzeTools(this.tools);
      
      // Set categories
      this.dispatch({ type: 'SET_CATEGORIES', categories: this.analysis.categories });
      
      EventBus.emit('wizard.initialized', {
        toolCount: this.tools.length,
        categoryCount: this.analysis.categories.length,
      });
    } catch (error) {
      this.dispatch({ 
        type: 'SET_ERROR', 
        error: error instanceof Error ? error.message : 'Failed to initialize wizard' 
      });
    } finally {
      this.dispatch({ type: 'SET_LOADING', loading: false });
    }
  }

  /**
   * Get current state
   */
  getState(): WizardState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: WizardState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Dispatch an action
   */
  dispatch(action: WizardAction): void {
    this.state = wizardReducer(this.state, action);
    this.notifyListeners();
  }

  /**
   * Select a category
   */
  selectCategory(category: string): void {
    this.dispatch({ type: 'SELECT_CATEGORY', category });
  }

  /**
   * Deselect a category
   */
  deselectCategory(category: string): void {
    this.dispatch({ type: 'DESELECT_CATEGORY', category });
  }

  /**
   * Toggle category selection
   */
  toggleCategory(category: string): void {
    if (this.state.selectedCategories.includes(category)) {
      this.deselectCategory(category);
    } else {
      this.selectCategory(category);
    }
  }

  /**
   * Select a widget
   */
  selectWidget(widgetType: string): void {
    this.dispatch({ type: 'SELECT_WIDGET', widgetType });
  }

  /**
   * Deselect a widget
   */
  deselectWidget(widgetType: string): void {
    this.dispatch({ type: 'DESELECT_WIDGET', widgetType });
  }

  /**
   * Toggle widget selection
   */
  toggleWidget(widgetType: string): void {
    if (this.state.selectedWidgets.includes(widgetType)) {
      this.deselectWidget(widgetType);
    } else {
      this.selectWidget(widgetType);
    }
  }

  /**
   * Set widget configuration
   */
  setConfiguration(widgetType: string, config: WidgetConfig): void {
    this.dispatch({ type: 'SET_CONFIGURATION', widgetType, config });
  }

  /**
   * Set preview widget
   */
  setPreviewWidget(widgetType: string | null): void {
    this.dispatch({ type: 'SET_PREVIEW_WIDGET', widgetType });
  }

  /**
   * Go to next step
   */
  async nextStep(): Promise<void> {
    if (!canProceed(this.state)) {
      return;
    }

    const currentStep = this.state.step;

    // Handle step transitions
    if (currentStep === 'category-selection') {
      await this.loadWidgetSuggestions();
    } else if (currentStep === 'widget-suggestions') {
      await this.generateConfigurations();
    } else if (currentStep === 'widget-configuration') {
      // Move to preview
    } else if (currentStep === 'preview') {
      await this.createWidgets();
    }

    this.dispatch({ type: 'NEXT_STEP' });
  }

  /**
   * Go to previous step
   */
  prevStep(): void {
    this.dispatch({ type: 'PREV_STEP' });
  }

  /**
   * Go to specific step
   */
  goToStep(step: WizardStep): void {
    this.dispatch({ type: 'GO_TO_STEP', step });
  }

  /**
   * Reset wizard
   */
  reset(): void {
    this.dispatch({ type: 'RESET' });
    this.analysis = null;
  }

  /**
   * Load widget suggestions based on selected categories
   */
  private async loadWidgetSuggestions(): Promise<void> {
    this.dispatch({ type: 'SET_LOADING', loading: true });
    
    try {
      // Filter tools by selected categories
      const selectedTools = this.tools.filter(tool => {
        const category = this.analysis?.categories.find(c => c.tools.includes(tool.name));
        return category && this.state.selectedCategories.includes(category.name);
      });

      // Get widget suggestions from Claude
      const suggestions = await this.toolAnalyzer.suggestWidgets(selectedTools);
      
      this.dispatch({ type: 'SET_WIDGET_SUGGESTIONS', suggestions });
      
      EventBus.emit('wizard.suggestions.loaded', {
        count: suggestions.length,
      });
    } catch (error) {
      this.dispatch({ 
        type: 'SET_ERROR', 
        error: error instanceof Error ? error.message : 'Failed to load suggestions' 
      });
    } finally {
      this.dispatch({ type: 'SET_LOADING', loading: false });
    }
  }

  /**
   * Generate configurations for selected widgets
   */
  private async generateConfigurations(): Promise<void> {
    this.dispatch({ type: 'SET_LOADING', loading: true });
    
    try {
      for (const widgetType of this.state.selectedWidgets) {
        const suggestion = this.state.widgetSuggestions.find(s => s.type === widgetType);
        if (!suggestion) continue;

        // Get configuration suggestions from Claude
        const configSuggestion = await this.toolAnalyzer.suggestWidgetConfig(
          widgetType,
          this.tools,
          `Widget: ${suggestion.name}\nDescription: ${suggestion.description}`
        );

        const config: WidgetConfig = {
          type: widgetType,
          id: `${widgetType}-${Date.now()}`,
          title: suggestion.name,
          settings: configSuggestion as Record<string, unknown>,
          subscriptions: suggestion.events.subscribes,
        };

        this.dispatch({ type: 'SET_CONFIGURATION', widgetType, config });
      }
    } catch (error) {
      this.dispatch({ 
        type: 'SET_ERROR', 
        error: error instanceof Error ? error.message : 'Failed to generate configurations' 
      });
    } finally {
      this.dispatch({ type: 'SET_LOADING', loading: false });
    }
  }

  /**
   * Create the configured widgets
   */
  private async createWidgets(): Promise<void> {
    for (const widgetType of this.state.selectedWidgets) {
      const config = this.state.configurations.get(widgetType);
      if (!config) continue;

      const result = this.widgetCreator.createCustom(config);
      if (result.success && result.widget) {
        this.dispatch({ type: 'ADD_CREATED_WIDGET', widget: result.widget });
      }
    }

    EventBus.emit('wizard.complete', {
      widgetCount: this.state.createdWidgets.length,
    });
  }

  /**
   * Get created widgets
   */
  getCreatedWidgets(): WidgetConfig[] {
    return [...this.state.createdWidgets];
  }

  /**
   * Get tool analysis
   */
  getAnalysis(): ToolAnalysis | null {
    return this.analysis;
  }

  /**
   * Get all tools
   */
  getTools(): MCPToolSchema[] {
    return [...this.tools];
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
