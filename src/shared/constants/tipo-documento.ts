/**
 * Tipo de documento de identificación (personas y empresas).
 * Unificado para formularios, dominios e infraestructura.
 */
export type TipoDocumento = 'CC' | 'TI' | 'CE' | 'PA' | 'RC' | 'NIT';

export interface TipoDocumentoOption {
  label: string;
  value: TipoDocumento;
}

export const TIPO_DOCUMENTO_OPTIONS: TipoDocumentoOption[] = [
  { label: 'Cédula de Ciudadanía', value: 'CC' },
  { label: 'Tarjeta de Identidad', value: 'TI' },
  { label: 'Cédula de Extranjería', value: 'CE' },
  { label: 'Pasaporte', value: 'PA' },
  { label: 'Registro Civil', value: 'RC' },
  { label: 'NIT', value: 'NIT' },
];

/**
 * Obtiene la etiqueta legible de un tipo de documento.
 * @param type Código del tipo o null/undefined
 * @returns Etiqueta o el valor original si no se encuentra
 */
export function getTipoDocumentoLabel(
  type: TipoDocumento | string | null | undefined,
): string {
  if (type == null || type === '') return '';
  const opt = TIPO_DOCUMENTO_OPTIONS.find((o) => o.value === type);
  return opt?.label ?? String(type);
}
