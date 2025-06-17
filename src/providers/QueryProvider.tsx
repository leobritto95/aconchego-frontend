import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode } from "react";

// Cria uma instância do QueryClient com configurações otimizadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tempo de cache padrão (5 minutos)
      staleTime: 5 * 60 * 1000,
      // Tempo de cache em background (10 minutos)
      gcTime: 10 * 60 * 1000,
      // Retry automático em caso de erro
      retry: (failureCount, error: any) => {
        // Não retry para erros 4xx (exceto 408, 429)
        if (
          error?.status >= 400 &&
          error?.status < 500 &&
          ![408, 429].includes(error?.status)
        ) {
          return false;
        }
        // Retry até 3 vezes para outros erros
        return failureCount < 3;
      },
      // Retry delay exponencial
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch quando a janela ganha foco
      refetchOnWindowFocus: true,
      // Refetch quando reconecta
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry para mutations (apenas uma vez)
      retry: 1,
      // Retry delay para mutations
      retryDelay: 1000,
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools apenas em desenvolvimento */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
