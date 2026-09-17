export class ApiError extends Error {
  status: number
  code: string
  constructor(message: string, status = 500, code = 'INTERNAL_ERROR') {
    super(message)
    this.status = status
    this.code = code
  }
}
export function errorBody(code: string, message: string) {
  return { error: { code, message } }
}
