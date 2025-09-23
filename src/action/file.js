import {downloadFile} from '@/api/file'
import {getAppId} from '@/utils/auth.js'
import { XMLParser } from "fast-xml-parser";

const getXmlToJson = (xml) => {
  const parser = new XMLParser({
    ignoreAttributes: false, // 不忽略属性
    attributeNamePrefix: '', // 移除默认的属性前缀
  });
  let jObj = parser.parse(xml);
  return jObj
}

export const toFileBox = async (xml, type = 2) => {
  try{
    if(type === 0 || type > 3){
      console.log('图片下载的 type 为 1-高清大图 2-常规图 3-缩略图')
      return null
    }
    const obj = getXmlToJson(xml)
    const big = obj.msg.img.cdnbigimgurl || ''
    const medium = obj.msg.img.cdnmidimgurl || ''
    // const small = obj.msg.img.cdnthumburl || ''
    if(type === 1 && big === ''){
      console.log('图片无高清图，自动转为下载常规图')
      type = 2
    }
    if(type === 2 && medium === ''){
      console.log('图片无常规图，自动转为下载缩略图')
      type = 3
    }
    const {fileUrl} = await downloadFile({
      appId: getAppId(),
      xml,
      type
    })
    // const url = joinURL(FileBaseUrl, fileUrl)
    return fileUrl
  }catch(e){
    console.error(e)
  }
    
  
}