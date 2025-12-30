<template>
  <q-page class="login-page">
    <div class="login-container">
      <q-card class="login-card q-pa-xl">
        <div class="text-center q-mb-lg">
          <div class="text-h4 q-mb-xs text-weight-bold">Iniciar Sesión</div>
          <div class="text-body2 text-grey-7">Ingresa tus credenciales para acceder al sistema</div>
        </div>

        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="form.username"
            label="Usuario o Email"
            outlined
            :rules="[(val) => !!val || 'El usuario es requerido']"
            :disable="loading"
          >
            <template #prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            v-model="form.password"
            label="Contraseña"
            :type="inputType"
            outlined
            :rules="[(val) => !!val || 'La contraseña es requerida']"
            :disable="loading"
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>
            <template #append>
              <q-icon :name="icon" class="cursor-pointer" @click="toggle" />
            </template>
          </q-input>

          <div class="row items-center justify-between">
            <q-checkbox v-model="rememberMe" label="Recordarme" :disable="loading" />
            <q-btn
              flat
              label="¿Olvidaste tu contraseña?"
              no-caps
              size="sm"
              :to="{ name: 'forgot-password' }"
              :disable="loading"
            />
          </div>

          <q-btn
            type="submit"
            label="Iniciar Sesión"
            color="primary"
            size="lg"
            class="full-width"
            :loading="loading"
            :disable="loading"
          />

          <div class="text-center q-mt-md">
            <span class="text-body2 text-grey-7">¿No tienes una cuenta? </span>
            <q-btn
              flat
              label="Regístrate"
              no-caps
              color="primary"
              :to="{ name: 'register' }"
              :disable="loading"
            />
          </div>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth, usePasswordVisibility } from '../../../shared/composables';
import type { LoginDto } from '../../../application/auth/auth.repository.port';

const { login, loading } = useAuth();
const { inputType, icon, toggle } = usePasswordVisibility();
const rememberMe = ref(false);

const form = ref<LoginDto>({
  username: '',
  password: '',
});

async function handleSubmit() {
  await login(form.value);
}
</script>

<style scoped lang="scss">
// ============================================
// DISEÑO PREMIUM - LOGIN PAGE
// ============================================

.login-page {
  // Fondo a pantalla completa (FIXED)
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  overflow: auto;
  
  // Eliminamos padding para ocupar toda la pantalla
  padding: 0 !important;
  margin: 0 !important;
  
  // Degradado moderno + imagen de fondo
  background: 
    linear-gradient(135deg, rgba(30, 40, 80, 0.65), rgba(10, 15, 35, 0.75)),
    url('../../../assets/fondoLogin.jpeg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  
  // Centrado del contenido
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 450px;
  padding: 1.5rem;
  margin: 2rem auto;
}

.login-card {
  // Glassmorphism Premium
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  
  // Bordes y sombras mejoradas
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  box-shadow: 
    0 8px 32px 0 rgba(0, 0, 0, 0.25),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.15);
  
  // Animación de entrada
  animation: fadeInUp 0.6s ease-out;
  
  // Hover sutil (opcional)
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 12px 40px 0 rgba(0, 0, 0, 0.3),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.15);
  }
}

// ============================================
// TIPOGRAFÍA MEJORADA
// ============================================

.text-h4 {
  font-size: 2rem !important;
  font-weight: 700 !important;
  letter-spacing: -0.5px !important;
  color: #ffffff !important;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.text-body2 {
  color: rgba(255, 255, 255, 0.9) !important;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

// ============================================
// INPUTS REFINADOS
// ============================================

:deep(.q-field--outlined .q-field__control) {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  transition: all 0.3s ease;
  
  &:before {
    border-color: rgba(0, 0, 0, 0.12);
  }
  
  &:hover:before {
    border-color: rgba(0, 0, 0, 0.24);
  }
}

:deep(.q-field--focused .q-field__control) {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

:deep(.q-field__label) {
  color: rgba(0, 0, 0, 0.6);
}

:deep(.q-icon) {
  color: rgba(0, 0, 0, 0.54);
}

// Color del texto en los inputs
:deep(.q-field__native),
:deep(.q-field__input) {
  color: #1a1a1a !important;
  font-weight: 500;
}

// Placeholder más visible
:deep(.q-field__native::placeholder),
:deep(.q-field__input::placeholder) {
  color: rgba(0, 0, 0, 0.4) !important;
}

// ============================================
// BOTÓN MODERNO
// ============================================

:deep(.q-btn.bg-primary) {
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(66, 133, 244, 0.35);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(66, 133, 244, 0.45);
  }
  
  &:active {
    transform: translateY(0);
  }
}

// ============================================
// CHECKBOX Y ENLACES
// ============================================

:deep(.q-checkbox) {
  color: rgba(255, 255, 255, 0.95);
}

:deep(.q-btn[flat]) {
  color: rgba(255, 255, 255, 0.9);
  
  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }
}

// ============================================
// ANIMACIONES
// ============================================

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ============================================
// RESPONSIVIDAD
// ============================================

@media (max-width: 600px) {
  .login-container {
    padding: 1rem;
    max-width: 100%;
  }
  
  .login-card {
    border-radius: 16px;
  }
  
  .text-h4 {
    font-size: 1.75rem !important;
  }
}
</style>
