import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo.png";
import { FiEye, FiEyeOff } from 'react-icons/fi';

// Mocked users for each role
const MOCK_USERS = [
  { id: 1, email: 'student@gmail.com', password: '123456', name: 'User Estudante', role: 'student' },
  { id: 2, email: 'teacher@gmail.com', password: '123456', name: 'User Professor', role: 'teacher' },
  { id: 3, email: 'secretary@gmail.com', password: '123456', name: 'User Secretaria', role: 'secretary' },
  { id: 4, email: 'admin@gmail.com', password: '123456', name: 'User Administrador', role: 'admin' },
];

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }));
      navigate('/');
    } else {
      setError('Email ou senha inválidos');
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
          <p className="text-sm text-gray-600 mt-2">Faça login para continuar</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-900 transition-colors duration-300"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-amber-900 text-white py-3 px-4 rounded-lg hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-medium"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
} 