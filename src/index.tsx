import { Context, Schema } from 'koishi'
import { Api } from './server/api'

export const name = 'alioss-connect'


export type Config = {
  region: string,  
  accessKeyId: string,  
  accessKeySecret: string,  
  bucket: string,
} & {
  ground?: Array<string>,
  uploader?: Array<string>,
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    accessKeyId: Schema.string().required().role('secret').description('阿里个人key配置'),
    accessKeySecret: Schema.string().required().role('secret').description('阿里个人私钥配置'),
    region: Schema.string().required().description('oss地域, 如 oss-cn-hangzhou'),
    bucket: Schema.string().required().description('oss的bucket配置'),
  }).description('OSS连接配置'),
  Schema.object({
    ground: Schema.array(String).role('table').description('允许使用该功能的群号'),
    uploader: Schema.array(String).role('table').description('允许使用上传功能的个人QQ号')

  }).description('白名单配置')
])

export function apply(ctx: Context, config: Config) {
  const api = new Api(config)

  ctx.command('上传群友语录 <message>')
    .action(async({session}, message) => {
      const allowUpload = config.uploader.includes(session.userId)
      if(!allowUpload) {
        return '您是?'
      }

      const groundId = session.guildId
      const images = session.elements.filter(element => element.type === 'img')
      if(!images.length) {
        return '请附带要上传的图片'
      }
      const imageUrl = images?.[0]?.attrs?.src
      console.log(imageUrl)

      if(imageUrl) {
        const ossUrl =  await api.uploadMeme(groundId, imageUrl)
        return `上传成功~`
      } 
    })

  ctx.command('群友语录')
    .action(async({session}, message) => {
      const groundId = session.guildId
      const memeUrl = await api.getGroundMeme(groundId)
      if(!memeUrl) {
        return '还没有上传过群友语录哦~'
      }
      return (
        <img  src={memeUrl} />
      )
    })
}
