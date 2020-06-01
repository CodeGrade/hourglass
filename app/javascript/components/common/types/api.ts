import { useState, useEffect } from 'react';
import { getCSRFToken } from '@student/exams/show/helpers';

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

export async function hitApi<T>(url: string, options?: RequestInit): Promise<T> {
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCSRFToken(),
    },
    credentials: 'same-origin',
    ...options,
  })
    .then((res) => res.json() as Promise<T>);
}

export function useApiResponse<T>(url: string, options?: RequestInit): ApiResponse<T> {
  const [response, setResponse] = useState<T>(undefined);
  const [error, setError] = useState<ApiError>(undefined);
  useEffect(() => {
    fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
      },
      credentials: 'same-origin',
      ...options,
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
      .catch((e: Error) => {
        if (e.name === 'SyntaxError') {
          setError({
            type: 'ERROR',
            status: -1,
            text: 'Error fetching data from server.',
          });
        }
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
