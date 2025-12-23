import { useQuasar } from 'quasar';

export type NotificationType = 'positive' | 'negative' | 'warning' | 'info';

export interface NotificationOptions {
  type?: NotificationType;
  message: string;
  caption?: string;
  icon?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  timeout?: number;
  actions?: Array<{ label: string; color?: string; handler: () => void }>;
}

/**
 * Composable para centralizar el manejo de notificaciones
 * Proporciona métodos convenientes para mostrar diferentes tipos de notificaciones
 */
export function useNotifications() {
  const $q = useQuasar();

  /**
   * Muestra una notificación genérica
   */
  function notify(options: NotificationOptions) {
    $q.notify({
      type: options.type || 'info',
      message: options.message,
      caption: options.caption,
      icon: options.icon,
      position: options.position || 'top',
      timeout: options.timeout ?? 3000,
      actions: options.actions,
    });
  }

  /**
   * Muestra una notificación de éxito
   */
  function success(message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) {
    notify({
      type: 'positive',
      message,
      icon: 'check_circle',
      ...options,
    });
  }

  /**
   * Muestra una notificación de error
   */
  function error(message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) {
    notify({
      type: 'negative',
      message,
      icon: 'error',
      timeout: 5000,
      ...options,
    });
  }

  /**
   * Muestra una notificación de advertencia
   */
  function warning(message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) {
    notify({
      type: 'warning',
      message,
      icon: 'warning',
      ...options,
    });
  }

  /**
   * Muestra una notificación informativa
   */
  function info(message: string, options?: Omit<NotificationOptions, 'type' | 'message'>) {
    notify({
      type: 'info',
      message,
      icon: 'info',
      ...options,
    });
  }

  /**
   * Muestra un diálogo de confirmación
   */
  function confirm(options: {
    title: string;
    message: string;
    okLabel?: string;
    cancelLabel?: string;
    color?: string;
  }): Promise<boolean> {
    return new Promise((resolve) => {
      $q.dialog({
        title: options.title,
        message: options.message,
        cancel: {
          label: options.cancelLabel || 'Cancelar',
          color: 'grey',
          flat: true,
        },
        ok: {
          label: options.okLabel || 'Aceptar',
          color: options.color || 'primary',
        },
        persistent: true,
      })
        .onOk(() => resolve(true))
        .onCancel(() => resolve(false));
    });
  }

  return {
    notify,
    success,
    error,
    warning,
    info,
    confirm,
  };
}

