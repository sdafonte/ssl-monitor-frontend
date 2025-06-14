import { useState, useEffect } from 'react';

/**
 * Hook customizado que aplica um "debounce" a um valor.
 * @param value O valor a ser "debounceado" (ex: termo de busca).
 * @param delay O tempo de atraso em milissegundos.
 * @returns O valor "debounceado".
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configura um timer para atualizar o valor debounceado após o delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpa o timer se o valor mudar antes do fim do delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Roda o efeito novamente apenas se o valor ou o delay mudarem

  return debouncedValue;
}