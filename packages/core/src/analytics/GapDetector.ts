/**
 * GapDetector - Detect missing skills and suggest improvements
 * Sprint 11.1 - Gap Detection
 */

import { EventBus } from '../events/EventBus';
import { skillRegistry } from '../skills/SkillRegistry';
import { agentRegistry } from '../agents/AgentRegistry';

export interface UsagePattern {
  event: string;
  count: number;
  lastSeen: number;
  averageInterval?: number;
}

export interface GapSuggestion {
  type: 'skill' | 'agent' | 'widget' | 'workflow';
  name: string;
  description: string;
  reason: string;
  confidence: number; // 0-1
  basedOn: string[]; // Event patterns or tool usage
}

export interface GapAnalysis {
  timestamp: number;
  unusedTools: string[];
  frequentPatterns: UsagePattern[];
  suggestions: GapSuggestion[];
}

export interface GapDetectorConfig {
  /** Minimum event count to consider a pattern */
  minEventCount?: number;
  /** Time window for analysis in ms */
  analysisWindow?: number;
  /** Available MCP tools */
  availableTools?: string[];
}

export class GapDetector {
  private config: Required<GapDetectorConfig>;
  private eventCounts: Map<string, UsagePattern> = new Map();
  private toolUsage: Map<string, number> = new Map();
  private eventHistory: Array<{ event: string; timestamp: number }> = [];

  constructor(config: GapDetectorConfig = {}) {
    this.config = {
      minEventCount: config.minEventCount || 5,
      analysisWindow: config.analysisWindow || 7 * 24 * 60 * 60 * 1000, // 7 days
      availableTools: config.availableTools || [],
    };
  }

  /**
   * Start tracking events
   */
  startTracking(): () => void {
    const unsub = EventBus.subscribe('*', (event, payload) => {
      this.trackEvent(event, payload);
    });

    return unsub;
  }

  /**
   * Track an event
   */
  trackEvent(event: string, payload?: unknown): void {
    const now = Date.now();

    // Update event counts
    const existing = this.eventCounts.get(event);
    if (existing) {
      const interval = now - existing.lastSeen;
      existing.count++;
      existing.lastSeen = now;
      existing.averageInterval = existing.averageInterval
        ? (existing.averageInterval + interval) / 2
        : interval;
    } else {
      this.eventCounts.set(event, {
        event,
        count: 1,
        lastSeen: now,
      });
    }

    // Track tool usage from events
    if (event.startsWith('tool.') || event.includes('.tool_call')) {
      const toolName = (payload as { tool?: string })?.tool || event.split('.')[1];
      if (toolName) {
        this.toolUsage.set(toolName, (this.toolUsage.get(toolName) || 0) + 1);
      }
    }

    // Add to history
    this.eventHistory.push({ event, timestamp: now });

    // Cleanup old history
    const cutoff = now - this.config.analysisWindow;
    this.eventHistory = this.eventHistory.filter(e => e.timestamp > cutoff);
  }

  /**
   * Track tool usage directly
   */
  trackToolUsage(toolName: string): void {
    this.toolUsage.set(toolName, (this.toolUsage.get(toolName) || 0) + 1);
  }

  /**
   * Set available tools
   */
  setAvailableTools(tools: string[]): void {
    this.config.availableTools = tools;
  }

  /**
   * Run gap analysis
   */
  analyze(): GapAnalysis {
    const suggestions: GapSuggestion[] = [];

    // Find unused tools
    const unusedTools = this.findUnusedTools();

    // Find frequent patterns
    const frequentPatterns = this.getFrequentPatterns();

    // Generate suggestions based on patterns
    suggestions.push(...this.suggestFromPatterns(frequentPatterns));

    // Suggest skills for unused tools
    suggestions.push(...this.suggestForUnusedTools(unusedTools));

    // Suggest agents for frequent skill usage
    suggestions.push(...this.suggestAgentPromotion());

    return {
      timestamp: Date.now(),
      unusedTools,
      frequentPatterns,
      suggestions: suggestions.sort((a, b) => b.confidence - a.confidence),
    };
  }

  /**
   * Find tools that haven't been used
   */
  private findUnusedTools(): string[] {
    return this.config.availableTools.filter(tool => !this.toolUsage.has(tool));
  }

