import OSS from 'ali-oss'
import axios from 'axios'
import path from 'path'

import { Config } from '../index'
import { createConnect } from './connect'

export class Api {
  private client: OSS
  private prefix = 'group-friends-meme'

  constructor(private config: Config) {
    this.client = createConnect(config)
  }


  async getBucketsInfo() {
    try {
      const result = await this.client.listBuckets({})
      if(result) {
        console.log('连接oss成功')
      }
    } catch(error) {
      console.log('连接oss失败:', error)
    }
  }

  async getListFile(options: {  
    prefix?: string,        // 指定目录前缀  
    maxKeys?: number,       // 单次返回的最大数量  
    marker?: string,        // 分页标记,
    'max-keys': number      // 单次返回最大数量 
  } = { prefix: this.prefix, "max-keys": 100 }) {
    try {
      const result = await this.client.list(options, { timeout: 4000 })
      console.log(result)
    } catch(error) {
      console.log('获取bucket文件列表失败:', error)
    }
  }

  async getGroundMeme(groundId) {
    try {
      const ossPath = `${this.prefix}/${groundId}/`
      const result = await this.client.list({  
        prefix: ossPath,  
        'max-keys': 1000 // 设置一次获取的最大文件数  
      }, { timeout: 4000 })

      const memeList = result.objects

      if(memeList.length === 0) {
        return null
      }

      const randomIndex = Math.floor(Math.random() * memeList.length)
      const targetMeme = memeList[randomIndex]
      return targetMeme.url
    } catch(error) {
      console.log('获取oss图片失败:', error)
    }
  }

  async uploadMeme(groundId, imageUrl) {
    try {
      // 获取图片
      const { data, headers } = await axios({
        method: 'get',
        url: imageUrl,
        responseType: 'arraybuffer'
      }) 

      // QQ的图片地址需要做额外处理
      const contentType = headers['content-type'];  
      let ext = 'jpg'

      // 根据 Content-Type 设置正确的扩展名  
      if (contentType) {  
        switch(contentType.toLowerCase()) {  
          case 'image/jpeg':  
          case 'image/jpg':  
            ext = 'jpg';  
            break;  
          case 'image/png':  
            ext = 'png';  
            break;  
          case 'image/gif':  
            ext = 'gif';  
            break;  
          case 'image/webp':  
            ext = 'webp';  
            break;  
        }  
      }
      const filename = `${Date.now()}.${ext}`
      const ossPath = `${this.prefix}/${groundId}/${filename}`
      const result = await this.client.put(ossPath, Buffer.from(data))
      return result.url
      
    } catch(error) {
      console.log('上传图片失败', error)
    }
  }
}