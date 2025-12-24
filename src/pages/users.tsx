import { useState, useEffect, useMemo } from "react";
import { FiEye, FiEyeOff, FiEdit2, FiTrash2, FiPlus, FiSearch, FiX, FiUsers, FiUser, FiUserCheck, FiBriefcase, FiLock } from "react-icons/fi";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useUserCounts } from "../hooks/useUser";
import { useClasses } from "../hooks/useClasses";
import { toast } from "../utils/toast";
import { useAuth } from "../hooks/useAuth";
import { ConfirmModal } from "../components/confirm-modal";
import { User } from "../types";
import { CreateUserData, UpdateUserData } from "../services/userService";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: "student" | "teacher" | "secretary" | "admin";
  classIds: string[];
}

export function Users() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "student",
    classIds: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);
  const [classSearchTerm, setClassSearchTerm] = useState("");

  const { users, pagination, isLoading, refetch } = useUsers({
    search: searchTerm || undefined,
    role: roleFilter || undefined,
    page,
    limit: 10,
  });

  // Buscar contagens de usuários para estatísticas fixas
  const { counts } = useUserCounts();

  const { classes, isLoading: isLoadingClasses } = useClasses();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // Verificar permissão
  useEffect(() => {
    if (currentUser && !["secretary", "admin"].includes(currentUser.role)) {
      window.location.href = "/";
    }
  }, [currentUser]);

  // Fechar modal ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isCreateModalOpen && !createUserMutation.isPending) {
          setIsCreateModalOpen(false);
        }
        if (isEditModalOpen && !updateUserMutation.isPending) {
          setIsEditModalOpen(false);
        }
      }
    };

    if (isCreateModalOpen || isEditModalOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isCreateModalOpen, isEditModalOpen, createUserMutation.isPending, updateUserMutation.isPending]);

  const handleOpenCreateModal = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "student",
      classIds: [],
    });
    setClassSearchTerm("");
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      classIds: [],
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    try {
      const userData: CreateUserData = {
        name: formData.name,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        ...(formData.role === "student" && formData.classIds.length > 0 && { classIds: formData.classIds }),
      };

      const result = await createUserMutation.mutateAsync(userData);

      if (result.success) {
        toast.success("Usuário cadastrado com sucesso!");
        setIsCreateModalOpen(false);
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "student",
          classIds: [],
        });
        setClassSearchTerm("");
        refetch();
      }
    } catch (error: unknown) {
      // Tratamento específico para erro de email duplicado
      const httpError = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
      
      if (httpError.response?.status === 409) {
        toast.error("Este email já está cadastrado no sistema. Por favor, use outro email.");
        return;
      }

      const errorMessage =
        httpError?.response?.data?.message ||
        httpError?.message ||
        "Erro ao cadastrar usuário";
      toast.error(errorMessage);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    if (!formData.name || !formData.email || !formData.role) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    try {
      const updateData: UpdateUserData = {
        name: formData.name,
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        ...(formData.password && { password: formData.password }),
      };

      const result = await updateUserMutation.mutateAsync({
        id: selectedUser.id,
        userData: updateData,
      });

      if (result.success) {
        toast.success("Usuário atualizado com sucesso!");
        setIsEditModalOpen(false);
        setSelectedUser(null);
        refetch();
      }
    } catch (error: unknown) {
      // Tratamento específico para erro de email duplicado
      const httpError = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
      
      if (httpError.response?.status === 409) {
        toast.error("Este email já está cadastrado para outro usuário. Por favor, use outro email.");
        return;
      }

      const errorMessage =
        httpError?.response?.data?.message ||
        httpError?.message ||
        "Erro ao atualizar usuário";
      toast.error(errorMessage);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const result = await deleteUserMutation.mutateAsync(selectedUser.id);

      if (result.success) {
        toast.success("Usuário excluído com sucesso!");
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        refetch();
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Erro ao excluir usuário";
      toast.error(errorMessage);
    }
  };

  const handleClassToggle = (classId: string) => {
    setFormData((prev) => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter((id) => id !== classId)
        : [...prev.classIds, classId],
    }));
  };

  // Filtrar turmas baseado no termo de busca
  const filteredClasses = useMemo(() => {
    if (!classSearchTerm.trim()) return classes;
    const searchLower = classSearchTerm.toLowerCase().trim();
    return classes.filter((classItem) =>
      classItem.name.toLowerCase().includes(searchLower)
    );
  }, [classes, classSearchTerm]);

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      student: "Aluno",
      teacher: "Professor",
      secretary: "Secretário(a)",
      admin: "Administrador",
    };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      student: "bg-blue-100 text-blue-800",
      teacher: "bg-green-100 text-green-800",
      secretary: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  // Estatísticas fixas (baseadas na rota de count)
  const stats = useMemo(() => {
    if (!counts) return { total: 0, students: 0, teachers: 0, secretaries: 0, admins: 0 };
    
    return {
      total: counts.total || 0,
      students: counts.students || 0,
      teachers: counts.teachers || 0,
      secretaries: counts.secretaries || 0,
      admins: counts.admins || 0,
    };
  }, [counts]);

  if (!currentUser || !["secretary", "admin"].includes(currentUser.role)) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3 md:px-6 py-3 md:py-8">
      {/* Header */}
      <div className="mb-4 md:mb-8 flex items-center justify-between gap-3 md:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-4xl font-bold text-amber-900 mb-1 md:mb-2">Gerenciar Usuários</h1>
          <p className="text-gray-600 text-xs md:text-base hidden md:block">Gerencie todos os usuários do sistema</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 md:gap-2 bg-amber-900 text-white px-3 py-2 md:px-5 md:py-3 rounded-lg hover:bg-amber-800 transition-all font-medium text-sm md:text-base shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl flex-shrink-0"
        >
          <FiPlus size={18} className="md:w-5 md:h-5" />
          <span className="hidden sm:inline">Novo Usuário</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      {/* Estatísticas - Sempre visíveis com totais fixos */}
      <div className={`grid grid-cols-2 ${currentUser?.role === "admin" ? "md:grid-cols-5" : "md:grid-cols-4"} gap-2 md:gap-4 mb-4 md:mb-8`}>
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-2.5 md:p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 truncate">Total</p>
                <p className="text-lg md:text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-amber-100 p-1.5 md:p-3 rounded-md md:rounded-lg flex-shrink-0 ml-1">
                <FiUsers className="text-amber-900 w-4 h-4 md:w-6 md:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-2.5 md:p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 truncate">Alunos</p>
                <p className="text-lg md:text-3xl font-bold text-blue-600">{stats.students}</p>
              </div>
              <div className="bg-blue-100 p-1.5 md:p-3 rounded-md md:rounded-lg flex-shrink-0 ml-1">
                <FiUser className="text-blue-600 w-4 h-4 md:w-6 md:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-2.5 md:p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 truncate">Professores</p>
                <p className="text-lg md:text-3xl font-bold text-green-600">{stats.teachers}</p>
              </div>
              <div className="bg-green-100 p-1.5 md:p-3 rounded-md md:rounded-lg flex-shrink-0 ml-1">
                <FiUserCheck className="text-green-600 w-4 h-4 md:w-6 md:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-2.5 md:p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 truncate">Secretários(as)</p>
                <p className="text-lg md:text-3xl font-bold text-purple-600">{stats.secretaries}</p>
              </div>
              <div className="bg-purple-100 p-1.5 md:p-3 rounded-md md:rounded-lg flex-shrink-0 ml-1">
                <FiBriefcase className="text-purple-600 w-4 h-4 md:w-6 md:h-6" />
              </div>
            </div>
          </div>
          {currentUser?.role === "admin" && (
            <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-2.5 md:p-4 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 truncate">Admin</p>
                  <p className="text-lg md:text-3xl font-bold text-red-600">{stats.admins}</p>
                </div>
                <div className="bg-red-100 p-1.5 md:p-3 rounded-md md:rounded-lg flex-shrink-0 ml-1">
                  <FiLock className="text-red-600 w-4 h-4 md:w-6 md:h-6" />
                </div>
              </div>
            </div>
          )}
        </div>

      {/* Filtros */}
      <div className="mb-4 md:mb-6 bg-white rounded-lg md:rounded-xl shadow-sm p-3 md:p-5 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 md:pl-12 pr-9 md:pr-12 py-2 md:py-3 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
            )}
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none bg-white font-medium text-sm w-full md:w-auto md:min-w-[180px]"
          >
            <option value="">Todos os tipos</option>
            <option value="student">Aluno</option>
            <option value="teacher">Professor</option>
            <option value="secretary">Secretário(a)</option>
            {currentUser.role === "admin" && <option value="admin">Administrador</option>}
          </select>
        </div>
      </div>

      {/* Lista de usuários */}
      {isLoading ? (
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-8 md:p-16 text-center border border-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-amber-900 mx-auto mb-3 md:mb-4"></div>
          <p className="text-gray-600 font-medium text-sm md:text-base">Carregando usuários...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-8 md:p-16 text-center border border-gray-100">
          <FiUsers className="mx-auto text-gray-300 mb-3 md:mb-4 w-10 h-10 md:w-12 md:h-12" />
          <p className="text-gray-600 mb-1 md:mb-2 font-medium text-base md:text-lg">Nenhum usuário encontrado</p>
          <p className="text-gray-500 text-xs md:text-sm mb-4 md:mb-6">
            {searchTerm || roleFilter 
              ? "Tente ajustar os filtros de busca" 
              : "Comece cadastrando o primeiro usuário"}
          </p>
          {!searchTerm && !roleFilter && (
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 md:gap-2 bg-amber-900 text-white px-4 py-2 md:px-5 md:py-3 rounded-lg hover:bg-amber-800 transition-all font-medium text-sm md:text-base shadow-md hover:shadow-lg"
            >
              <FiPlus size={18} className="md:w-5 md:h-5" />
              Cadastrar Primeiro Usuário
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop: Tabela */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Nome</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Email</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user, index) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-amber-50/50 transition-colors duration-150"
                      style={{ animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` }}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{user.name}</span>
                          <span
                            className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600">{user.email}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all hover:scale-110"
                            title="Editar"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(user)}
                            className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-110"
                            title="Excluir"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: Cards */}
          <div className="md:hidden space-y-2.5">
            {users.map((user, index) => (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 hover:shadow-md transition-all"
                style={{ animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-base truncate">{user.name}</h3>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEditModal(user)}
                    className="flex-1 flex items-center justify-center gap-1.5 p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium text-xs"
                  >
                    <FiEdit2 size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(user)}
                    className="flex-1 flex items-center justify-center gap-1.5 p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium text-xs"
                  >
                    <FiTrash2 size={16} />
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 md:mt-8 bg-white rounded-lg md:rounded-xl shadow-sm p-3 md:p-5 border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4">
                <div className="text-xs md:text-sm text-gray-600 font-medium">
                  Página <span className="text-amber-900 font-bold">{page}</span> de{" "}
                  <span className="text-amber-900 font-bold">{pagination.totalPages}</span> •{" "}
                  <span className="text-amber-900 font-bold">{pagination.total || 0}</span> usuário(s)
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 md:px-5 py-1.5 md:py-2.5 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all text-xs md:text-sm font-medium disabled:hover:border-gray-300"
                  >
                    Anterior
                  </button>
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages: (number | string)[] = [];
                      const totalPages = pagination.totalPages;
                      const currentPage = page;
                      
                      if (totalPages <= 7) {
                        // Mostrar todas as páginas se houver 7 ou menos
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Lógica para muitas páginas
                        pages.push(1);
                        if (currentPage > 3) pages.push("...");
                        
                        const start = Math.max(2, currentPage - 1);
                        const end = Math.min(totalPages - 1, currentPage + 1);
                        
                        for (let i = start; i <= end; i++) {
                          if (i !== 1 && i !== totalPages) {
                            pages.push(i);
                          }
                        }
                        
                        if (currentPage < totalPages - 2) pages.push("...");
                        pages.push(totalPages);
                      }
                      
                      return pages.map((pageNum, idx) => {
                        if (pageNum === "...") {
                          return (
                            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum as number)}
                            className={`w-8 h-8 md:w-10 md:h-10 rounded-lg text-xs md:text-sm font-medium transition-all ${
                              page === pageNum
                                ? "bg-amber-900 text-white shadow-md"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      });
                    })()}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-3 md:px-5 py-1.5 md:py-2.5 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all text-xs md:text-sm font-medium disabled:hover:border-gray-300"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Criar Usuário */}
      {isCreateModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-[100] animate-in fade-in"
          onClick={() => !createUserMutation.isPending && setIsCreateModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg md:rounded-xl shadow-2xl p-4 md:p-8 max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto animate-in zoom-in-95 relative z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-200">
              <div className="flex-1 min-w-0 pr-2">
                <h2 className="text-lg md:text-3xl font-bold text-amber-900">Cadastrar Novo Usuário</h2>
                <p className="text-gray-600 text-xs md:text-sm mt-0.5 md:mt-1 hidden sm:block">Preencha os dados do novo usuário</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 md:p-2 rounded-lg transition-all flex-shrink-0"
              >
                <FiX size={20} className="md:w-6 md:h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 md:space-y-5">
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm"
                  required
                  placeholder="Digite o nome completo"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm"
                  required
                  placeholder="usuario@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Senha *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 pr-10 md:pr-12 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm"
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} className="md:w-5 md:h-5" /> : <FiEye size={18} className="md:w-5 md:h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Tipo *</label>
                <select
                  value={formData.role}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      role: e.target.value as "student" | "teacher" | "secretary" | "admin",
                      classIds: e.target.value !== "student" ? [] : formData.classIds,
                    });
                  }}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none bg-white transition-all font-medium text-sm"
                  required
                >
                  <option value="student">Aluno</option>
                  <option value="teacher">Professor</option>
                  <option value="secretary">Secretário(a)</option>
                  {currentUser.role === "admin" && <option value="admin">Administrador</option>}
                </select>
              </div>

              {formData.role === "student" && (
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                    Turmas (opcional)
                  </label>
                  {isLoadingClasses ? (
                    <div className="flex items-center gap-2 text-gray-500 text-xs md:text-sm py-2 md:py-3">
                      <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-amber-900"></div>
                      Carregando turmas...
                    </div>
                  ) : classes.length === 0 ? (
                    <p className="text-gray-500 text-xs md:text-sm py-2 md:py-3 bg-gray-50 rounded-lg px-3 md:px-4">Nenhuma turma disponível</p>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative z-10">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Buscar turmas..."
                          value={classSearchTerm}
                          onChange={(e) => setClassSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm bg-white"
                        />
                        {classSearchTerm && (
                          <button
                            onClick={() => setClassSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <FiX size={16} />
                          </button>
                        )}
                      </div>
                      <div className="max-h-40 md:max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 md:p-3 space-y-1.5 md:space-y-2 bg-gray-50">
                        {filteredClasses.length === 0 ? (
                          <p className="text-gray-500 text-xs md:text-sm py-2 md:py-3 text-center">
                            Nenhuma turma encontrada
                          </p>
                        ) : (
                          filteredClasses.map((classItem) => (
                            <label
                              key={classItem.id}
                              className="flex items-center space-x-2 md:space-x-3 cursor-pointer hover:bg-white p-2 md:p-3 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                            >
                              <input
                                type="checkbox"
                                checked={formData.classIds.includes(String(classItem.id))}
                                onChange={() => handleClassToggle(String(classItem.id))}
                                className="w-4 h-4 md:w-5 md:h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500 focus:ring-2 flex-shrink-0"
                              />
                              <span className="text-xs md:text-sm font-medium text-gray-700">{classItem.name}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 md:gap-4 pt-4 md:pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-3 md:px-5 py-2 md:py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium text-sm md:text-base transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="flex-1 bg-amber-900 text-white px-3 md:px-5 py-2 md:py-3 rounded-lg hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm md:text-base shadow-md hover:shadow-lg transition-all"
                >
                  {createUserMutation.isPending ? (
                    <span className="flex items-center justify-center gap-1.5 md:gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
                      <span className="text-xs md:text-base">Cadastrando...</span>
                    </span>
                  ) : (
                    "Cadastrar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Usuário */}
      {isEditModalOpen && selectedUser && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-[100] animate-in fade-in"
          onClick={() => !updateUserMutation.isPending && setIsEditModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg md:rounded-xl shadow-2xl p-4 md:p-8 max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto animate-in zoom-in-95 relative z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-200">
              <div className="flex-1 min-w-0 pr-2">
                <h2 className="text-lg md:text-3xl font-bold text-amber-900">Editar Usuário</h2>
                <p className="text-gray-600 text-xs md:text-sm mt-0.5 md:mt-1 hidden sm:block">Atualize as informações do usuário</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 md:p-2 rounded-lg transition-all flex-shrink-0"
              >
                <FiX size={20} className="md:w-6 md:h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3 md:space-y-5">
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm"
                  required
                  placeholder="Digite o nome completo"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm"
                  required
                  placeholder="usuario@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                  Nova Senha (opcional)
                </label>
                <div className="relative">
                  <input
                    type={showPasswordEdit ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 pr-10 md:pr-12 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm"
                    placeholder="Deixe em branco para não alterar"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordEdit(!showPasswordEdit)}
                    className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPasswordEdit ? <FiEyeOff size={18} className="md:w-5 md:h-5" /> : <FiEye size={18} className="md:w-5 md:h-5" />}
                  </button>
                </div>
                <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Tipo *</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as "student" | "teacher" | "secretary" | "admin",
                    })
                  }
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none bg-white transition-all font-medium text-sm"
                  required
                >
                  <option value="student">Aluno</option>
                  <option value="teacher">Professor</option>
                  <option value="secretary">Secretário(a)</option>
                  {currentUser.role === "admin" && <option value="admin">Administrador</option>}
                </select>
              </div>

              <div className="flex gap-2 md:gap-4 pt-4 md:pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-3 md:px-5 py-2 md:py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium text-sm md:text-base transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                  className="flex-1 bg-amber-900 text-white px-3 md:px-5 py-2 md:py-3 rounded-lg hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm md:text-base shadow-md hover:shadow-lg transition-all"
                >
                  {updateUserMutation.isPending ? (
                    <span className="flex items-center justify-center gap-1.5 md:gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
                      <span className="text-xs md:text-base">Salvando...</span>
                    </span>
                  ) : (
                    "Salvar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        title="Excluir Usuário"
        message={`Tem certeza que deseja excluir o usuário "${selectedUser?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
}

