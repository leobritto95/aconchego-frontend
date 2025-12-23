// Sistema simples de toast/notificações
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: Set<(toasts: Toast[]) => void> = new Set();

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  private addToast(message: string, type: ToastType) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = { id, message, type };
    this.toasts.push(toast);
    this.notify();

    // Auto remover após 5 segundos
    setTimeout(() => {
      this.removeToast(id);
    }, 5000);

    return id;
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  success(message: string) {
    return this.addToast(message, 'success');
  }

  error(message: string) {
    return this.addToast(message, 'error');
  }

  info(message: string) {
    return this.addToast(message, 'info');
  }

  warning(message: string) {
    return this.addToast(message, 'warning');
  }
}

export const toast = new ToastManager();

