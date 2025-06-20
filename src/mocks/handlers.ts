import { http, HttpResponse } from 'msw'
import { mockUsers, mockEvents, mockNews, mockFeedbacks, mockStyles, mockClasses } from '../services/mockData'

// Simula delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Simula erro de rede ocasional
const simulateNetworkError = () => {
  if (Math.random() < 0.05) { // 5% de chance de erro
    throw new Error('Erro de conexão. Tente novamente.')
  }
}

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    try {
      simulateNetworkError()
      await delay(800)

      const body = await request.json() as { email: string; password: string }
      const { email, password } = body

      const user = mockUsers.find(u => u.email === email)

      if (!user) {
        return HttpResponse.json(
          { success: false, message: 'Usuário não encontrado' },
          { status: 404 }
        )
      }

      if (password !== '123456') {
        return HttpResponse.json(
          { success: false, message: 'Senha incorreta' },
          { status: 401 }
        )
      }

      const token = `mock-jwt-token-${user.id}-${Date.now()}`

      return HttpResponse.json({
        success: true,
        data: { user, token },
        message: 'Login realizado com sucesso'
      })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Erro de conexão. Tente novamente.' },
        { status: 500 }
      )
    }
  }),

  http.post('/api/auth/logout', async () => {
    await delay(200)
    return HttpResponse.json({
      success: true,
      data: { success: true },
      message: 'Logout realizado com sucesso'
    })
  }),

  http.get('/api/auth/validate', async ({ request }) => {
    try {
      simulateNetworkError()
      await delay(300)

      const authHeader = request.headers.get('Authorization')
      const token = authHeader?.replace('Bearer ', '')

      if (!token || !token.startsWith('mock-jwt-token-')) {
        return HttpResponse.json(
          { success: false, message: 'Token inválido' },
          { status: 401 }
        )
      }

      // Simula retorno do usuário atual
      const user = mockUsers[0]

      return HttpResponse.json({
        success: true,
        data: user,
        message: 'Token válido'
      })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Erro de conexão. Tente novamente.' },
        { status: 500 }
      )
    }
  }),

  // Events endpoints
  http.get('/api/events', async ({ request }) => {
    try {
      simulateNetworkError()
      await delay(300)

      const url = new URL(request.url)
      const start = url.searchParams.get('start')
      const end = url.searchParams.get('end')

      // Filtra eventos por período se fornecido
      let filteredEvents = mockEvents
      if (start && end) {
        filteredEvents = mockEvents.filter(event => {
          const eventStart = new Date(event.start)
          return eventStart >= new Date(start) && eventStart <= new Date(end)
        })
      }

      return HttpResponse.json({
        success: true,
        data: filteredEvents,
        message: 'Eventos carregados com sucesso'
      })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Erro de conexão. Tente novamente.' },
        { status: 500 }
      )
    }
  }),

  // News endpoints
  http.get('/api/news', async ({ request }) => {
    try {
      simulateNetworkError()
      await delay(300)

      const url = new URL(request.url)
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '10')

      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const data = mockNews.slice(startIndex, endIndex)
      const total = mockNews.length

      return HttpResponse.json({
        success: true,
        data: {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        message: 'Notícias carregadas com sucesso'
      })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Erro de conexão. Tente novamente.' },
        { status: 500 }
      )
    }
  }),

  // Feedback endpoints
  http.get('/api/feedback', async ({ request }) => {
    try {
      simulateNetworkError()
      await delay(300)

      const url = new URL(request.url)
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const style = url.searchParams.get('style')
      const classFilter = url.searchParams.get('class')
      const startDate = url.searchParams.get('startDate')
      const endDate = url.searchParams.get('endDate')
      const userId = url.searchParams.get('userId')

      let filteredFeedbacks = mockFeedbacks

      // Filtra por userId se fornecido (para alunos que só podem ver seus próprios feedbacks)
      if (userId) {
        const userIdNum = parseInt(userId)
        filteredFeedbacks = filteredFeedbacks.filter(f => f.studentId === userIdNum)
      }

      if (style) {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.style === style)
      }

      if (classFilter) {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.class === classFilter)
      }

      if (startDate) {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.date >= startDate)
      }

      if (endDate) {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.date <= endDate)
      }

      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const data = filteredFeedbacks.slice(startIndex, endIndex)
      const total = filteredFeedbacks.length

      return HttpResponse.json({
        success: true,
        data: {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        message: 'Feedbacks carregados com sucesso'
      })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Erro de conexão. Tente novamente.' },
        { status: 500 }
      )
    }
  }),

  // Nova rota para buscar turmas agrupadas por data
  http.get('/api/feedback/classes', async ({ request }) => {
    try {
      simulateNetworkError()
      await delay(300)

      const url = new URL(request.url)
      const style = url.searchParams.get('style')
      const classFilter = url.searchParams.get('class')
      const startDate = url.searchParams.get('startDate')
      const endDate = url.searchParams.get('endDate')

      // Filtra feedbacks baseado nos parâmetros
      let filteredFeedbacks = mockFeedbacks

      if (style) {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.style === style)
      }

      if (classFilter) {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.class === classFilter)
      }

      if (startDate) {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.date >= startDate)
      }

      if (endDate) {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.date <= endDate)
      }

      const grouped: { [key: string]: { classId: number; className: string; style: string; date: string; count: number } } = {}

      filteredFeedbacks.forEach((feedback) => {
        const key = `${feedback.classId}-${feedback.style}-${feedback.date}`
        if (!grouped[key]) {
          grouped[key] = {
            classId: feedback.classId,
            className: feedback.class,
            style: feedback.style,
            date: feedback.date,
            count: 0
          }
        }
        grouped[key].count++
      })

      // Converte para array e ordena por data (mais recente primeiro)
      const classes = Object.values(grouped)
        .map(item => ({
          classId: item.classId,
          className: item.className,
          style: item.style,
          date: item.date,
          feedbackCount: item.count
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      return HttpResponse.json({
        success: true,
        data: classes,
        message: 'Turmas agrupadas carregadas com sucesso'
      })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Erro de conexão. Tente novamente.' },
        { status: 500 }
      )
    }
  }),

  // Nova rota para buscar turmas agrupadas do aluno
  http.get('/api/feedback/student/classes', async ({ request }) => {
    try {
      simulateNetworkError()
      await delay(300)

      const url = new URL(request.url)
      const userId = url.searchParams.get('userId')
      const style = url.searchParams.get('style')
      const classFilter = url.searchParams.get('class')
      const startDate = url.searchParams.get('startDate')
      const endDate = url.searchParams.get('endDate')

      if (!userId) {
        return HttpResponse.json(
          { success: false, message: 'ID do usuário é obrigatório' },
          { status: 400 }
        )
      }

      // Filtra feedbacks do usuário específico
      let filteredFeedbacks = mockFeedbacks.filter(f => f.studentId === parseInt(userId))

      if (style) {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.style === style)
      }

      if (classFilter) {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.class === classFilter)
      }

      if (startDate) {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.date >= startDate)
      }

      if (endDate) {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.date <= endDate)
      }

      const grouped: { [key: string]: { classId: number; className: string; style: string; date: string; count: number } } = {}

      filteredFeedbacks.forEach((feedback) => {
        const key = `${feedback.classId}-${feedback.style}-${feedback.date}`
        if (!grouped[key]) {
          grouped[key] = {
            classId: feedback.classId,
            className: feedback.class,
            style: feedback.style,
            date: feedback.date,
            count: 0
          }
        }
        grouped[key].count++
      })

      // Converte para array e ordena por data (mais recente primeiro)
      const classes = Object.values(grouped)
        .map(item => ({
          classId: item.classId,
          className: item.className,
          style: item.style,
          date: item.date,
          feedbackCount: item.count
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      return HttpResponse.json({
        success: true,
        data: classes,
        message: 'Turmas agrupadas do aluno carregadas com sucesso'
      })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Erro de conexão. Tente novamente.' },
        { status: 500 }
      )
    }
  }),

  // Nova rota para buscar feedbacks de uma turma específica por ID
  http.get('/api/feedback/class/:classId', async ({ params }) => {
    try {
      simulateNetworkError()
      await delay(300)

      const classId = parseInt(params.classId as string)

      const feedbacks = mockFeedbacks.filter(f => f.classId === classId)

      return HttpResponse.json({
        success: true,
        data: feedbacks,
        message: 'Feedbacks da turma carregados com sucesso'
      })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Erro de conexão. Tente novamente.' },
        { status: 500 }
      )
    }
  }),

  http.get('/api/feedback/:id', async ({ params }) => {
    try {
      simulateNetworkError()
      await delay(300)

      const id = parseInt(params.id as string)
      const feedback = mockFeedbacks.find(f => f.id === id)

      if (!feedback) {
        return HttpResponse.json(
          { success: false, message: 'Feedback não encontrado' },
          { status: 404 }
        )
      }

      // Verifica permissões do usuário
      const userStr = localStorage.getItem('user')

      if (userStr) {
        try {
          const user = JSON.parse(userStr)

          // Se é aluno, só pode ver seus próprios feedbacks
          if (user.role === 'student' && user.id !== feedback.studentId) {
            return HttpResponse.json(
              { success: false, message: 'Acesso negado. Você só pode ver seus próprios feedbacks.' },
              { status: 403 }
            )
          }

          // Admin, professor e secretaria podem ver qualquer feedback
          // (não precisa de verificação adicional)
        } catch (error) {
          // Se não conseguir parsear o usuário, continua normalmente
        }
      }

      return HttpResponse.json({
        success: true,
        data: feedback,
        message: 'Feedback carregado com sucesso'
      })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Erro de conexão. Tente novamente.' },
        { status: 500 }
      )
    }
  }),

  // Filter options endpoints
  http.get('/api/filters/styles', async () => {
    await delay(200)
    return HttpResponse.json({
      success: true,
      data: mockStyles,
      message: 'Estilos carregados com sucesso'
    })
  }),

  http.get('/api/filters/classes', async () => {
    await delay(200)
    return HttpResponse.json({
      success: true,
      data: mockClasses.map(c => c.name),
      message: 'Turmas carregadas com sucesso'
    })
  })
] 