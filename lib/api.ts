import ky from 'ky';
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

// Configurar ky con la URL base
export const api = ky.create({
  prefix: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  retry: {
    limit: 2,
    methods: ['get', 'head', 'put', 'delete', 'options', 'trace'],
  },
});

// Hook personalizado para GET
export function useApiQuery<T>(
  key: string | string[],
  url: string,
  options?: UseQueryOptions<T>
) {
  return useQuery<T>({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      const response = await api.get(url).json<T>();
      return response;
    },
    ...options,
  });
}

// Hook personalizado para POST
export function useApiMutation<TData = unknown, TError = unknown, TVariables = unknown>(
  options?: UseMutationOptions<TData, TError, TVariables>
) {
  return useMutation<TData, TError, TVariables>({
    ...options,
  });
}

// Función para hacer POST con ky
export async function postData<T>(url: string, data: unknown): Promise<T> {
  return api.post(url, { json: data }).json<T>();
}

// Función para hacer GET con ky
export async function getData<T>(url: string): Promise<T> {
  return api.get(url).json<T>();
}

// Función para hacer PUT con ky
export async function updateData<T>(url: string, data: unknown): Promise<T> {
  return api.put(url, { json: data }).json<T>();
}

// Función para hacer DELETE con ky
export async function deleteData<T>(url: string): Promise<T> {
  return api.delete(url).json<T>();
}
