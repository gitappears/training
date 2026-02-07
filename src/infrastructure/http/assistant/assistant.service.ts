import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';

export interface AssistantChatResponse {
  reply: string;
}

export interface AssistantQuotaResponse {
  tokensAvailable: number | null;
  tokensUsed: number;
  quotaMonthly: number | null;
  message: string;
}

/**
 * Servicio para el asistente de ayuda de Formar 360 (chat con GPT).
 */
export const assistantService = {
  async sendMessage(message: string): Promise<string> {
    const response = await api.post<AssistantChatResponse>('/assistant/chat', {
      message,
    });
    return response.data.reply;
  },

  async getQuota(): Promise<AssistantQuotaResponse> {
    const response = await api.get<AssistantQuotaResponse>('/assistant/quota');
    return response.data;
  },

  /** [ADMIN] Listar cuotas por empresa */
  async listQuotasEmpresas(): Promise<AssistantEmpresaQuotaItem[]> {
    const response = await api.get<AssistantEmpresaQuotaItem[]>('/assistant/quota/empresas');
    return response.data;
  },

  /** [ADMIN] Asignar cuota mensual a una empresa */
  async setEmpresaQuota(empresaId: number, tokenQuotaMonthly: number): Promise<void> {
    await api.put(`/assistant/quota/empresas/${empresaId}`, { tokenQuotaMonthly });
  },
};

export interface AssistantEmpresaQuotaItem {
  empresaId: number;
  razonSocial: string;
  tokenQuotaMonthly: number | null;
  tokensUsed: number;
}

/**
 * Obtiene el mensaje de error para mostrar al usuario.
 */
export function getAssistantErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  const msg = axiosError.response?.data?.message;
  if (typeof msg === 'string') return msg;
  return 'No se pudo conectar con el asistente. Verifica que el servicio esté configurado e intenta de nuevo.';
}
