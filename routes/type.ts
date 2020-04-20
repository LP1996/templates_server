import { Router } from 'express'
import bodyParser from 'body-parser'
import { TypeListDTO } from '../dto/type'
import Result, { CODE } from '../Result'
import { stringify } from '../utils'
import service from '../services/type'

const router = Router()

router.get('/list', (req, res) => {
  service.list()
    .then(typeInfos => {
      const results = typeInfos.map(([type, desc]) => new TypeListDTO(type, desc))
      const response = Result.success<TypeListDTO[]>(results)
      res.end(stringify(response))
    })
    .catch(() => res.end(stringify(Result.error(CODE.SERVER_ERROR, '', 'get types wrong'))))
})

router.post('/add', bodyParser.urlencoded({ extended: true }), (req, res) => {
  const { name, description } = req.body

  if (!name || !description) {
    res.end(stringify(Result.error(CODE.PARAM_ERROR, '', 'params name or description must provide')))
    return
  }

  service.add(name, description)
    .then(() => res.end(stringify(Result.success('add type success'))))
    .catch(() => res.end(stringify(Result.error(CODE.SERVER_ERROR, '', 'add type fail'))))
})

router.post('/delete', bodyParser.urlencoded({ extended: true }), (req, res) => {
  const { name } = req.body

  if (!name) {
    res.end(stringify(Result.error(CODE.PARAM_ERROR, '', 'params name must provide')))
    return
  }

  service.delete(name)
    .then(() => res.end(stringify(Result.success('delete success'))))
    .catch(() => res.end(stringify(Result.error(CODE.SERVER_ERROR, '', 'delete fail'))))
})

export default router