<template>
  <q-dialog
    v-model="isOpen"
    maximized
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="certificate-preview-dialog">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-medium">
          Vista Previa del Certificado
        </div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          @click="close"
        />
      </q-card-section>

      <q-card-section class="certificate-preview-content">
        <div class="certificate-preview-container">
          <!-- Certificado Mock -->
          <div class="certificate-mock">
            <div class="certificate-header">
              <div class="certificate-logo">
                <q-icon name="school" size="64px" color="primary" />
              </div>
              <div class="certificate-title">CERTIFICADO DE APROBACIÓN</div>
              <div class="certificate-subtitle">Plataforma de Capacitación Virtual</div>
            </div>

            <div class="certificate-body">
              <div class="certificate-text">
                Se certifica que
              </div>
              <div class="certificate-name">
                {{ certificate.studentName || 'Nombre del Estudiante' }}
              </div>
              <div class="certificate-text">
                ha completado exitosamente el curso
              </div>
              <div class="certificate-course">
                {{ certificate.courseName || 'Nombre del Curso' }}
              </div>
              <div class="certificate-details">
                <div class="detail-row">
                  <span class="detail-label">Fecha de emisión:</span>
                  <span class="detail-value">{{ formatDate(certificate.issuedDate) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Fecha de vencimiento:</span>
                  <span class="detail-value">{{ formatDate(certificate.expiryDate) }}</span>
                </div>
                <div v-if="certificate.durationHours" class="detail-row">
                  <span class="detail-label">Duración:</span>
                  <span class="detail-value">{{ certificate.durationHours }} horas</span>
                </div>
                <div v-if="certificate.score" class="detail-row">
                  <span class="detail-label">Calificación:</span>
                  <span class="detail-value">{{ certificate.score }}%</span>
                </div>
              </div>
            </div>

            <div class="certificate-footer">
              <div class="certificate-qr">
                <QRCodeDisplay
                  v-if="certificate.verificationCode || certificate.qrCodeUrl"
                  :value="certificate.qrCodeUrl || certificate.publicVerificationUrl || certificate.verificationCode"
                  :size="120"
                />
                <div v-else class="qr-placeholder">
                  <q-icon name="qr_code" size="64px" color="grey-5" />
                </div>
              </div>
              <div class="certificate-signature">
                <div class="signature-line"></div>
                <div class="signature-text">Firma Digital</div>
                <div class="signature-date">{{ formatDate(certificate.issuedDate) }}</div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          label="Cancelar"
          color="grey-7"
          @click="close"
        />
        <q-btn
          color="primary"
          label="Descargar PDF"
          icon="download"
          @click="download"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Certificate } from '../../domain/certificate/models';
import QRCodeDisplay from './QRCodeDisplay.vue';

interface Props {
  modelValue: boolean;
  certificate: Certificate;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  download: [];
  close: [];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function close() {
  isOpen.value = false;
  emit('close');
}

function download() {
  emit('download');
  close();
}
</script>

<style scoped lang="scss">
.certificate-preview-dialog {
  .certificate-preview-content {
    padding: 24px;
    overflow: auto;
    max-height: calc(100vh - 120px);
  }

  .certificate-preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100%;
  }

  .certificate-mock {
    width: 100%;
    max-width: 800px;
    background: white;
    border: 4px solid #4f46e5;
    padding: 48px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(79, 70, 229, 0.03) 10px,
        rgba(79, 70, 229, 0.03) 20px
      );
      pointer-events: none;
    }
  }

  .certificate-header {
    text-align: center;
    margin-bottom: 48px;
    position: relative;
    z-index: 1;

    .certificate-logo {
      margin-bottom: 16px;
    }

    .certificate-title {
      font-size: 2rem;
      font-weight: 700;
      color: #4f46e5;
      margin-bottom: 8px;
      letter-spacing: 2px;
    }

    .certificate-subtitle {
      font-size: 1rem;
      color: #6b7280;
      font-weight: 500;
    }
  }

  .certificate-body {
    text-align: center;
    margin-bottom: 48px;
    position: relative;
    z-index: 1;

    .certificate-text {
      font-size: 1.125rem;
      color: #374151;
      margin-bottom: 16px;
    }

    .certificate-name {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      margin: 24px 0;
      padding: 16px;
      border-bottom: 3px solid #4f46e5;
      border-top: 3px solid #4f46e5;
      display: inline-block;
    }

    .certificate-course {
      font-size: 1.5rem;
      font-weight: 600;
      color: #4f46e5;
      margin: 24px 0;
    }

    .certificate-details {
      margin-top: 32px;
      text-align: left;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;

      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #e5e7eb;

        .detail-label {
          font-weight: 500;
          color: #6b7280;
        }

        .detail-value {
          font-weight: 600;
          color: #1f2937;
        }
      }
    }
  }

  .certificate-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 48px;
    position: relative;
    z-index: 1;

    .certificate-qr {
      .qr-placeholder {
        width: 120px;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 8px;
      }
    }

    .certificate-signature {
      text-align: center;

      .signature-line {
        width: 200px;
        height: 2px;
        background: #1f2937;
        margin: 0 auto 8px;
      }

      .signature-text {
        font-weight: 600;
        color: #374151;
        margin-bottom: 4px;
      }

      .signature-date {
        font-size: 0.875rem;
        color: #6b7280;
      }
    }
  }
}

body.body--dark {
  .certificate-preview-dialog {
    .certificate-mock {
      background: rgba(30, 27, 75, 0.95);
      border-color: #6366f1;
      color: #e5e7eb;

      &::before {
        background-image: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(99, 102, 241, 0.05) 10px,
          rgba(99, 102, 241, 0.05) 20px
        );
      }

      .certificate-body {
        .certificate-name {
          color: #f3f4f6;
          border-color: #6366f1;
        }

        .certificate-details {
          .detail-row {
            border-bottom-color: rgba(255, 255, 255, 0.1);

            .detail-label {
              color: #9ca3af;
            }

            .detail-value {
              color: #f3f4f6;
            }
          }
        }
      }

      .certificate-footer {
        .certificate-signature {
          .signature-line {
            background: #e5e7eb;
          }

          .signature-text {
            color: #f3f4f6;
          }

          .signature-date {
            color: #9ca3af;
          }
        }
      }
    }
  }
}
</style>

