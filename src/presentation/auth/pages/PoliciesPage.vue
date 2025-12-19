<template>
  <q-page class="policies-page">
    <div class="page-container q-pa-xl">
      <div class="row justify-center">
        <div class="col-12 col-md-10 col-lg-8">
          <!-- Header -->
          <div class="page-header q-mb-xl">
            <q-btn
              icon="arrow_back"
              flat
              round
              dense
              class="q-mb-md"
              @click="goBack"
            >
              <q-tooltip>Volver</q-tooltip>
            </q-btn>
            <div class="text-h4 text-weight-bold q-mb-sm">
              {{ policyType === 'datos' ? 'Política de Tratamiento de Datos Personales' : 'Términos y Condiciones de Uso' }}
            </div>
            <div class="text-subtitle1 text-grey-7">
              Versión {{ policyVersion }} · Última actualización: {{ lastUpdateDate }}
            </div>
          </div>

          <!-- Content -->
          <q-card flat bordered class="policy-card">
            <q-card-section>
              <div
                class="policy-content"
                v-html="policyContent"
              />
            </q-card-section>

            <!-- Actions -->
            <q-card-actions
              v-if="showAcceptance"
              align="right"
              class="q-pa-md"
            >
              <q-btn
                flat
                label="Cancelar"
                color="grey-7"
                @click="goBack"
              />
              <q-btn
                color="primary"
                label="Aceptar"
                @click="accept"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const policyType = computed(() => {
  const type = route.params.type as string;
  return type === 'terminos' ? 'terminos' : 'datos';
});

const showAcceptance = computed(() => route.query.accept === 'true');

// Datos mock de políticas - En producción vendrían del backend
const policyVersion = computed(() => '1.0');
const lastUpdateDate = computed(() => '18 de diciembre de 2025');

