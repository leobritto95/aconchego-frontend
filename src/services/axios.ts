import axios, { AxiosError, AxiosResponse } from 'axios'
import { ApiResponse } from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status
      const data = error.response.data as any

      switch (status) {
        case 401:
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          break
        case 403:
          console.error('Acesso negado')
          break
        case 404:
          console.error('Recurso não encontrado')
          break
        case 500:
          console.error('Erro interno do servidor')
          break
        default:
          console.error('Erro desconhecido:', data?.message || error.message)
      }

      return Promise.reject({
        success: false,
        message: data?.message || 'Erro desconhecido',
        status
      })
    } else if (error.request) {
      console.error('Erro de conexão:', error.message)
      return Promise.reject({
        success: false,
        message: 'Erro de conexão. Verifique sua internet.',
        status: 0
      })
    } else {
      console.error('Erro na requisição:', error.message)
      return Promise.reject({
        success: false,
        message: 'Erro na configuração da requisição',
        status: 0
      })
    }
  }
)

export const apiRequest = async <T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any,
  params?: any
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.request({
      method,
      url,
      data,
      params,
    }) as any

    return {
      success: response.success ?? true,
      data: response.data as T,
      message: response.message || 'Operação realizada com sucesso'
    }
  } catch (error: any) {
    return {
      success: false,
      data: null as T,
      message: error.message || 'Erro desconhecido'
    }
  }
}

export default api 