import axios, { AxiosError, AxiosResponse } from 'axios'
import { ApiResponse } from '../types'

// Cria instância do axios com configuração base
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação
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

// Interceptor para tratamento de respostas
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Retorna apenas os dados da resposta
    return response.data
  },
  (error: AxiosError) => {
    // Tratamento de erros
    if (error.response) {
      // Erro do servidor (status 4xx, 5xx)
      const status = error.response.status
      const data = error.response.data as any

      switch (status) {
        case 401:
          // Token expirado ou inválido
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
      // Erro de rede
      console.error('Erro de conexão:', error.message)
      return Promise.reject({
        success: false,
        message: 'Erro de conexão. Verifique sua internet.',
        status: 0
      })
    } else {
      // Erro na configuração da requisição
      console.error('Erro na requisição:', error.message)
      return Promise.reject({
        success: false,
        message: 'Erro na configuração da requisição',
        status: 0
      })
    }
  }
)

// Função helper para fazer requisições tipadas
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
    })

    return {
      success: true,
      data: response.data,
      message: (response as any).message || 'Operação realizada com sucesso'
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