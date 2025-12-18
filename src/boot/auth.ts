// Boot file para inicializar el store de autenticación
// Se ejecuta al iniciar la aplicación

import { defineBoot } from '#q-app/wrappers';
import { useAuthStore } from '../stores/auth.store';

export default defineBoot(() => {
  // Inicializar el store de autenticación
  // Esto carga el token y perfil desde localStorage si existen
  const authStore = useAuthStore();
  authStore.init();
});

