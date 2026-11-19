const BASE_URL = import.meta.env.VITE_API_URL;

export interface ApiError {
  message: string;
  fieldErrors?: Record<string, string>;
}

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = response.statusText;
    let fieldErrors: Record<string, string> | undefined;

    try {
      const body = await response.json();

      if (body.error) {
        message = body.error;
      } else {
        fieldErrors = body;
        message =
          Object.values(body)[0] as string || message;
      }
    } catch {}

    const error = new Error(message) as Error & ApiError;
    error.fieldErrors = fieldErrors;

    throw error;
  }

  if (response.status === 204) {
    return;
  }

  return response.json();
};