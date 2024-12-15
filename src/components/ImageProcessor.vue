<template>
  <div class="image-processor">
    <div class="upload-section">
      <input 
        type="file" 
        accept="image/*" 
        @change="handleFileUpload"
        ref="fileInput"
        style="display: none"
      >
      <button class="upload-button" @click="$refs.fileInput.click()">
        <Icon><CloudUpload /></Icon>
        选择图片
      </button>
    </div>

    <div v-if="originalImage" class="preview-section">
      <div class="preview-card original-image">
        <div class="card-header">
          <Icon><ImageIcon /></Icon>
          <h3>原图预览</h3>
        </div>
        <img 
          :src="originalImage" 
          alt="Original" 
          @click="showPreview(originalImage)"
          class="clickable"
        >
      </div>
      
      <div v-if="processedImage" class="preview-card processed-image">
        <div class="card-header">
          <Icon><ImageIcon /></Icon>
          <h3>处理后预览</h3>
        </div>
        <img 
          :src="processedImage" 
          alt="Processed" 
          @click="showPreview(processedImage)"
          class="clickable"
        >
        <button class="download-button" @click="downloadImage">
          <Icon><Download /></Icon>
          下载图片
        </button>
      </div>
    </div>

    <div v-if="exifData" class="exif-info">
      <div class="card-header">
        <Icon><InformationCircle /></Icon>
        <h3>EXIF信息</h3>
      </div>
      <ul>
        <li v-for="(value, key) in exifData" :key="key">
          {{ getDisplayLabel(key) }}: {{ value }}
        </li>
      </ul>
    </div>

    <ImagePreview
      :visible="previewVisible"
      :imageUrl="previewImage || ''"
      @close="closePreview"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import * as exifr from 'exifr'
import type { Template } from '../types/template'
import ImagePreview from './ImagePreview.vue'
import { 
  CloudUpload, 
  Download, 
  Image as ImageIcon,
  InformationCircle
} from '@vicons/ionicons5'
import { Icon } from '@vicons/utils'

const props = defineProps<{
  template: Template | null
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const originalImage = ref<string | null>(null)
const processedImage = ref<string | null>(null)
const exifData = ref<Record<string, any> | null>(null)
const currentFile = ref<File | null>(null)
const previewVisible = ref(false)
const previewImage = ref<string | null>(null)

// 监听模板变化，重新处理图片
watch(() => props.template, async () => {
  if (currentFile.value && props.template) {
    await processImage(currentFile.value)
  }
}, { deep: true })

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  console.log('选择的文件:', file.name, file.type)
  
  currentFile.value = file
  originalImage.value = URL.createObjectURL(file)
  
  try {
    await processImage(file)
  } catch (error) {
    console.error('处理图片时出错:', error)
    alert('处理图片时出错，请重试')
  }
}

const processImage = async (file: File) => {
  // 获取EXIF数据
  exifData.value = await getExifData(file)
  console.log('获取到的EXIF数据:', exifData.value)
  
  // 创建canvas
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建canvas上下文')
  
  // 加载原始图片
  const img = await loadImage(file)
  
  // 根据模板设置canvas尺寸
  const { width, height } = calculateCanvasSize(img, props.template)
  canvas.width = width
  canvas.height = height
  
  // 应用模板样式
  applyTemplateStyle(ctx, props.template)
  
  // 根据模板位置绘制图片和信息
  await drawImageWithTemplate(ctx, img, exifData.value, props.template)
  
  // 输出处理后的图片
  processedImage.value = canvas.toDataURL(file.type || 'image/jpeg', 1.0)
}

const getExifData = async (file: File) => {
  try {
    const exif = await exifr.parse(file, {
      pick: ['Make', 'Model', 'FNumber', 'ExposureTime', 'ISO', 'FocalLength'],
    })
    
    return {
      make: exif?.Make || '未知',
      model: exif?.Model || '未知',
      fNumber: exif?.FNumber ? `f/${exif.FNumber}` : '未知',
      exposureTime: exif?.ExposureTime ? `${exif.ExposureTime}s` : '未知',
      iso: exif?.ISO || '未知',
      focalLength: exif?.FocalLength ? `${exif.FocalLength}mm` : '未知'
    }
  } catch (error) {
    console.error('读取EXIF数据时出错:', error)
    return null
  }
}

const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => resolve(img)
    img.onerror = reject
  })
}

