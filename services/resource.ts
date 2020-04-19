import fs from 'fs'
import { Request, Response } from 'express-serve-static-core'
import { stringify, writeFile } from '../utils'
import config from '../config'
import Result, { CODE } from '../Result'

interface IUploadFormData {
  file: Express.Multer.File,
  type: string,
  description: string
}

class ResourceService {
  upload(req: Request, res: Response, formData: IUploadFormData) {
    const { file, type, description } = formData
    const { originalname, buffer } = file
    const [fileOriginName, ext] = originalname.split('.')

    const filename = `${config.RESOURCES_PATH}/${type}/${fileOriginName}_${Date.now()}.${ext}`
    try {
      writeFile(filename, buffer)
      res.end(stringify(Result.success('success')))
    } catch (err) {
      res.end(stringify(Result.error(CODE.SERVER_ERROR, '', 'save file error')))
    }
  }
}

export default new ResourceService()