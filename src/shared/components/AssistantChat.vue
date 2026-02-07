<template>
  <div class="assistant-chat">
    <!-- Botón flotante -->
    <q-btn
      fab
      color="primary"
      icon="support_agent"
      class="assistant-fab"
      :class="{ 'fab-offset': drawerOpen }"
      @click="drawerOpen = true"
    >
      <q-tooltip>Asistente Formar 360</q-tooltip>
    </q-btn>

    <!-- Panel del chat -->
    <q-drawer
      v-model="drawerOpen"
      side="right"
      overlay
      elevated
      :width="400"
      :breakpoint="500"
      behavior="mobile"
      class="assistant-drawer"
    >
      <q-card flat class="assistant-panel column full-height">
        <q-card-section class="row items-center q-pa-md assistant-header">
          <q-icon name="support_agent" size="sm" class="q-mr-sm" />
          <span class="text-h6">Asistente Formar 360</span>
          <q-space />
          <q-btn flat dense round icon="close" @click="drawerOpen = false" />
        </q-card-section>

        <q-card-section
          v-if="quotaMessage"
          class="q-pt-none q-pb-sm assistant-quota text-body2 text-grey-7"
        >
          <q-icon name="token" size="16px" class="q-mr-xs vertical-middle" />
          {{ quotaMessage }}
        </q-card-section>

        <q-separator />

        <q-scroll-area class="col messages-area">
          <div class="q-pa-md column q-gutter-md">
            <div v-if="messages.length === 0" class="text-center text-grey-6 q-py-xl">
              <q-icon name="chat_bubble_outline" size="48px" class="q-mb-sm" />
              <div class="text-body2">
                Pregunta cómo usar la plataforma. Por ejemplo:<br />
                «¿Cómo creo una capacitación?»<br />
                «¿Dónde veo mis certificados?»
              </div>
            </div>
            <div
              v-for="(msg, i) in messages"
              :key="i"
              :class="[
                'message-bubble',
                msg.role === 'user' ? 'message-user' : 'message-assistant',
                msg.isLimitError ? 'message-limit-error' : '',
              ]"
            >
              <div v-if="msg.role === 'user'" class="text-body2">{{ msg.content }}</div>
              <div v-else-if="msg.isLimitError" class="text-body2 message-limit-error-content">
                <q-icon name="info" size="20px" class="q-mr-sm" />
                {{ msg.content }}
              </div>
              <div v-else class="message-assistant-content text-body2">
                <AssistantMessageText :text="msg.content" />
              </div>
            </div>
            <div v-if="loading" class="message-bubble message-assistant">
              <q-spinner dots size="24px" color="primary" />
            </div>
          </div>
        </q-scroll-area>

        <q-separator />

        <q-card-section class="q-pa-md assistant-input">
          <q-input
            v-model="inputText"
            outlined
            dense
            placeholder="Escribe tu pregunta..."
            autogrow
            :maxlength="500"
            :disable="loading"
            @keydown.enter.prevent="sendMessage"
          >
            <template #after>
              <q-btn
                round
                dense
                flat
                icon="send"
                color="primary"
                :disable="!inputText.trim() || loading"
                @click="sendMessage"
              />
            </template>
          </q-input>
        </q-card-section>
      </q-card>
    </q-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import {
  assistantService,
  getAssistantErrorMessage,
} from '../../infrastructure/http/assistant/assistant.service';
import { useQuasar } from 'quasar';
import AssistantMessageText from './AssistantMessageText.vue';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  /** true cuando es el mensaje de límite de tokens/peticiones alcanzado (alerta roja). */
  isLimitError?: boolean;
}

const $q = useQuasar();
const drawerOpen = ref(false);
const inputText = ref('');
const messages = ref<Message[]>([]);
const loading = ref(false);
const quotaMessage = ref<string>('');

async function loadQuota() {
  try {
    const data = await assistantService.getQuota();
    quotaMessage.value = data.message || '';
  } catch {
    quotaMessage.value = '';
  }
}

async function sendMessage() {
  const text = inputText.value.trim();
  if (!text || loading.value) return;

  messages.value.push({ role: 'user', content: text });
  inputText.value = '';
  loading.value = true;

  try {
    const reply = await assistantService.sendMessage(text);
    messages.value.push({ role: 'assistant', content: reply });
    void loadQuota();
    await nextTick();
    const area = document.querySelector('.messages-area .q-scroll-area__container');
    if (area) {
      area.scrollTop = area.scrollHeight;
    }
  } catch (error) {
    const errorMessage = getAssistantErrorMessage(error);
    const isLimitError =
      errorMessage.includes('límite') ||
      errorMessage.includes('limit') ||
      errorMessage.includes('Límite');

    if (isLimitError) {
      messages.value.push({
        role: 'assistant',
        content: errorMessage,
        isLimitError: true,
      });
      await nextTick();
      const area = document.querySelector('.messages-area .q-scroll-area__container');
      if (area) {
        area.scrollTop = area.scrollHeight;
      }
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
}

watch(drawerOpen, (open) => {
  if (open && !quotaMessage.value) {
    void loadQuota();
  }
});
</script>

<style scoped lang="scss">
.assistant-chat {
  position: relative;
}

.assistant-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2000;
  transition: right 0.25s ease;
  &.fab-offset {
    right: 424px;
  }
}

@media (max-width: 500px) {
  .assistant-fab.fab-offset {
    right: 24px;
  }
}

.assistant-drawer :deep(.q-drawer__content) {
  display: flex;
  flex-direction: column;
}

.assistant-panel {
  min-height: 100%;
}

.assistant-header {
  flex-shrink: 0;
}

.messages-area {
  flex: 1;
  min-height: 0;
}

.assistant-input {
  flex-shrink: 0;
}

.message-bubble {
  max-width: 90%;
  padding: 10px 14px;
  border-radius: 12px;
  word-break: break-word;
}

.message-user {
  align-self: flex-end;
  background: var(--q-primary);
  color: white;
}

.message-assistant {
  align-self: flex-start;
  background: rgba(0, 0, 0, 0.06);
}

body.body--dark .message-assistant {
  background: rgba(255, 255, 255, 0.08);
}

.message-assistant-content :deep(a) {
  color: var(--q-primary);
  text-decoration: none;
  font-weight: 500;
}
.message-assistant-content :deep(a:hover) {
  text-decoration: underline;
}

.message-limit-error {
  background: rgba(179, 38, 30, 0.15);
  border: 1px solid rgba(179, 38, 30, 0.4);
}

body.body--dark .message-limit-error {
  background: rgba(244, 67, 54, 0.2);
  border-color: rgba(244, 67, 54, 0.5);
}

.message-limit-error-content {
  color: #b3261e;
  display: flex;
  align-items: flex-start;
  gap: 0.25rem;
}

body.body--dark .message-limit-error-content {
  color: #f44336;
}
</style>
