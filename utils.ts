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

export const deleteDir = (path: string) => {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path);
    files.forEach(file => {
      const curPath = `${path}/${file}`
      fs.statSync(curPath).isDirectory() ? deleteDir(curPath) : fs.unlinkSync(curPath)
    })
    fs.rmdirSync(path)
  }
}

export const getDirFiles = (path: string) => {
  return fs.readdirSync(path, { withFileTypes: true })
}

export const dateFormat = (format: string, date?: Date) => {
  const dateObj = date ? date : new Date()


  // M: 月份    d: 日    h: 小时    m: 分钟    s: 秒
  const map: { [index: string]: number } = {
    'M+' : dateObj.getMonth() + 1,
    'd+' : dateObj.getDate(),
    'h+' : dateObj.getHours(),
    'm+' : dateObj.getMinutes(), 
    's+' : dateObj.getSeconds()
  }

  if(/(y+)/.test(format)) {
    format=format.replace(RegExp.$1, (dateObj.getFullYear() + '').substr(4 - RegExp.$1.length));
  }

  for(let k in map) {
    if(new RegExp('('+ k +')').test(format)) {
      const numberStr = `${map[k]}`
      format = format.replace(RegExp.$1, (RegExp.$1.length === 1)
        ? numberStr : (`00${numberStr}`).substr(numberStr.length))
    }
  }

  return format
}