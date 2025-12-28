/**
 * Composable para manejar URLs de materiales
 * Centraliza la lógica de construcción de URLs completas para archivos
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo se encarga de construir URLs de materiales
 * - Open/Closed: Extensible para diferentes tipos de URLs sin modificar código existente
 */

import { computed } from 'vue';
import { api } from '../../boot/axios';

/**
 * Construye una URL completa para un material
 * @param url - URL relativa o absoluta del material
 * @returns URL completa que puede ser usada directamente en el frontend
 */
export function useMaterialUrl() {
  /**
   * Obtiene la URL base de la API
   */
  const baseUrl = computed(() => {
    return api.defaults.baseURL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
  });

  /**
   * Construye una URL completa a partir de una URL relativa o absoluta
   * @param url - URL del material (puede ser relativa o absoluta)
   * @returns URL completa
   */
  const buildFullUrl = (url: string | undefined | null): string => {
    if (!url) return '';
    
    // Si ya es una URL completa (http/https), retornarla tal cual
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Si es una ruta relativa, construir URL completa
    const base = baseUrl.value;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    return `${base}${cleanUrl}`;
  };

  /**
   * Extrae la URL relativa de una URL completa
   * Útil para enviar al backend que espera URLs relativas
   * @param url - URL completa o relativa
   * @returns URL relativa
   */
  const extractRelativeUrl = (url: string | undefined | null): string => {
    if (!url) return '';
    
    // Si ya es relativa, retornarla tal cual
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return url.startsWith('/') ? url : `/${url}`;
    }
    
    // Si es una URL completa, extraer la parte relativa
    const base = baseUrl.value;
    if (url.startsWith(base)) {
      return url.substring(base.length);
    }
    
    // Si es una URL completa de otro dominio, retornarla completa (para enlaces externos)
    // Pero para archivos locales, intentar extraer la ruta
    try {
      const urlObj = new URL(url);
      // Si es el mismo host, extraer el pathname
      const currentHost = new URL(base).host;
      if (urlObj.host === currentHost) {
        return urlObj.pathname + urlObj.search;
      }
      // Si es un enlace externo (ej: YouTube), retornar la URL completa
      return url;
    } catch {
      // Si no se puede parsear, retornar tal cual
      return url;
    }
  };

  /**
   * Verifica si una URL es absoluta
   * @param url - URL a verificar
   * @returns true si la URL es absoluta
   */
  const isAbsoluteUrl = (url: string): boolean => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  /**
   * Verifica si una URL es un enlace externo (no es un archivo local)
   * @param url - URL a verificar
   * @returns true si es un enlace externo
   */
  const isExternalLink = (url: string): boolean => {
    if (!isAbsoluteUrl(url)) return false;
    
    try {
      const urlObj = new URL(url);
      const base = baseUrl.value;
      const baseUrlObj = new URL(base);
      return urlObj.host !== baseUrlObj.host;
    } catch {
      return false;
    }
  };

  return {
    baseUrl,
    buildFullUrl,
    extractRelativeUrl,
    isAbsoluteUrl,
    isExternalLink,
  };
}

