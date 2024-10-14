import { useState, useCallback } from "react";
import { inMemoryCache } from "./useCustomQuery"; // Make sure to export inMemoryCache from useCustomQuery

type MutationFunction<TVariables, TData> = (
  variables: TVariables
) => Promise<TData | void>;

type MutationOptions<TVariables, TData, TError> = {
  onMutate?: (variables: TVariables) => void;
  onSuccess?: (data: TData | void, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  onSettled?: (
    data: TData | void | undefined,
    error: TError | null,
    variables: TVariables
  ) => void;
  queryKey?: string;
};

export function useCustomMutation<TVariables, TData, TError = Error>(
  mutationFunction: MutationFunction<TVariables, TData>,
  options: MutationOptions<TVariables, TData, TError> = {}
) {
  const { onMutate, onSuccess, onError, onSettled, queryKey } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TError | null>(null);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | void | undefined> => {
      setIsLoading(true);
      setError(null);

      try {
        if (onMutate) {
          onMutate(variables);
        }

        const result = await mutationFunction(variables);

        if (queryKey) {
          // Only update cache if result is not void (e.g., for delete operations)
          if (result !== undefined) {
            inMemoryCache[queryKey] = result;
          }
        }

        if (onSuccess) {
          onSuccess(result, variables);
        }

        if (onSettled) {
          onSettled(result, null, variables);
        }

        return result;
      } catch (err) {
        const errorObject = err as TError;
        setError(errorObject);

        if (onError) {
          onError(errorObject, variables);
        }

        if (onSettled) {
          onSettled(undefined, errorObject, variables);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFunction, queryKey, onMutate, onSuccess, onError, onSettled]
  );

  return { mutate, isLoading, error };
}
