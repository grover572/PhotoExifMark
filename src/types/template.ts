export type WatermarkPosition = {
  position: 'top' | 'bottom' | 'left' | 'right'
  width: number | string
  height: number | string
  padding?: number
  backgroundColor?: string
}

export type Template = {
  id: string
  name: string
  preview: string
  layout: 'horizontal' | 'vertical'
  watermark: WatermarkPosition
  style?: {
    font?: string
    fontSize?: number
    color?: string
    background?: string
    opacity?: number
  }
} 