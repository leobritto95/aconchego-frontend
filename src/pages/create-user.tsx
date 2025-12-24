import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useCreateUser } from "../hooks/useUser";
import { useClasses } from "../hooks/useClasses";
import { toast } from "../utils/toast";
import { useAuth } from "../hooks/useAuth";
import { CreateUserData } from "../services/userService";

export function CreateUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "secretary" | "admin">("student");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { classes, isLoading: isLoadingClasses } = useClasses();
  const createUserMutation = useCreateUser();

  useEffect(() => {
    if (user && !["secretary", "admin"].includes(user.role)) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !role) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      const userData: CreateUserData = {
        name,
        email,
        password,
        role,
        ...(role === "student" && selectedClasses.length > 0 && { classIds: selectedClasses }),
      };

      const result = await createUserMutation.mutateAsync(userData);

      if (result.success) {
        toast.success("Usuário cadastrado com sucesso!");
        // Limpar formulário
        setName("");
        setEmail("");
        setPassword("");
        setRole("student");
        setSelectedClasses([]);
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Erro ao cadastrar usuário";
      toast.error(errorMessage);
    }
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  if (!user || !["secretary", "admin"].includes(user.role)) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-amber-900 mb-6">
          Cadastrar Novo Usuário
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 outline-none"
              placeholder="Nome completo"
              required
              disabled={createUserMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 outline-none"
              placeholder="seu@email.com"
              required
              disabled={createUserMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 outline-none"
                placeholder="••••••••"
                required
                disabled={createUserMutation.isPending}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-900 transition-colors duration-300"
                disabled={createUserMutation.isPending}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Tipo de Usuário *
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => {
                const newRole = e.target.value as "student" | "teacher" | "secretary" | "admin";
                setRole(newRole);
                if (newRole !== "student") {
                  setSelectedClasses([]);
                }
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 outline-none"
              required
              disabled={createUserMutation.isPending}
            >
              <option value="student">Aluno</option>
              <option value="teacher">Professor</option>
              <option value="secretary">Secretário(a)</option>
              {user.role === "admin" && <option value="admin">Administrador</option>}
            </select>
          </div>

          {role === "student" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Turmas (opcional)
              </label>
              {isLoadingClasses ? (
                <p className="text-gray-500 text-sm">Carregando turmas...</p>
              ) : classes.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma turma disponível</p>
              ) : (
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-4 space-y-2">
                  {classes.map((classItem) => (
                    <label
                      key={classItem.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(String(classItem.id))}
                        onChange={() => handleClassToggle(String(classItem.id))}
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                        disabled={createUserMutation.isPending}
                      />
                      <span className="text-sm text-gray-700">{classItem.name}</span>
                    </label>
                  ))}
                </div>
              )}
              {selectedClasses.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {selectedClasses.length} turma(s) selecionada(s)
                </p>
              )}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={createUserMutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createUserMutation.isPending}
              className="flex-1 bg-amber-900 text-white py-3 px-4 rounded-lg hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createUserMutation.isPending ? "Cadastrando..." : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

