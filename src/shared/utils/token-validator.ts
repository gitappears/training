/**
 * Utilidades para validar tokens JWT
 * Verifica si un token ha expirado y proporciona funciones de validación
 */

/**
 * Decodifica un token JWT sin verificar la firma
 * @param token - Token JWT a decodificar
 * @returns Payload del token o null si es inválido
 */
function decodeToken(token: string): { exp?: number; iat?: number; [key: string]: unknown } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    if (!payload) {
      return null;
    }

    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as { exp?: number; iat?: number; [key: string]: unknown };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Verifica si un token JWT ha expirado
 * @param token - Token JWT a verificar
 * @returns true si el token ha expirado o es inválido, false si es válido
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true;
  }

  const decoded = decodeToken(token);
  if (!decoded) {
    return true;
  }

  // Si no tiene exp (expiration), considerar como expirado por seguridad
  if (!decoded.exp) {
    return true;
  }

  // exp está en segundos, Date.now() está en milisegundos
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();

  // Agregar un margen de 5 segundos para evitar problemas de sincronización
  const margin = 5000; // 5 segundos

  return currentTime >= expirationTime - margin;
}

/**
 * Obtiene el tiempo restante hasta la expiración del token en milisegundos
 * @param token - Token JWT
 * @returns Tiempo restante en milisegundos, o null si el token es inválido
 */
export function getTokenTimeRemaining(token: string | null): number | null {
  if (!token) {
    return null;
  }

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const remaining = expirationTime - currentTime;

  return remaining > 0 ? remaining : 0;
}

/**
 * Valida un token JWT y retorna información sobre su estado
 * @param token - Token JWT a validar
 * @returns Objeto con información sobre la validez del token
 */
export function validateToken(token: string | null): {
  isValid: boolean;
  isExpired: boolean;
  timeRemaining: number | null;
} {
  if (!token) {
    return {
      isValid: false,
      isExpired: true,
      timeRemaining: null,
    };
  }

  const decoded = decodeToken(token);
  if (!decoded) {
    return {
      isValid: false,
      isExpired: true,
      timeRemaining: null,
    };
  }

  const isExpired = isTokenExpired(token);
  const timeRemaining = getTokenTimeRemaining(token);

  return {
    isValid: !isExpired,
    isExpired,
    timeRemaining,
  };
}
