/**
 * Toast Service - Global notification system
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  timestamp: number;
}

type ToastListener = (toasts: Toast[]) => void;

class ToastService {
  private toasts: Toast[] = [];
  private listeners: Set<ToastListener> = new Set();
  private counter = 0;

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => this.listeners.delete(listener);
  }

  private add(type: ToastType, message: string, duration: number = 4000): string {
    const id = `toast-${++this.counter}`;
    const toast: Toast = {
      id,
      type,
      message,
      duration,
      timestamp: Date.now(),
    };
    
    this.toasts = [...this.toasts, toast];
    this.notify();

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  }

  dismiss(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  dismissAll(): void {
    this.toasts = [];
    this.notify();
  }

  success(message: string, duration?: number): string {
    return this.add('success', message, duration);
  }

  error(message: string, duration: number = 6000): string {
    return this.add('error', message, duration);
  }

  info(message: string, duration?: number): string {
    return this.add('info', message, duration);
  }

  warning(message: string, duration: number = 5000): string {
    return this.add('warning', message, duration);
  }
}

// Singleton instance
export const toastService = new ToastService();
