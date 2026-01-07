// Boot file para configurar i18n de Quasar
// Carga el paquete de idioma español para evitar errores de translations undefined
// Este boot file se ejecuta antes que otros para asegurar que el idioma esté disponible

import { defineBoot } from '#q-app/wrappers';
// Importar el idioma español asegura que el módulo esté cargado
// Quasar detectará automáticamente el idioma gracias a la configuración
// en quasar.config.ts (lang: 'es')
import 'quasar/lang/es';

export default defineBoot(() => {
  // La simple importación del idioma es suficiente
  // Quasar lo detectará automáticamente cuando se inicialice
  // gracias a la configuración lang: 'es' en quasar.config.ts
});
