import { useCallback, useState, useTransition } from "react";

interface UseFileUploadOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: string) => void;
}

interface UseFileUploadState<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
  upload: (formData: FormData) => void;
}

/**
 * A reusable hook for uploading files via Next.js Server Actions.
 * Manages loading, error, and success state, and uses `useTransition`
 * to keep the UI responsive during async operations.
 *
 * @example
 * const { upload, loading, error, data } = useFileUpload<UploadAvatarState>(
 *   uploadAvatarAction,
 *   { onSuccess: (result) => console.log(result.url) },
 * );
 */
export function useFileUpload<T = unknown>(
  action: (prevState: unknown, data: FormData) => Promise<T>,
  options?: UseFileUploadOptions<T>,
): UseFileUploadState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [_, startTransition] = useTransition();

  const upload = useCallback(
    (formData: FormData) => {
      setLoading(true);
      setError(null);

      startTransition(async () => {
        try {
          const result = await action({}, formData);
          setData(result);

          if (result && typeof result === "object" && "error" in result) {
            const errMsg = (result as { error?: string }).error;
            if (errMsg) {
              setError(errMsg);
              options?.onError?.(errMsg);
            } else {
              options?.onSuccess?.(result);
            }
          } else {
            options?.onSuccess?.(result);
          }
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "An unexpected error occurred.";
          setError(message);
          options?.onError?.(message);
        } finally {
          setLoading(false);
        }
      });
    },
    [action, options],
  );

  return { upload, loading, error, data };
}
