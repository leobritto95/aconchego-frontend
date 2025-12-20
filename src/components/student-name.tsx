import { useUserById } from '../hooks/useUser'

interface StudentNameProps {
  studentId: string | number
}

export function StudentName({ studentId }: StudentNameProps) {
  const { user, isLoading } = useUserById(studentId)

  if (isLoading) {
    return <span className="text-gray-400">Carregando...</span>
  }

  return <span>{user?.name || `Aluno ${studentId}`}</span>
}

