import { Router } from 'express'
import bodyParser from 'body-parser'
import multer from 'multer'
import { ResourceListDTO } from '../dto/resource'
import Result, { CODE } from '../Result'
import { stringify } from '../utils'
import service from '../services/resource'

const router = Router()
const upload = multer().single('file')

router.get('/list', (req, res) => {
  const { query: { type } } = req

  if (!type) {
    res.end(stringify(Result.error(CODE.PARAM_ERROR, '', 'param type must provide')))
    return
  }

  service.list(type as string)
    .then(resourceInfos => {
      const result = resourceInfos.map(([resourceName, desc]) => new ResourceListDTO(resourceName, desc))
      const response = Result.success<ResourceListDTO[]>(result)
      res.end(stringify(response))
    })
    .catch(() => res.end(stringify(Result.error(CODE.SERVER_ERROR, '', 'get dir names wrong'))))
})

router.get('/versions', (req, res) => {
  const { query: { type, name } } = req

  if (!type || !name) {
    res.end(stringify(Result.error(CODE.PARAM_ERROR, '', 'param type or name must provide')))
    return
  }

  service.version(type as string, name as string)
    .then(versions => {
      res.end(stringify(Result.success(versions, 'success')))
    })
    .catch(() => res.end(stringify(Result.error(CODE.SERVER_ERROR, '', 'server error'))))
})

router.get('/down', (req, res) => {
  const { type, name, version } = req.query

  if (!type || !name) {
    res.end(stringify(Result.error(CODE.NOT_FOUND, '', 'must given both param type, name')))
    return
  }

  service.down(type as string, name as string, version as string || '')
    .then(filPath => res.sendFile(filPath))
    .catch(() => res.end(stringify(Result.error(CODE.NOT_FOUND, '', 'file not found'))))
})

router.post('/add', (req, res) => {
  upload(req, res, err => {
    if (err) {
      res.end(stringify(Result.error(CODE.PARAM_ERROR, '', 'lost param upload file, filed name is file')))
      return
    }

    const { body: { type, name, description }, file } = req

    if (!type || !name || !description) {
      res.end(stringify(Result.error(CODE.PARAM_ERROR, '', 'lost param type or description or name')))
      return
    }

    const [, ext] = file.originalname.split('.')

    if (ext !== 'zip') {
      res.end(Result.error(CODE.PARAM_ERROR, '', 'file must be zipped with .zip ext'))
      return
    }

    service.add({
      file,
      type,
      name,
      description
    }).then(() => res.end(stringify(Result.success('success'))))
      .catch(() => res.end(stringify(Result.error(CODE.SERVER_ERROR, '', 'save file error'))))
  })
})

router.post('/delete', bodyParser.urlencoded({ extended: true }), (req, res) => {
  const { type, name } = req.body

  if (!type || !name) {
    res.end(stringify(Result.error(CODE.PARAM_ERROR, '', 'param type or name must provide')))
    return
  }

  service.delete(type, name)
    .then(() => res.end(stringify(Result.success('delete resource success'))))
    .catch(() => res.end(stringify(Result.error(CODE.SERVER_ERROR, '', 'delete resource fail'))))
})
export default router