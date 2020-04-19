import fs from 'fs'
import decompress = require('decompress');

export const stringify = (obj: any) => {
  try {
    return JSON.stringify(obj)
  } catch (e) {
    return ''
  }
}

export const getDirNamesByPath = async (path: string): Promise<string[]> => {
  const files = await fs.promises.readdir(path, { withFileTypes : true })
  const dirNames: string[] = []

  files.forEach(file => {
    file.isDirectory() && dirNames.push(file.name)
  })

  return dirNames
}

export const writeFile = async (path: string, data: Buffer | string) => {
  await fs.promises.writeFile(path, data)
}

export const readFile = async (path: string, mode: 'buffer' | 'string' = 'string') => {
  const buffer = await fs.promises.readFile(path)

  return mode === 'buffer' ? buffer : buffer.toString()
}
