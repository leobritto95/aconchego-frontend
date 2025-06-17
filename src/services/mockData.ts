import { User, Event, News, Feedback } from '../types';

// Mock Users
export const mockUsers: User[] = [
  { id: 1, email: 'aluno@email.com', name: 'João Silva', role: 'student' },
  { id: 2, email: 'professor@email.com', name: 'Maria Santos', role: 'teacher' },
  { id: 3, email: 'secretaria@email.com', name: 'Pedro Costa', role: 'secretary' },
  { id: 4, email: 'admin@email.com', name: 'Ana Oliveira', role: 'admin' },
];

// Mock Events
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Aula de Yoga',
    start: '2025-01-15T08:00:00',
    end: '2025-01-15T09:00:00',
    backgroundColor: '#D1FAE5',
    borderColor: '#059669',
    description: 'Aula de yoga para iniciantes com foco em relaxamento e flexibilidade.'
  },
  {
    id: '2',
    title: 'Consulta Médica',
    start: '2025-01-15T10:00:00',
    end: '2025-01-15T11:00:00',
    backgroundColor: '#E0E7FF',
    borderColor: '#4F46E5',
    description: 'Consulta de rotina com Dr. Carlos Mendes.'
  },
  {
    id: '3',
    title: 'Terapia em Grupo',
    start: '2025-01-16T14:00:00',
    end: '2025-01-16T15:30:00',
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
    description: 'Sessão de terapia em grupo focada em ansiedade social.'
  },
  {
    id: '4',
    title: 'Avaliação Psicológica',
    start: '2025-01-17T09:00:00',
    end: '2025-01-17T10:30:00',
    backgroundColor: '#FCE7F3',
    borderColor: '#EC4899',
    description: 'Avaliação psicológica inicial com Dra. Fernanda Lima.'
  },
  {
    id: '5',
    title: 'Workshop de Meditação',
    start: '2025-01-18T16:00:00',
    end: '2025-01-18T17:30:00',
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
    description: 'Workshop prático de técnicas de meditação mindfulness.'
  }
];

// Mock News
export const mockNews: News[] = [
  {
    id: 1,
    title: 'Novos Horários de Atendimento',
    content: 'A partir de janeiro de 2025, nossos horários de atendimento foram expandidos. Agora atendemos de segunda a sexta-feira, das 8h às 20h, e aos sábados das 8h às 12h. Esta mudança visa melhorar o acesso aos nossos serviços e proporcionar maior flexibilidade para nossos pacientes.',
    publishedAt: '2025-01-10T10:00:00',
    author: 'Equipe Aconchego',
    imageUrl: '/images/horarios.jpg'
  },
  {
    id: 2,
    title: 'Workshop de Bem-estar Mental',
    content: 'No próximo mês, realizaremos um workshop especial sobre bem-estar mental e técnicas de relaxamento. O evento será gratuito e aberto a todos os interessados. Serão abordados temas como ansiedade, estresse e práticas de mindfulness para o dia a dia.',
    publishedAt: '2025-01-08T14:30:00',
    author: 'Dr. Carlos Mendes',
    imageUrl: '/images/workshop.jpg'
  },
  {
    id: 3,
    title: 'Nova Terapeuta na Equipe',
    content: 'Temos o prazer de anunciar a chegada da Dra. Fernanda Lima à nossa equipe. Especialista em terapia cognitivo-comportamental, a Dra. Fernanda trará novos conhecimentos e abordagens para complementar nossos serviços.',
    publishedAt: '2025-01-05T09:15:00',
    author: 'Direção Aconchego',
    imageUrl: '/images/equipe.jpg'
  },
  {
    id: 4,
    title: 'Resultados do Programa de Apoio',
    content: 'O programa de apoio psicológico implementado no último semestre apresentou resultados muito positivos. 85% dos participantes relataram melhora significativa em seus sintomas de ansiedade e depressão.',
    publishedAt: '2025-01-03T16:45:00',
    author: 'Equipe de Pesquisa',
    imageUrl: '/images/resultados.jpg'
  },
  {
    id: 5,
    title: 'Dicas para Manter a Saúde Mental',
    content: 'Com a chegada do novo ano, é importante estabelecer metas realistas e cuidar da saúde mental. Separamos algumas dicas práticas: mantenha uma rotina regular, pratique exercícios físicos, mantenha contato social e reserve tempo para atividades que você gosta.',
    publishedAt: '2025-01-01T08:00:00',
    author: 'Equipe Aconchego',
    imageUrl: '/images/dicas.jpg'
  }
];

// Mock Feedback
export const mockFeedbacks: Feedback[] = [
  {
    id: 1,
    style: 'Forró',
    class: 'Turma X',
    date: '2024-10-06',
    grade: 2.6,
    status: 'rejected',
    evaluatorFeedback: 'O aluno demonstrou dificuldades na coordenação rítmica e na execução dos passos básicos. Recomenda-se mais prática individual e aulas de reforço.',
    parameters: {
      parameter1: 3,
      parameter2: 2,
      parameter3: 3,
      parameter4: 2,
      parameter5: 3
    }
  },
  {
    id: 2,
    style: 'Forró',
    class: 'Turma X',
    date: '2024-10-06',
    grade: 4.0,
    status: 'approved',
    evaluatorFeedback: 'Excelente desempenho! O aluno demonstrou domínio técnico e expressão artística. Continue praticando para manter o nível.',
    parameters: {
      parameter1: 4,
      parameter2: 4,
      parameter3: 4,
      parameter4: 4,
      parameter5: 4
    }
  },
  {
    id: 3,
    style: 'Jazz',
    class: 'Turma Z',
    date: '2024-12-10',
    grade: 2.0,
    status: 'rejected',
    evaluatorFeedback: 'O aluno precisa melhorar significativamente na técnica e na interpretação musical. Sugere-se retomar os fundamentos básicos.',
    parameters: {
      parameter1: 2,
      parameter2: 2,
      parameter3: 2,
      parameter4: 2,
      parameter5: 2
    }
  },
  {
    id: 4,
    style: 'Samba',
    class: 'Turma A',
    date: '2024-11-15',
    grade: 3.8,
    status: 'approved',
    evaluatorFeedback: 'Bom desempenho geral. O aluno demonstrou boa técnica e ritmo. Pode melhorar na expressão facial e corporal.',
    parameters: {
      parameter1: 4,
      parameter2: 4,
      parameter3: 3,
      parameter4: 4,
      parameter5: 4
    }
  },
  {
    id: 5,
    style: 'Bolero',
    class: 'Turma B',
    date: '2024-09-20',
    grade: 3.2,
    status: 'approved',
    evaluatorFeedback: 'Desempenho satisfatório. O aluno demonstrou compreensão dos conceitos básicos. Continue praticando para aprimorar a técnica.',
    parameters: {
      parameter1: 3,
      parameter2: 3,
      parameter3: 3,
      parameter4: 4,
      parameter5: 3
    }
  }
];

// Mock data para filtros
export const mockStyles = ['Forró', 'Jazz', 'Samba', 'Bolero', 'Tango', 'Valsa'];
export const mockClasses = ['Turma A', 'Turma B', 'Turma X', 'Turma Z', 'Turma Y'];
export const mockYears = ['2024', '2023', '2022', '2021']; 