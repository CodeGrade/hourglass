import { useState, useEffect } from 'react';
import { getCSRFToken } from '@hourglass/workflows/student/exams/show/helpers';

export interface ApiResponse<T> {
  response?: T;
}

export function useApiResponse<T>(url: string): ApiResponse<T> {
  const [response, setResponse] = useState<T>(undefined);
  useEffect(() => {
    fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
      },
      credentials: 'same-origin',
    })
      .then((res) => res.json() as Promise<T>)
      .then(setResponse);
  }, []);
  if (!response) {
    return {};
  }
  return {
    response,
  };
}
