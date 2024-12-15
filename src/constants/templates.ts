import type { Template } from '../types/template'

export const PRESET_TEMPLATES: Template[] = [
  {
    id: 'bottom-strip',
    name: '底部条状',
    preview: '/templates/bottom.png',
    layout: 'horizontal',
    watermark: {
      position: 'bottom',
      height: 200,
      width: '100%',
      padding: 20,
      backgroundColor: '#ffffff'
    },
    style: {
      font: 'Arial',
      fontSize: 20,
      color: '#000000',
      opacity: 1
    }
  },
  {
    id: 'right-panel',
    name: '右侧面板',
    preview: '/templates/right.png',
    layout: 'vertical',
    watermark: {
      position: 'right',
      width: 300,
      height: '100%',
      padding: 20,
      backgroundColor: '#f5f5f5'
    },
    style: {
      font: 'Arial',
      fontSize: 20,
      color: '#333333',
      opacity: 1
    }
  }
] 