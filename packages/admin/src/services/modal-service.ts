/**
 * Modal Service - Confirmation and prompt dialogs
 */

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export interface PromptOptions {
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
}

type ConfirmCallback = (options: ConfirmOptions) => Promise<boolean>;
type PromptCallback = (options: PromptOptions) => Promise<string | null>;

class ModalService {
  private confirmHandler: ConfirmCallback | null = null;
  private promptHandler: PromptCallback | null = null;

  registerConfirmHandler(handler: ConfirmCallback): void {
    this.confirmHandler = handler;
  }

  registerPromptHandler(handler: PromptCallback): void {
    this.promptHandler = handler;
  }

  async confirm(options: ConfirmOptions): Promise<boolean> {
    if (!this.confirmHandler) {
      // Fallback to native confirm
      return window.confirm(`${options.title}\n\n${options.message}`);
    }
    return this.confirmHandler(options);
  }

  async prompt(options: PromptOptions): Promise<string | null> {
    if (!this.promptHandler) {
      // Fallback to native prompt
      return window.prompt(options.message, options.defaultValue);
    }
    return this.promptHandler(options);
  }

  // Convenience methods
  async confirmDelete(itemName: string): Promise<boolean> {
    return this.confirm({
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true,
    });
  }

  async confirmDiscard(): Promise<boolean> {
    return this.confirm({
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Are you sure you want to discard them?',
      confirmText: 'Discard',
      cancelText: 'Keep Editing',
      danger: true,
    });
  }
}

// Singleton instance
export const modalService = new ModalService();
