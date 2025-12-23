import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { loginAsync, isLoggingIn, loginError } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await loginAsync({ email, password });

      if (result.success) {
        navigate("/");
      }
    } catch (error) {
      // Erro já é tratado pelo React Query
      console.error("Erro no login:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-96 transform transition-all duration-300 hover:shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <img
            src={logo}
            alt="Aconchego"
            className="h-28 w-auto object-contain mb-6 transform transition-transform duration-300 hover:scale-105"
          />
          <h1 className="text-3xl font-bold text-amber-900">Bem-vindo</h1>
          <p className="text-sm text-gray-600 mt-2">
            Faça login para continuar
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 outline-none"
              placeholder="seu@email.com"
              required
              disabled={isLoggingIn}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
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
                disabled={isLoggingIn}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-900 transition-colors duration-300"
                disabled={isLoggingIn}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {loginError && (
            <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              {loginError.message || "Erro no login"}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-amber-900 text-white py-3 px-4 rounded-lg hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
