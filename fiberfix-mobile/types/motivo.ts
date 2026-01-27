/**
 * Tipos y constantes para motivos de incidencias
 */

export type MotivoType = 
  | 'Cliente Ausente'
  | 'Instalación Rota'
  | 'Falta Material'
  | 'Sin Acceso'
  | 'Perro Suelto'
  | 'Otros';

export const MOTIVOS_PREDEFINIDOS: MotivoType[] = [
  'Cliente Ausente',
  'Instalación Rota',
  'Falta Material',
  'Sin Acceso',
  'Perro Suelto',
];

export const MOTIVOS_CON_OTROS: MotivoType[] = [
  ...MOTIVOS_PREDEFINIDOS,
  'Otros',
];

export function getMotivoDisplayName(motivo: MotivoType): string {
  return motivo;
}

export function isMotivoPersonalizado(motivo: string): boolean {
  return !MOTIVOS_PREDEFINIDOS.includes(motivo as MotivoType);
}
