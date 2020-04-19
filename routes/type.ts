import { Router } from 'express'
import { TypeDTO } from '../dto/type'
import Result from '../Result'
import { stringify } from '../utils'

const router = Router()

router.get('/list', (req, res) => {
  const results: TypeDTO[] = []
  results.push(new TypeDTO('t1', 't1'))
  results.push(new TypeDTO('t2', 't2'))
  results.push(new TypeDTO('t3', 't3'))
  const response = Result.success<TypeDTO[]>(results)
  res.end(stringify(response))
})

export default router