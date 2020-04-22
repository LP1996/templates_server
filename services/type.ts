import path from 'path'
import fs from 'fs'
import config from '../config'
import { getDirNamesByPath, writeFile, deleteDir } from '../utils'

const DESC_FILE_NAME = 'description.txt'
const DEFAULT_TYPE = 'templates'

try {
  const defaultTypePath = `${config.TYPES_PATH}/${DEFAULT_TYPE}`
  if (!fs.existsSync(defaultTypePath)) {
    fs.mkdirSync(defaultTypePath)
    fs.writeFileSync(`${defaultTypePath}/${DESC_FILE_NAME}`, '项目模板')
  }
} catch (err) {
  console.error('generate default type fail')
}

class TypeService {
  async list() {
    try {
      const dirNames = await getDirNamesByPath(config.TYPES_PATH)
      const descriptions: string[] = []
      for (let i = 0; i < dirNames.length; i++) {
        const dirName = dirNames[i]
        const descFilePath = path.resolve(config.TYPES_PATH, `${dirName}/${DESC_FILE_NAME}`)

        try {
          const desc = await fs.promises.readFile(descFilePath)
          descriptions.push(desc.toString())
        } catch (err) {

          // 读取文件失败则使用 type 的名称作为 description
          descriptions.push(dirName)
        }
      }
  
      return dirNames.map((dirName, index) => [dirName, descriptions[index]])
    } catch (err) {
      throw err
    }
  }

  async add(name: string, description: string) {
    const typePath = path.resolve(config.TYPES_PATH, name)
    const descFilePath = path.resolve(typePath, DESC_FILE_NAME)
    try {
      await fs.promises.mkdir(typePath)
      writeFile(descFilePath, description)
    } catch (err) {
      throw err
    }
  }

  async delete(name: string) {
    const typePath = path.resolve(config.TYPES_PATH, name)
    try {
      deleteDir(typePath)
    } catch (err) {
      throw err
    }
  }
}

export default new TypeService()