const calculateCanvasSize = (img: HTMLImageElement, template: Template | null) => {
  if (!template) {
    return { width: img.width, height: img.height }
  }

  const { position, width, height } = template.watermark
  
  switch (position) {
    case 'bottom':
    case 'top':
      return {
        width: img.width,
        height: img.height + (typeof height === 'number' ? height : 200)
      }
    case 'left':
    case 'right':
      return {
        width: img.width + (typeof width === 'number' ? width : 300),
        height: img.height
      }
  }
}

const applyTemplateStyle = (ctx: CanvasRenderingContext2D, template: Template | null) => {
  if (!template?.style) return
  
  const { font, fontSize, color, opacity } = template.style
  
  ctx.font = `${fontSize || 20}px ${font || 'Arial'}`
  ctx.fillStyle = color || '#000000'
  ctx.globalAlpha = opacity || 1
  console.log('应用样式:', { font, fontSize, color, opacity })
}

const drawImageWithTemplate = async (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  exifData: Record<string, any> | null,
  template: Template | null
) => {
  if (!template || !exifData) {
    ctx.drawImage(img, 0, 0)
    return
  }

  const { position, width, height, padding = 20, backgroundColor = '#ffffff' } = template.watermark
  
  // 重置透明度
  ctx.globalAlpha = 1
  
  // 绘制背景
  ctx.fillStyle = backgroundColor
  
  // 根据模板位置绘制
  switch (position) {
    case 'bottom':
      ctx.drawImage(img, 0, 0)
      ctx.fillRect(0, img.height, ctx.canvas.width, height)
      // 重新应用样式
      applyTemplateStyle(ctx, template)
      drawExifInfo(ctx, exifData, img.height + padding)
      break
      
    case 'top':
      ctx.fillRect(0, 0, ctx.canvas.width, height)
      ctx.drawImage(img, 0, height)
      // 重新应用样式
      applyTemplateStyle(ctx, template)
      drawExifInfo(ctx, exifData, padding)
      break
      
    case 'right':
      ctx.drawImage(img, 0, 0)
      ctx.fillRect(img.width, 0, width, ctx.canvas.height)
      // 重新应用样式
      applyTemplateStyle(ctx, template)
      drawExifInfo(ctx, exifData, padding, img.width + padding)
      break
      
    case 'left':
      ctx.fillRect(0, 0, width, ctx.canvas.height)
      ctx.drawImage(img, width, 0)
      // 重新应用样式
      applyTemplateStyle(ctx, template)
      drawExifInfo(ctx, exifData, padding, padding)
      break
  }
}

const drawExifInfo = (
  ctx: CanvasRenderingContext2D,
  exifData: Record<string, any>,
  startY: number,
  startX: number = 20
) => {
  let y = startY
  console.log('开始绘制EXIF信息:', { startX, startY, exifData })
  Object.entries(exifData).forEach(([key, value]) => {
    if (value) {
      const label = getDisplayLabel(key)
      const text = `${label}: ${value}`
      ctx.fillText(text, startX, y)
      console.log('绘制文本:', { text, x: startX, y })
      y += 30
    }
  })
}

const getDisplayLabel = (key: string): string => {
  const labels: Record<string, string> = {
    make: '相机品牌',
    model: '相机型号',
    fNumber: '光圈',
    exposureTime: '快门速度',
    iso: 'ISO',
    focalLength: '焦距'
  }
  return labels[key] || key
}

const downloadImage = () => {
  if (!processedImage.value || !currentFile.value) return
  
  const link = document.createElement('a')
  link.download = `processed_${currentFile.value.name}`
  link.href = processedImage.value
  link.click()
}

const showPreview = (imageUrl: string) => {
  previewImage.value = imageUrl
  previewVisible.value = true
}

const closePreview = () => {
  previewVisible.value = false
  previewImage.value = null
}
</script>

<style scoped>
.image-processor {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.upload-button {
  background-color: var(--primary-color);
  font-size: 1rem;
}

.download-button {
  margin-top: 16px;
  width: 100%;
}

.preview-section {
  display: flex;
  gap: 30px;
}

.original-image, .processed-image {
  flex: 1;
  min-width: 0;
  min-width: 400px;
  position: relative;
}

img {
  width: 100%;
  height: auto;
  border-radius: 4px;
  min-height: 300px;
  object-fit: contain;
  background: var(--background-light);
}

.exif-info {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.exif-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.exif-info li {
  padding: 8px 12px;
  background: var(--background-light);
  border-radius: 4px;
  color: var(--text-secondary);
}

.clickable {
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
}

.clickable::after {
  content: '点击查看大图';
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.clickable:hover::after {
  opacity: 1;
}

.upload-section input[type="file"] {
  display: none;
}
</style> 