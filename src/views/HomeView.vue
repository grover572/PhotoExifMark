<template>
  <div class="home">
    <div class="layout">
      <div class="sidebar">
        <TemplateSelector
          :templates="templates"
          :selectedTemplate="selectedTemplate"
          @select="handleTemplateSelect"
        />
        <StyleEditor
          v-if="selectedTemplate"
          :template="selectedTemplate"
          @update="handleStyleUpdate"
        />
      </div>
      <div class="main-content">
        <ImageProcessor
          :template="selectedTemplate"
          ref="imageProcessor"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Template } from '../types/template'
import { PRESET_TEMPLATES } from '../constants/templates'
import TemplateSelector from '../components/TemplateSelector.vue'
import StyleEditor from '../components/StyleEditor.vue'
import ImageProcessor from '../components/ImageProcessor.vue'

const templates = ref<Template[]>(PRESET_TEMPLATES)
const selectedTemplate = ref<Template | null>(PRESET_TEMPLATES[0])
const imageProcessor = ref<InstanceType<typeof ImageProcessor> | null>(null)

const handleTemplateSelect = (template: Template) => {
  selectedTemplate.value = template
}

const handleStyleUpdate = (updatedTemplate: Template) => {
  selectedTemplate.value = { ...updatedTemplate }
}
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 1800px;
  margin: 0 auto;
}

.layout {
  display: flex;
  gap: 30px;
}

.sidebar {
  width: 350px;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  min-width: 0;
  min-width: 800px;
}
</style>
