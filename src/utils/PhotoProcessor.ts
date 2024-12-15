import * as exifr from 'exifr'

export default class PhotoProcessor {
  async processImage(file: File): Promise<string> {
    try {
      // 1. 读取EXIF数据
      const exifData = await this.getExifData(file)
      
      // 2. 创建canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('无法创建canvas上下文')
      
      // 3. 加载原始图片
      const originalImage = await this.loadImage(file)
      
      // 4. 设置canvas尺寸（原图 + 边框）
      canvas.width = originalImage.width
      canvas.height = originalImage.height + 200
      
      // 5. 使用更好的图像平滑算法
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // 6. 绘制白色背景
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 7. 绘制原图
      ctx.drawImage(originalImage, 0, 0, originalImage.width, originalImage.height)
      
      // 8. 添加EXIF信息
      this.drawExifInfo(ctx, exifData, originalImage.height)
      
      // 9. 使用原始格式和最高质量输出
      return canvas.toDataURL(file.type || 'image/jpeg', 1.0)
    } catch (error) {
      console.error('处理图片时出错:', error)
      throw new Error('图片处理失败，请尝试其他图片')
    }
  }
  
  async getExifData(file: File): Promise<Record<string, any>> {
    try {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        return {
          error: '不是有效的图片文件'
        }
      }

      console.log('开始解析EXIF，文件类型:', file.type);

      // 先尝试读取所有EXIF数据看看有什么
      const allExif = await exifr.parse(file);
      console.log('所有EXIF数据:', allExif);

      // 尝试读取EXIF数据
      const exif = await exifr.parse(file, {
        // 扩展标签列表
        pick: [
          'Make', 'Model', 'FNumber', 'ExposureTime', 'ISO', 
          'ISOSpeedRatings', 'ExposureProgram', 'FocalLength',
          'ApertureValue', 'ShutterSpeedValue'
        ],
        // 启用所有可能的数据块
        tiff: true,
        xmp: true,
        iptc: true,
        icc: true
      })

      console.log('解析到的EXIF数据:', exif);

      // 如果没有读取到EXIF数据
      if (!exif) {
        console.log('未读取到EXIF数据');
        return {
          warning: '未能读取到EXIF信息',
          make: '未知',
          model: '未知',
          fNumber: '未知',
          exposureTime: '未知',
          iso: '未知'
        }
      }

      // 格式化快门速度
      const formatShutterSpeed = (exposureTime: number) => {
        if (!exposureTime) return '未知'
        if (exposureTime >= 1) {
          return `${exposureTime}s`
        } else {
          // 将小数转换为分数
          const denominator = Math.round(1 / exposureTime)
          return `1/${denominator}s`
        }
      }

      return {
        make: exif.Make || '未知',
        model: exif.Model || '未知',
        fNumber: exif.FNumber ? `f/${exif.FNumber}` : '未知',
        exposureTime: formatShutterSpeed(exif.ExposureTime),
        iso: exif.ISO || '未知',
        focalLength: exif.FocalLength ? `${exif.FocalLength}mm` : '未知'
      }
    } catch (error) {
      console.error('读取EXIF数据时出错:', error);
      return {
        error: '读取EXIF信息失败',
        make: '未知',
        model: '未知'
      }
    }
  }
  
  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      
      img.onload = () => {
        // 检查图片尺寸是否超过限制
        const maxSize = 4096 // 一般浏览器的限制
        if (img.width > maxSize || img.height > maxSize) {
          console.warn('图片尺寸过大，可能影响质量')
        }
        resolve(img)
      }
      
      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }
    })
  }
  
  private drawExifInfo(
    ctx: CanvasRenderingContext2D, 
    exifData: Record<string, any>, 
    startY: number
  ): void {
    ctx.font = '20px Arial'
    ctx.fillStyle = 'black'
    
    let y = startY + 30
    
    // 处理错误信息
    if (exifData.error) {
      ctx.fillStyle = 'red'
      ctx.fillText(`提示: ${exifData.error}`, 20, y)
      return
    }
    
    // 处理警告信息
    if (exifData.warning) {
      ctx.fillStyle = 'orange'
      ctx.fillText(`提示: ${exifData.warning}`, 20, y)
      y += 30
      ctx.fillStyle = 'black'
    }
    
    // 显示EXIF信息
    Object.entries(exifData).forEach(([key, value]) => {
      if (value && key !== 'warning' && key !== 'error') {
        const label = this.getDisplayLabel(key)
        ctx.fillText(`${label}: ${value}`, 20, y)
        y += 30
      }
    })
  }

  private getDisplayLabel(key: string): string {
    const labels: Record<string, string> = {
      make: '相机品牌',
      model: '相机型号',
      fNumber: '光圈',
      exposureTime: '快门速度',
      iso: 'ISO'
    }
    return labels[key] || key
  }
} 