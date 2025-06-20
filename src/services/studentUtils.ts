import { mockUsers } from './mockData';

/**
 * Busca o nome do aluno pelo ID
 * @param studentId - ID do aluno
 * @returns Nome do aluno ou "Aluno {ID}" se não encontrado
 */
export function getStudentName(studentId: number): string {
  const student = mockUsers.find(user => user.id === studentId);
  return student ? student.name : `Aluno ${studentId}`;
}

/**
 * Busca o email do aluno pelo ID
 * @param studentId - ID do aluno
 * @returns Email do aluno ou null se não encontrado
 */
export function getStudentEmail(studentId: number): string | null {
  const student = mockUsers.find(user => user.id === studentId);
  return student ? student.email : null;
}

/**
 * Busca todas as informações do aluno pelo ID
 * @param studentId - ID do aluno
 * @returns Objeto com informações do aluno ou null se não encontrado
 */
export function getStudentInfo(studentId: number) {
  return mockUsers.find(user => user.id === studentId) || null;
} 