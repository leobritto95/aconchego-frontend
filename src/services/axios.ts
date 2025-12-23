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
      const url = error.config?.url || ''

      switch (status) {
        case 401:
          // Não redirecionar se estiver na página de login (para mostrar erro)
          if (!url.includes('/auth/login')) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
          }
          // Lançar erro com mensagem do servidor
          throw new Error(data?.message || 'Credenciais inválidas')
        case 403:
          throw new Error(data?.message || 'Acesso negado')
        case 404:
          throw new Error(data?.message || 'Recurso não encontrado')
        case 500:
          throw new Error(data?.message || 'Erro interno do servidor')
        default:
          throw new Error(data?.message || 'Erro desconhecido')
      }
    } else if (error.request) {
      console.error('Erro de conexão:', error.message)
      throw new Error('Erro de conexão. Verifique sua internet.')
    } else {
      console.error('Erro na requisição:', error.message)
      throw new Error('Erro na configuração da requisição')
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

    const apiResponse: ApiResponse<T> = {
      success: response.success ?? true,
      data: response.data as T,
      message: response.message || 'Operação realizada com sucesso'
    }

    // Se a resposta indica erro (success: false), lançar exceção para o React Query detectar
    if (!apiResponse.success) {
      const error = new Error(apiResponse.message || 'Erro desconhecido')
      throw error
    }

    return apiResponse
  } catch (error: any) {
    // Se já é um Error object com mensagem, re-lançar
    if (error instanceof Error) {
      throw error
    }

    // Caso contrário, criar erro com a mensagem
    const errorMessage = error.message || error?.response?.data?.message || 'Erro desconhecido'
    throw new Error(errorMessage)
  }
}

export default api 