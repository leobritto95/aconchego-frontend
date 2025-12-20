// TODO: Implementar busca de usuários via API /api/users/:id
// Por enquanto retorna fallback simples

/**
 * Busca o nome do aluno pelo ID
 * @param studentId - ID do aluno
 * @returns Nome do aluno ou "Aluno {ID}" se não encontrado
 * 
 * TODO: Implementar busca real via API /api/users/:id
 */
export function getStudentName(studentId: number): string {
  // Por enquanto retorna fallback
  // Futuramente: buscar do backend via /api/users/:id
  return `Aluno ${studentId}`;
}

/**
 * Busca o email do aluno pelo ID
 * @param studentId - ID do aluno
 * @returns Email do aluno ou null se não encontrado
 * 
 * TODO: Implementar busca real via API /api/users/:id
 */
export function getStudentEmail(studentId: number): string | null {
  // Por enquanto retorna null
  // Futuramente: buscar do backend via /api/users/:id
  return null;
}

/**
 * Busca todas as informações do aluno pelo ID
 * @param studentId - ID do aluno
 * @returns Objeto com informações do aluno ou null se não encontrado
 * 
 * TODO: Implementar busca real via API /api/users/:id
 */
export function getStudentInfo(studentId: number) {
  // Por enquanto retorna null
  // Futuramente: buscar do backend via /api/users/:id
  return null;
} 