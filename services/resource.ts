import fs from 'fs'
import path from 'path'
import { writeFile, getDirNamesByPath, deleteDir } from '../utils'
import config from '../config'

interface IUploadFormData {
  file: Express.Multer.File,
  type: string,
  name: string,
  description: string
}

const DESC_FILE_NAME = 'description.txt'

class ResourceService {
  async add(formData: IUploadFormData) {
    const { file, type, name, description } = formData
    const { originalname, buffer } = file
    const [fileOriginName, ext] = originalname.split('.')

    const resourceRootPath = `${config.TYPES_PATH}/${type}/${name}`
    const filename = `${resourceRootPath}/${fileOriginName}_${Date.now()}.${ext}`
    const descPath = `${resourceRootPath}/${DESC_FILE_NAME}`

    try {
      if (!fs.existsSync(resourceRootPath)) {
        fs.mkdirSync(resourceRootPath)
      }

      await writeFile(filename, buffer)
      writeFile(descPath, description)
    } catch (err) {
      throw err
    }
  }

  async list(type: string) {
    const typeRootPath = path.resolve(config.TYPES_PATH, type)
    try {
      const resourceNames = await getDirNamesByPath(typeRootPath)
      const resourceDescs: string[] = []

      for (let i = 0; i < resourceNames.length; i++) {
        const resourceName = resourceNames[i]
        const resourceDescPath = path.resolve(config.TYPES_PATH, `${type}/${resourceName}/${DESC_FILE_NAME}`)

        try {
          const desc = await fs.promises.readFile(resourceDescPath)
          resourceDescs.push(desc.toString())
        } catch (err) {

          // 没有找到 description 文件则使用 resourceName 作为 description
          resourceDescs.push(resourceName)
        }
      }

      return resourceNames.map((resourceName, index) => [resourceName, resourceDescs[index]])
    } catch (err) {
      throw err
    }
  }

  async down(typeName: string, resourceName: string, version?: string) {
    const resourceRootPath = path.resolve(config.TYPES_PATH, `${typeName}/${resourceName}`)

    try {
      await fs.promises.access(resourceRootPath, fs.constants.F_OK | fs.constants.R_OK)
      const files = await fs.promises.readdir(resourceRootPath)
      const resourceFiles = files.filter(file => file !== DESC_FILE_NAME)

      if (version && !fs.existsSync(`${resourceRootPath}/${version}`)) {
        throw new Error('file not exists')
      }

      let filepath = ''
      
      if (version) {
        filepath = `${resourceRootPath}/${version}`
      } else {
        resourceFiles.sort((a: any, b: any) => b - a)
        filepath = `${resourceRootPath}/${resourceFiles[0]}`
      }
      return filepath
    } catch (err) {
      throw err
    }
  }
  
  async delete(type: string, name: string) {
    const resourceRootPath = `${config.TYPES_PATH}/${type}/${name}`
    deleteDir(resourceRootPath)
  }
}

export default new ResourceService()