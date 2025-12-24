/**
 * Composable para mapear tipos de material entre backend y frontend
 * Centraliza la lógica de mapeo siguiendo principios SOLID
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo se encarga de mapear tipos de material
 * - Open/Closed: Extensible para nuevos tipos sin modificar código existente
 */

import type { Material } from '../../domain/material/models';

/**
 * Mapea el código o nombre del tipo de material del backend al tipo del dominio
 * Prioriza el código sobre el nombre para mayor confiabilidad
 * 
 * @param codigoOrNombre - Código o nombre del tipo de material del backend
 * @returns Tipo de material del dominio
 */
export function useMaterialTypeMapper() {
  /**
   * Mapeo por código (más confiable y directo)
   */
  const codeMap: Record<string, Material['type']> = {
    'PDF': 'PDF',
    'IMAGEN': 'IMAGE',
    'IMAGE': 'IMAGE',
    'VIDEO': 'VIDEO',
    'DOC': 'DOC',
    'WORD': 'DOC',
    'DOCX': 'DOC',
    'ENLACE': 'LINK',
    'LINK': 'LINK',
    'PRESENTACION': 'PRESENTATION',
    'PRESENTATION': 'PRESENTATION',
    'PPT': 'PRESENTATION',
    'PPTX': 'PRESENTATION',
    'AUDIO': 'AUDIO',
  };

  /**
   * Mapea el tipo de material del backend al dominio
   * @param codigoOrNombre - Código o nombre del tipo de material
   * @returns Tipo de material del dominio
   */
  const mapFromBackend = (codigoOrNombre: string | undefined | null): Material['type'] => {
    if (!codigoOrNombre) return 'PDF'; // Default
    
    const value = codigoOrNombre.toUpperCase().trim();
    
    // Primero intentar mapeo por código (más confiable)
    if (codeMap[value]) {
      return codeMap[value];
    }
    
    // Fallback: mapeo por nombre (búsqueda parcial para mayor flexibilidad)
    const nombreLower = codigoOrNombre.toLowerCase();
    
    if (nombreLower.includes('pdf')) return 'PDF';
    if (nombreLower.includes('imagen') || nombreLower.includes('image')) return 'IMAGE';
    if (nombreLower.includes('video')) return 'VIDEO';
    if (nombreLower.includes('word') || nombreLower.includes('doc')) return 'DOC';
    if (nombreLower.includes('enlace') || nombreLower.includes('link')) return 'LINK';
    if (nombreLower.includes('presentación') || nombreLower.includes('presentation') || nombreLower.includes('powerpoint')) return 'PRESENTATION';
    if (nombreLower.includes('audio')) return 'AUDIO';
    
    // Default: PDF
    return 'PDF';
  };

  /**
   * Mapea el tipo de material del dominio al ID del backend
   * @param type - Tipo de material del dominio
   * @returns ID del tipo de material en el backend
   */
  const mapToBackendId = (type: Material['type']): number => {
    const map: Record<Material['type'], number> = {
      PDF: 1,
      IMAGE: 2,
      VIDEO: 3,
      DOC: 4,
      LINK: 5,
      PRESENTATION: 6,
      AUDIO: 7,
    };
    return map[type] ?? 1; // Default: PDF
  };

  return {
    mapFromBackend,
    mapToBackendId,
  };
}

