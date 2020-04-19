export enum CODE {
  SUCCESS = 200,
  PARAM_ERROR = 400,
  NOT_FOUND = 404,
  SERVER_ERROR = 500
}

export default class Result {
  public static success<T>(res: T, msg?: string) {
    return {
      code: CODE.SUCCESS,
      data: res,
      msg: msg || 'success'
    }
  }

  public static error<T>(code: number, res: T, msg?: string) {
    return {
      code,
      data: res,
      msg: msg || 'error'
    }
  }
}