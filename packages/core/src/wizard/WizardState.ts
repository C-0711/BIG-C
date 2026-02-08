/**
 * WizardState - Widget Wizard state management
 * Sprint 5.1 - Widget Wizard
 */

import { WidgetConfig } from '../widgets/WidgetConfig';
import { WidgetSuggestion, SkillSuggestion, ToolCategory } from '../claude/ToolAnalyzer';

export type WizardStep = 
  | 'category-selection'
  | 'widget-suggestions'
  | 'widget-configuration'
  | 'preview'
  | 'complete';

export interface WizardState {
  /** Current step */
  step: WizardStep;
  /** Available tool categories */
  categories: ToolCategory[];
  /** Selected categories */
  selectedCategories: string[];
  /** Widget suggestions from Claude */
  widgetSuggestions: WidgetSuggestion[];
  /** Selected widgets to create */
  selectedWidgets: string[];
  /** Widget configurations */
  configurations: Map<string, WidgetConfig>;
  /** Preview widget (currently being configured) */
  previewWidget: string | null;
  /** Created widgets */
  createdWidgets: WidgetConfig[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
}

export const WIZARD_STEPS: WizardStep[] = [
  'category-selection',
  'widget-suggestions',
  'widget-configuration',
  'preview',
  'complete',
];

export function createInitialState(): WizardState {
  return {
    step: 'category-selection',
    categories: [],
    selectedCategories: [],
    widgetSuggestions: [],
    selectedWidgets: [],
    configurations: new Map(),
    previewWidget: null,
    createdWidgets: [],
    loading: false,
    error: null,
  };
}

export type WizardAction =
  | { type: 'SET_CATEGORIES'; categories: ToolCategory[] }
  | { type: 'SELECT_CATEGORY'; category: string }
  | { type: 'DESELECT_CATEGORY'; category: string }
  | { type: 'SET_WIDGET_SUGGESTIONS'; suggestions: WidgetSuggestion[] }
  | { type: 'SELECT_WIDGET'; widgetType: string }
  | { type: 'DESELECT_WIDGET'; widgetType: string }
  | { type: 'SET_CONFIGURATION'; widgetType: string; config: WidgetConfig }
  | { type: 'SET_PREVIEW_WIDGET'; widgetType: string | null }
  | { type: 'ADD_CREATED_WIDGET'; widget: WidgetConfig }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; step: WizardStep }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET' };

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_CATEGORIES':
      return { ...state, categories: action.categories };

    case 'SELECT_CATEGORY':
      return {
        ...state,
        selectedCategories: [...state.selectedCategories, action.category],
      };

    case 'DESELECT_CATEGORY':
      return {
        ...state,
        selectedCategories: state.selectedCategories.filter(c => c !== action.category),
      };

    case 'SET_WIDGET_SUGGESTIONS':
      return { ...state, widgetSuggestions: action.suggestions };

    case 'SELECT_WIDGET':
      return {
        ...state,
        selectedWidgets: [...state.selectedWidgets, action.widgetType],
      };

    case 'DESELECT_WIDGET':
      return {
        ...state,
        selectedWidgets: state.selectedWidgets.filter(w => w !== action.widgetType),
      };

    case 'SET_CONFIGURATION': {
      const newConfigs = new Map(state.configurations);
      newConfigs.set(action.widgetType, action.config);
      return { ...state, configurations: newConfigs };
    }

    case 'SET_PREVIEW_WIDGET':
      return { ...state, previewWidget: action.widgetType };

    case 'ADD_CREATED_WIDGET':
      return {
        ...state,
        createdWidgets: [...state.createdWidgets, action.widget],
      };

    case 'NEXT_STEP': {
      const currentIndex = WIZARD_STEPS.indexOf(state.step);
      if (currentIndex < WIZARD_STEPS.length - 1) {
        return { ...state, step: WIZARD_STEPS[currentIndex + 1] };
      }
      return state;
    }

    case 'PREV_STEP': {
      const currentIndex = WIZARD_STEPS.indexOf(state.step);
      if (currentIndex > 0) {
        return { ...state, step: WIZARD_STEPS[currentIndex - 1] };
      }
      return state;
    }

    case 'GO_TO_STEP':
      return { ...state, step: action.step };

    case 'SET_LOADING':
      return { ...state, loading: action.loading };

    case 'SET_ERROR':
      return { ...state, error: action.error };

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}

/**
 * Check if can proceed to next step
 */
export function canProceed(state: WizardState): boolean {
  switch (state.step) {
    case 'category-selection':
      return state.selectedCategories.length > 0;
    case 'widget-suggestions':
      return state.selectedWidgets.length > 0;
    case 'widget-configuration':
      return state.selectedWidgets.every(w => state.configurations.has(w));
    case 'preview':
      return true;
    case 'complete':
      return false;
    default:
      return false;
  }
}

/**
 * Get step progress percentage
 */
export function getProgress(state: WizardState): number {
  const currentIndex = WIZARD_STEPS.indexOf(state.step);
  return ((currentIndex + 1) / WIZARD_STEPS.length) * 100;
}

/**
 * Get step label
 */
export function getStepLabel(step: WizardStep): string {
  const labels: Record<WizardStep, string> = {
    'category-selection': 'Select Categories',
    'widget-suggestions': 'Choose Widgets',
    'widget-configuration': 'Configure',
    'preview': 'Preview',
    'complete': 'Complete',
  };
  return labels[step];
}
