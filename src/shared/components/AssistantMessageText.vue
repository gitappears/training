<template>
  <div class="assistant-message">
    <template v-for="(block, blockIndex) in blocks" :key="blockIndex">
      <ol v-if="block.type === 'list'" class="assistant-list">
        <li v-for="(item, itemIndex) in block.items" :key="itemIndex" class="assistant-list-item">
          <span v-for="(part, partIndex) in getParts(item)" :key="partIndex">
            <router-link
              v-if="part.type === 'link' && isInternal(part.url)"
              :to="part.url"
              class="assistant-link"
            >
              {{ part.text }}
            </router-link>
            <a
              v-else-if="part.type === 'link'"
              :href="part.url"
              target="_blank"
              rel="noopener noreferrer"
              class="assistant-link"
            >
              {{ part.text }}
            </a>
            <template v-else>
              <template v-for="(seg, segIndex) in getTextSegments(part.text)" :key="segIndex">
                <strong v-if="seg.type === 'bold'">{{ seg.text }}</strong>
                <span v-else>{{ seg.text }}</span>
              </template>
            </template>
          </span>
        </li>
      </ol>
      <div v-else class="assistant-paragraph">
        <template v-for="(part, partIndex) in getParts(block.text)" :key="partIndex">
          <router-link
            v-if="part.type === 'link' && isInternal(part.url)"
            :to="part.url"
            class="assistant-link"
          >
            {{ part.text }}
          </router-link>
          <a
            v-else-if="part.type === 'link'"
            :href="part.url"
            target="_blank"
            rel="noopener noreferrer"
            class="assistant-link"
          >
            {{ part.text }}
          </a>
          <span v-else>
            <template v-for="(seg, segIndex) in getTextSegments(part.text)" :key="segIndex">
              <strong v-if="seg.type === 'bold'">{{ seg.text }}</strong>
              <span v-else>{{ seg.text }}</span>
            </template>
          </span>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  text: string;
}>();

const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

interface Part {
  type: 'text' | 'link';
  text: string;
  url?: string;
}

interface Block {
  type: 'list' | 'paragraph';
  items?: string[];
  text?: string;
}

/** Detecta listas numeradas (1. texto, 2. texto) y las separa en bloques. */
const blocks = computed((): Block[] => {
  const result: Block[] = [];
  const lines = props.text.split(/\r?\n/);
  const numberedLineRegex = /^(\d+)\.\s+(.*)$/;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const match = line.match(numberedLineRegex);
    if (match) {
      const listItems: string[] = [match[2].trim()];
      i += 1;
      while (i < lines.length && lines[i].match(numberedLineRegex)) {
        const m = lines[i].match(numberedLineRegex);
        if (m) listItems.push(m[2].trim());
        i += 1;
      }
      result.push({ type: 'list', items: listItems });
    } else {
      const paragraphLines: string[] = [];
      while (i < lines.length && !lines[i].match(numberedLineRegex)) {
        paragraphLines.push(lines[i]);
        i += 1;
      }
      const text = paragraphLines.join('\n').trim();
      if (text) {
        result.push({ type: 'paragraph', text });
      }
    }
  }
  return result;
});

function getParts(source: string): Part[] {
  const result: Part[] = [];
  let lastIndex = 0;
  const re = new RegExp(linkRegex.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    if (m.index > lastIndex) {
      result.push({ type: 'text', text: source.slice(lastIndex, m.index) });
    }
    result.push({ type: 'link', text: m[1], url: m[2] });
    lastIndex = re.lastIndex;
  }
  if (lastIndex < source.length) {
    result.push({ type: 'text', text: source.slice(lastIndex) });
  }
  if (result.length === 0 && source) {
    result.push({ type: 'text', text: source });
  }
  return result;
}

interface TextSegment {
  type: 'text' | 'bold';
  text: string;
}

/** Convierte **texto** en segmentos text/bold para renderizar con <strong>. */
function getTextSegments(source: string): TextSegment[] {
  const result: TextSegment[] = [];
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = boldRegex.exec(source)) !== null) {
    if (match.index > lastIndex) {
      result.push({ type: 'text', text: source.slice(lastIndex, match.index) });
    }
    result.push({ type: 'bold', text: match[1] });
    lastIndex = boldRegex.lastIndex;
  }
  if (lastIndex < source.length) {
    result.push({ type: 'text', text: source.slice(lastIndex) });
  }
  if (result.length === 0 && source) {
    result.push({ type: 'text', text: source });
  }
  return result;
}

function isInternal(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//');
}
</script>

<style scoped>
.assistant-message {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.assistant-list {
  margin: 0;
  padding-left: 1.25rem;
  list-style-type: decimal;
}

.assistant-list-item {
  margin-bottom: 0.5rem;
  padding-left: 0.25rem;
}

.assistant-list-item:last-child {
  margin-bottom: 0;
}

.assistant-paragraph {
  white-space: pre-line;
}

.assistant-link {
  color: var(--q-primary);
  text-decoration: none;
  font-weight: 500;
}

.assistant-link:hover {
  text-decoration: underline;
}
</style>
