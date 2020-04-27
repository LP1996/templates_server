import fs from 'fs'
import path from 'path'
import { writeFile, getDirNamesByPath, deleteDir, dateFormat, getDirFiles, readFile } from '../utils'
import config from '../config'

interface IUploadFormData {
  file: Express.Multer.File,
  type: string,
  name: string,
  description: string
}

interface IChangelog {
  date: string,
  type: '新增' | '更新',
  filename: string,
  description: string
}

const DESC_FILE_NAME = 'description.txt'
const CHANGE_LOG_FILE_NAME = 'changelog.json'
const FILE_SEPARATOR = '_'

class ResourceService {
  // 更新也调用此接口
  async add(formData: IUploadFormData) {
    const { file, type, name, description } = formData
    const { originalname, buffer } = file
    const [fileOriginName, ext] = originalname.split('.')

    const resourceRootPath = `${config.TYPES_PATH}/${type}/${name}`
    const changedFileName = `${fileOriginName}${FILE_SEPARATOR}${Date.now()}.${ext}`
    const filename = `${resourceRootPath}/${changedFileName}`
    const descPath = `${resourceRootPath}/${DESC_FILE_NAME}`
    const changelogPath = `${resourceRootPath}/${CHANGE_LOG_FILE_NAME}`

    try {
      const isRootExists = fs.existsSync(resourceRootPath)

      if (!isRootExists) {
        fs.mkdirSync(resourceRootPath)
      }

      await writeFile(filename, buffer)
      writeFile(descPath, description)

      // 写入 changelog
      const changelog: IChangelog = {
        date: dateFormat('yyyy-MM-dd hh:mm:ss'),
        type: isRootExists ? '更新' : '新增',
        filename: changedFileName,
        description
      }

      let changelogArr = []
      if (isRootExists) {
        const changelog = fs.readFileSync(changelogPath)
        changelogArr = JSON.parse(changelog.toString('utf8'))
      }

      changelogArr.push(changelog)
      const changelogArrStr = JSON.stringify(changelogArr)
      writeFile(changelogPath, Buffer.from(changelogArrStr, 'utf8'))
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

  async version(type: string, name: string) {
    const changelogFilePath = `${config.TYPES_PATH}/${type}/${name}/${CHANGE_LOG_FILE_NAME}`

    if (!fs.existsSync(changelogFilePath)) {
      return Promise.reject('no versions log')
    }
    
    try {
      const changelogArrStr = await readFile(changelogFilePath)
      const changelogArr: IChangelog[] = JSON.parse(changelogArrStr.toString('utf8'))
      return changelogArr
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