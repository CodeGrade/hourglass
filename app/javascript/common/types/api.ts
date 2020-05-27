import { useState, useEffect } from 'react';
import { getCSRFToken } from '@hourglass/workflows/student/exams/show/helpers';

export type ApiResponse<T> = Result<T> | Loading | ApiError;

export interface Result<T> {
  type: 'RESULT';
  response: T;
}

export type Loading = {
  type: 'LOADING';
};

export interface ApiError {
  type: 'ERROR';
  status: number;
  text: string;
}

export function useApiResponse<T>(url: string): ApiResponse<T> {
  const [response, setResponse] = useState<T>(undefined);
  const [error, setError] = useState<ApiError>(undefined);
  useEffect(() => {
    fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
      },
      credentials: 'same-origin',
    })
      .then((res) => {
        if (!res.ok) {
          setError({
            type: 'ERROR',
            status: res.status,
            text: res.statusText,
          });
          throw new Error();
        }
        return res;
      })
      .then((res) => res.json() as Promise<T>)
      .then(setResponse)
      .catch((_err: Error) => {
        // no-op
      });
  }, [setResponse, setError]);
  if (error) {
    return error;
  }
  if (!response) {
    return {
      type: 'LOADING',
    };
  }
  return {
    type: 'RESULT',
    response,
  };
}