  /**
   * Get frequent event patterns
   */
  private getFrequentPatterns(): UsagePattern[] {
    return Array.from(this.eventCounts.values())
      .filter(p => p.count >= this.config.minEventCount)
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Suggest based on usage patterns
   */
  private suggestFromPatterns(patterns: UsagePattern[]): GapSuggestion[] {
    const suggestions: GapSuggestion[] = [];

    // Find search → detail patterns without comparison
    const hasSearch = patterns.some(p => p.event.includes('search'));
    const hasDetail = patterns.some(p => p.event.includes('detail') || p.event.includes('selected'));
    const hasCompare = patterns.some(p => p.event.includes('compare'));

    if (hasSearch && hasDetail && !hasCompare) {
      suggestions.push({
        type: 'workflow',
        name: 'Product Comparison Workflow',
        description: 'Add comparison capability to your product research flow',
        reason: 'Users frequently search and view products but never compare them',
        confidence: 0.7,
        basedOn: ['product.search', 'product.selected'],
      });
    }

    // Find repeated manual actions that could be automated
    const manualPatterns = patterns.filter(
      p => p.count > 10 && p.averageInterval && p.averageInterval < 60000
    );

    for (const pattern of manualPatterns.slice(0, 3)) {
      if (!skillRegistry.getSkillsForTrigger(pattern.event).length) {
        suggestions.push({
          type: 'skill',
          name: `Auto-${pattern.event.split('.').pop()}`,
          description: `Automate the frequently triggered ${pattern.event} action`,
          reason: `Event triggered ${pattern.count} times with avg interval of ${Math.round((pattern.averageInterval || 0) / 1000)}s`,
          confidence: 0.6,
          basedOn: [pattern.event],
        });
      }
    }

    return suggestions;
  }

  /**
   * Suggest skills for unused tools
   */
  private suggestForUnusedTools(unusedTools: string[]): GapSuggestion[] {
    const suggestions: GapSuggestion[] = [];

    // Group unused tools by category
    const categories: Record<string, string[]> = {};
    for (const tool of unusedTools) {
      const category = tool.split('_')[0]; // e.g., "search_products" -> "search"
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(tool);
    }

    // Suggest skills for tool clusters
    for (const [category, tools] of Object.entries(categories)) {
      if (tools.length >= 2) {
        suggestions.push({
          type: 'skill',
          name: `${category.charAt(0).toUpperCase() + category.slice(1)} Skill`,
          description: `Combine ${tools.length} unused ${category} tools into a skill`,
          reason: `Tools ${tools.slice(0, 3).join(', ')}${tools.length > 3 ? '...' : ''} are available but unused`,
          confidence: 0.5,
          basedOn: tools,
        });
      }
    }

    return suggestions;
  }

  /**
   * Suggest promoting skills to agents
   */
  private suggestAgentPromotion(): GapSuggestion[] {
    const suggestions: GapSuggestion[] = [];

    // Find frequently used skills that aren't wrapped in agents
    const allSkills = skillRegistry.getAll();
    
    for (const skill of allSkills) {
      const agents = agentRegistry.getAgentsUsingSkill(skill.id);
      
      if (agents.length === 0) {
        // Check if skill is frequently triggered
        const triggerPatterns = (skill.triggers || [])
          .map(t => this.eventCounts.get(t))
          .filter(Boolean) as UsagePattern[];

        const totalTriggers = triggerPatterns.reduce((sum, p) => sum + p.count, 0);

        if (totalTriggers > 10) {
          suggestions.push({
            type: 'agent',
            name: `${skill.name} Agent`,
            description: `Promote skill "${skill.name}" to an autonomous agent`,
            reason: `Skill triggered ${totalTriggers} times but has no agent wrapper`,
            confidence: 0.65,
            basedOn: [skill.id],
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * Get usage statistics
   */
  getStats(): {
    totalEvents: number;
    uniqueEvents: number;
    toolsUsed: number;
    toolsAvailable: number;
    coveragePercent: number;
  } {
    const totalEvents = Array.from(this.eventCounts.values()).reduce(
      (sum, p) => sum + p.count,
      0
    );

    return {
      totalEvents,
      uniqueEvents: this.eventCounts.size,
      toolsUsed: this.toolUsage.size,
      toolsAvailable: this.config.availableTools.length,
      coveragePercent: this.config.availableTools.length > 0
        ? Math.round((this.toolUsage.size / this.config.availableTools.length) * 100)
        : 0,
    };
  }

  /**
   * Reset tracking data
   */
  reset(): void {
    this.eventCounts.clear();
    this.toolUsage.clear();
    this.eventHistory = [];
  }
}

/** Singleton instance */
export const gapDetector = new GapDetector();
