import OSS from 'ali-oss'

import type { Config } from '../index' 

export const createConnect = (config: Config) => {
  const { region, accessKeyId, accessKeySecret, bucket } = config
  return new OSS({
    region,
    accessKeyId,
    accessKeySecret,
    bucket
  })
  

}