const policyContent = computed(() => {
  if (policyType.value === 'datos') {
    return `
      <h2>Política de Tratamiento de Datos Personales</h2>
      <p><strong>IPS Confianza</strong> se compromete a proteger la privacidad y los datos personales de sus usuarios. Esta política describe cómo recopilamos, usamos, almacenamos y protegemos su información personal.</p>

      <h3>1. Información que Recopilamos</h3>
      <p>Recopilamos información personal que usted nos proporciona directamente, incluyendo:</p>
      <ul>
        <li>Nombre completo</li>
        <li>Número de identificación</li>
        <li>Dirección de correo electrónico</li>
        <li>Número de teléfono</li>
        <li>Información académica y profesional</li>
        <li>Datos de navegación y uso de la plataforma</li>
      </ul>

      <h3>2. Uso de la Información</h3>
      <p>Utilizamos su información personal para:</p>
      <ul>
        <li>Proporcionar y mejorar nuestros servicios de capacitación</li>
        <li>Gestionar su cuenta y perfil de usuario</li>
        <li>Enviar notificaciones y comunicaciones relacionadas con los cursos</li>
        <li>Generar certificados y reportes de progreso</li>
        <li>Cumplir con obligaciones legales y regulatorias</li>
      </ul>

      <h3>3. Protección de Datos</h3>
      <p>Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales contra acceso no autorizado, alteración, divulgación o destrucción.</p>

      <h3>4. Compartir Información</h3>
      <p>No vendemos, alquilamos ni compartimos su información personal con terceros, excepto cuando sea necesario para proporcionar nuestros servicios o cuando la ley lo requiera.</p>

      <h3>5. Sus Derechos</h3>
      <p>Usted tiene derecho a:</p>
      <ul>
        <li>Acceder a sus datos personales</li>
        <li>Rectificar datos inexactos</li>
        <li>Solicitar la eliminación de sus datos</li>
        <li>Oponerse al tratamiento de sus datos</li>
        <li>Revocar su consentimiento en cualquier momento</li>
      </ul>

      <h3>6. Contacto</h3>
      <p>Para ejercer sus derechos o realizar consultas sobre esta política, puede contactarnos en: <strong>privacidad@ipsconfianza.com</strong></p>

      <p class="text-caption text-grey-7 q-mt-lg">
        Esta política puede ser actualizada periódicamente. Le notificaremos sobre cambios significativos.
      </p>
    `;
  } else {
    return `
      <h2>Términos y Condiciones de Uso</h2>
      <p>Al acceder y utilizar la plataforma de capacitación virtual de <strong>IPS Confianza</strong>, usted acepta cumplir con estos términos y condiciones.</p>

      <h3>1. Aceptación de los Términos</h3>
      <p>Al registrarse y utilizar nuestros servicios, usted confirma que:</p>
      <ul>
        <li>Ha leído y comprendido estos términos</li>
        <li>Acepta cumplir con todas las condiciones establecidas</li>
        <li>Es mayor de edad o tiene autorización de un tutor legal</li>
        <li>La información proporcionada es veraz y actualizada</li>
      </ul>

      <h3>2. Uso de la Plataforma</h3>
      <p>Usted se compromete a:</p>
      <ul>
        <li>Utilizar la plataforma únicamente para fines educativos y de capacitación</li>
        <li>No compartir sus credenciales de acceso con terceros</li>
        <li>No realizar actividades que puedan dañar o interferir con el funcionamiento de la plataforma</li>
        <li>Respetar los derechos de propiedad intelectual de los contenidos</li>
        <li>No utilizar la plataforma para fines ilegales o no autorizados</li>
      </ul>

      <h3>3. Contenido y Propiedad Intelectual</h3>
      <p>Todo el contenido de la plataforma, incluyendo textos, imágenes, videos, materiales de curso y software, es propiedad de IPS Confianza o de sus licenciantes y está protegido por leyes de propiedad intelectual.</p>

      <h3>4. Certificados</h3>
      <p>Los certificados emitidos son válidos únicamente cuando:</p>
      <ul>
        <li>El usuario ha completado exitosamente el curso</li>
        <li>Ha aprobado las evaluaciones correspondientes</li>
        <li>Ha cumplido con todos los requisitos establecidos</li>
      </ul>

      <h3>5. Limitación de Responsabilidad</h3>
      <p>IPS Confianza no se hace responsable por:</p>
      <ul>
        <li>Interrupciones en el servicio debido a causas fuera de su control</li>
        <li>Pérdida de datos o información del usuario</li>
        <li>Decisiones tomadas basándose en el contenido de los cursos</li>
      </ul>

      <h3>6. Modificaciones</h3>
      <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados a los usuarios y entrarán en vigor al continuar utilizando la plataforma.</p>

      <h3>7. Terminación</h3>
      <p>Podemos suspender o terminar su acceso a la plataforma si viola estos términos o si detectamos actividad fraudulenta.</p>

      <h3>8. Ley Aplicable</h3>
      <p>Estos términos se rigen por las leyes de Colombia. Cualquier disputa será resuelta en los tribunales competentes.</p>

      <p class="text-caption text-grey-7 q-mt-lg">
        Si tiene preguntas sobre estos términos, puede contactarnos en: <strong>legal@ipsconfianza.com</strong>
      </p>
    `;
  }
});

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    void router.push('/auth/login');
  }
}

function accept() {
  // Emitir evento o guardar aceptación
  $q.notify({
    type: 'positive',
    message: 'Política aceptada correctamente',
    position: 'top',
  });
  goBack();
}
</script>

<style scoped lang="scss">
.policies-page {
  background-color: rgba(0, 0, 0, 0.02);
  min-height: 100vh;

  .page-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .page-header {
    text-align: center;
  }

  .policy-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .policy-content {
    line-height: 1.8;
    padding: 24px;

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-top: 2rem;
      margin-bottom: 1rem;
      color: var(--q-primary);
    }

    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }

    p {
      margin-bottom: 1rem;
      text-align: justify;
    }

    ul {
      margin-left: 1.5rem;
      margin-bottom: 1rem;

      li {
        margin-bottom: 0.5rem;
      }
    }

    strong {
      font-weight: 600;
    }
  }
}

body.body--dark {
  .policies-page {
    background-color: rgba(0, 0, 0, 0.3);

    .policy-card {
      background: rgba(30, 27, 75, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>

