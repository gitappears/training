<template>
  <div class="image-gallery">
    <div
      v-if="images.length === 0"
      class="empty-state"
    >
      <q-icon
        name="image"
        size="48px"
        color="grey-5"
      />
      <div class="text-body2 text-grey-7 q-mt-sm">
        No hay imágenes para mostrar
      </div>
    </div>

    <div
      v-else
      class="gallery-grid"
      :class="`grid-cols-${columns}`"
    >
      <div
        v-for="(image, index) in images"
        :key="index"
        class="gallery-item"
        @click="openLightbox(index)"
      >
        <q-img
          :src="typeof image === 'string' ? image : image.src"
          :alt="typeof image === 'string' ? `Imagen ${index + 1}` : (image.alt || `Imagen ${index + 1}`)"
          :ratio="ratio"
          class="gallery-image"
          loading="lazy"
        >
          <template #loading>
            <div class="absolute-full flex flex-center">
              <q-spinner
                color="primary"
                size="2em"
              />
            </div>
          </template>
          <div class="absolute-full flex flex-center">
            <q-icon
              name="zoom_in"
              size="32px"
              color="white"
              class="zoom-icon"
            />
          </div>
        </q-img>
      </div>
    </div>

    <!-- Lightbox -->
    <q-dialog
      v-model="lightboxOpen"
      maximized
      transition-show="fade"
      transition-hide="fade"
    >
      <q-card class="lightbox-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ currentImage?.alt || `Imagen ${currentIndex + 1} de ${images.length}` }}
          </div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            @click="closeLightbox"
          />
        </q-card-section>

        <q-card-section class="lightbox-content">
          <q-img
            :src="currentImageSrc"
            :alt="currentImage?.alt || `Imagen ${currentIndex + 1}`"
            class="lightbox-image"
            fit="contain"
          >
            <template #loading>
              <div class="absolute-full flex flex-center">
                <q-spinner
                  color="white"
                  size="3em"
                />
              </div>
            </template>
          </q-img>
        </q-card-section>

        <q-card-actions
          v-if="images.length > 1"
          align="center"
        >
          <q-btn
            flat
            icon="chevron_left"
            :disable="currentIndex === 0"
            @click="previousImage"
          />
          <div class="text-body2 q-mx-md">
            {{ currentIndex + 1 }} / {{ images.length }}
          </div>
          <q-btn
            flat
            icon="chevron_right"
            :disable="currentIndex === images.length - 1"
            @click="nextImage"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

export interface GalleryImage {
  src: string;
  alt?: string;
  thumbnail?: string;
}

interface Props {
  images: (string | GalleryImage)[];
  columns?: number;
  ratio?: number | string;
  showLightbox?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  columns: 3,
  ratio: 1,
  showLightbox: true,
});

const lightboxOpen = ref(false);
const currentIndex = ref(0);

const currentImage = computed(() => {
  const img = props.images[currentIndex.value];
  if (!img) return { src: '' };
  return typeof img === 'string' ? { src: img } : img;
});

const currentImageSrc = computed(() => {
  const img = currentImage.value;
  if (!img || !img.src) return '';
  return img.src;
});

function openLightbox(index: number) {
  if (!props.showLightbox) return;
  currentIndex.value = index;
  lightboxOpen.value = true;
}

function closeLightbox() {
  lightboxOpen.value = false;
}

function nextImage() {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
  }
}

function previousImage() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}
</script>

<style scoped lang="scss">
.image-gallery {
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: 24px;
  }

  .gallery-grid {
    display: grid;
    gap: 16px;

    &.grid-cols-1 {
      grid-template-columns: repeat(1, 1fr);
    }

    &.grid-cols-2 {
      grid-template-columns: repeat(2, 1fr);
    }

    &.grid-cols-3 {
      grid-template-columns: repeat(3, 1fr);
    }

    &.grid-cols-4 {
      grid-template-columns: repeat(4, 1fr);
    }

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr) !important;
    }

    @media (max-width: 480px) {
      grid-template-columns: repeat(1, 1fr) !important;
    }
  }

  .gallery-item {
    position: relative;
    cursor: pointer;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

      .zoom-icon {
        opacity: 1;
      }
    }

    .gallery-image {
      border-radius: 8px;
    }

    .zoom-icon {
      opacity: 0;
      transition: opacity 0.2s;
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      padding: 8px;
    }
  }
}

.lightbox-card {
  background-color: rgba(0, 0, 0, 0.95);
  color: white;

  .lightbox-content {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 120px);
    padding: 24px;
  }

  .lightbox-image {
    max-width: 100%;
    max-height: calc(100vh - 120px);
  }
}
</style>

