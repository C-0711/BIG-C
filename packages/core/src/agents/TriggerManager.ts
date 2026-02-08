/**
 * TriggerManager - Manage agent triggers (events, cron, webhooks)
 * Sprint 10.1 - Triggers & Notifications
 */

import { AgentRegistry } from './AgentRegistry';
import { AgentRuntime } from './AgentRuntime';
import { CronTriggerConfig, EventTriggerConfig } from './AgentSchema';
import { EventBus } from '../events/EventBus';

export interface CronJob {
  agentId: string;
  schedule: string;
  timezone?: string;
  nextRun?: number;
  lastRun?: number;
  enabled: boolean;
}

export interface TriggerManagerConfig {
  /** Enable event-based triggers */
  enableEvents?: boolean;
  /** Enable cron-based triggers */
  enableCron?: boolean;
  /** Cron check interval in ms */
  cronInterval?: number;
}

export class TriggerManager {
  private registry: AgentRegistry;
  private runtime: AgentRuntime;
  private config: Required<TriggerManagerConfig>;
  private eventSubscriptions: Map<string, () => void> = new Map();
  private cronJobs: Map<string, CronJob> = new Map();
  private cronTimer: NodeJS.Timeout | null = null;
  private active = false;

  constructor(
    registry: AgentRegistry,
    runtime: AgentRuntime,
    config: TriggerManagerConfig = {}
  ) {
    this.registry = registry;
    this.runtime = runtime;
    this.config = {
      enableEvents: config.enableEvents ?? true,
      enableCron: config.enableCron ?? true,
      cronInterval: config.cronInterval || 60000, // Check every minute
    };
  }

  /**
   * Start the trigger manager
   */
  start(): void {
    if (this.active) return;
    this.active = true;

    if (this.config.enableEvents) {
      this.setupEventTriggers();
    }

    if (this.config.enableCron) {
      this.setupCronTriggers();
      this.startCronTimer();
    }

    EventBus.emit('trigger_manager.started', {
      events: this.config.enableEvents,
      cron: this.config.enableCron,
    });
  }

  /**
   * Stop the trigger manager
   */
  stop(): void {
    if (!this.active) return;
    this.active = false;

    // Unsubscribe from all events
    for (const unsub of this.eventSubscriptions.values()) {
      unsub();
    }
    this.eventSubscriptions.clear();

    // Stop cron timer
    if (this.cronTimer) {
      clearInterval(this.cronTimer);
      this.cronTimer = null;
    }

    EventBus.emit('trigger_manager.stopped', {});
  }

  /**
   * Setup event-based triggers
   */
  private setupEventTriggers(): void {
    // Subscribe to all events with a wildcard
    const unsub = EventBus.subscribe('*', async (event, payload) => {
      // Skip internal events
      if (event.startsWith('agent.') || event.startsWith('trigger_manager.')) {
        return;
      }

      const agents = this.registry.getAgentsForEvent(event);
      if (agents.length > 0) {
        EventBus.emit('trigger_manager.event_matched', {
          event,
          agentCount: agents.length,
        });

        // Execute agents in parallel
        await Promise.all(
          agents.map(agent =>
            this.runtime.execute(agent.id, undefined, {
              type: 'event',
              event,
              payload,
            })
          )
        );
      }
    });

    this.eventSubscriptions.set('*', unsub);
  }

  /**
   * Setup cron-based triggers
   */
  private setupCronTriggers(): void {
    const agents = this.registry.getCronAgents();

    for (const agent of agents) {
      const cronTriggers = (agent.triggers || []).filter(t => t.type === 'cron');

      for (const trigger of cronTriggers) {
        const config = trigger.config as CronTriggerConfig;
        
        this.cronJobs.set(agent.id, {
          agentId: agent.id,
          schedule: config.schedule,
          timezone: config.timezone,
          enabled: trigger.enabled !== false,
          nextRun: this.calculateNextRun(config.schedule, config.timezone),
        });
      }
    }
  }

  /**
   * Start cron timer
   */
  private startCronTimer(): void {
    this.cronTimer = setInterval(() => {
      this.checkCronJobs();
    }, this.config.cronInterval);
  }

  /**
   * Check and execute due cron jobs
   */
  private async checkCronJobs(): Promise<void> {
    const now = Date.now();

    for (const [agentId, job] of this.cronJobs) {
      if (!job.enabled) continue;
      if (!job.nextRun || job.nextRun > now) continue;

      // Execute the agent
      EventBus.emit('trigger_manager.cron_triggered', {
        agentId,
        schedule: job.schedule,
      });

      try {
        await this.runtime.execute(agentId, undefined, {
          type: 'cron',
          payload: { schedule: job.schedule },
        });
      } catch (error) {
        console.error(`Cron trigger failed for agent ${agentId}:`, error);
      }

      // Update job times
      job.lastRun = now;
      job.nextRun = this.calculateNextRun(job.schedule, job.timezone);
    }
  }

  /**
   * Calculate next run time from cron expression
   * Simplified implementation - in production, use a cron parser library
   */
  private calculateNextRun(schedule: string, timezone?: string): number {
    // Very simplified cron parsing
    // Format: "minute hour day month weekday" or shortcuts like "@hourly"
    const now = new Date();

    if (schedule === '@hourly') {
      const next = new Date(now);
      next.setHours(next.getHours() + 1, 0, 0, 0);
      return next.getTime();
    }

    if (schedule === '@daily') {
      const next = new Date(now);
      next.setDate(next.getDate() + 1);
      next.setHours(0, 0, 0, 0);
      return next.getTime();
    }

    if (schedule === '@weekly') {
      const next = new Date(now);
      next.setDate(next.getDate() + (7 - next.getDay()));
      next.setHours(0, 0, 0, 0);
      return next.getTime();
    }

    // Default: run in 1 hour
    return now.getTime() + 3600000;
  }

  /**
   * Manually trigger an agent
   */
  async triggerManually(agentId: string, input?: string): Promise<void> {
    await this.runtime.execute(agentId, input, {
      type: 'manual',
    });
  }

  /**
   * Add a cron job dynamically
   */
  addCronJob(agentId: string, schedule: string, timezone?: string): void {
    this.cronJobs.set(agentId, {
      agentId,
      schedule,
      timezone,
      enabled: true,
      nextRun: this.calculateNextRun(schedule, timezone),
    });
  }

  /**
   * Remove a cron job
   */
  removeCronJob(agentId: string): boolean {
    return this.cronJobs.delete(agentId);
  }

  /**
   * Enable/disable a cron job
   */
  setCronJobEnabled(agentId: string, enabled: boolean): boolean {
    const job = this.cronJobs.get(agentId);
    if (!job) return false;
    job.enabled = enabled;
    return true;
  }

  /**
   * Get all cron jobs
   */
  getCronJobs(): CronJob[] {
    return Array.from(this.cronJobs.values());
  }

  /**
   * Check if trigger manager is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Refresh triggers (call when agents are updated)
   */
  refresh(): void {
    if (!this.active) return;

    // Re-setup cron triggers
    this.cronJobs.clear();
    this.setupCronTriggers();
  }
}
