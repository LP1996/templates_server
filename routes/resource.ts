import path from 'path'
import fs from 'fs'
import { Router } from 'express'
import multer from 'multer'
import { ResourceListDTO } from '../dto/resource'
import Result, { CODE } from '../Result'
import { stringify, getDirNamesByPath } from '../utils'
import config from '../config'
import service from '../services/resource'

const router = Router()
const upload = multer().single('name')

router.get('/list', (req, res) => {
  const { query: { type } } = req

  if (!type) {
    res.end(stringify(Result.error(CODE.NOT_FOUND, '')))
    return
  }

  getDirNamesByPath(config.RESOURCES_PATH).then(dirNames => {
    const result = dirNames.map(dirName => new ResourceListDTO(dirName, dirName))
    const response = Result.success<ResourceListDTO[]>(result)
    res.end(stringify(response))
  }).catch(err => {
    res.end(Result.error(CODE.SERVER_ERROR, '', 'get dir names wrong'))
  })
})

router.get('/down', (req, res) => {
  const { type, name } = req.query

  if (!type || !name) {
    res.end(stringify(Result.error(CODE.NOT_FOUND, '', 'must given both param type, name')))
    return
  }

  res.sendFile(path.resolve(__dirname, '../../dist.zip'))
})

router.post('/upload', (req, res) => {
  upload(req, res, err => {
    if (err) {
      res.end(stringify(Result.error(CODE.PARAM_ERROR, '', 'lost param upload file, filed name is name')))
      return
    }

    const { body: { type, description }, file } = req

    if (!type || !description) {
      res.end(stringify(Result.error(CODE.PARAM_ERROR, '', 'lost param type or description')))
      return
    }

    const [fileOriginName, ext] = file.originalname.split('.')

    if (ext !== 'zip') {
      res.end(Result.error(CODE.PARAM_ERROR, '', 'file must be zipped with .zip ext'))
      return
    }

    service.upload(req, res, {
      file,
      type,
      description
    })
  })
})

export default router