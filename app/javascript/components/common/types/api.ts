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

/**
 * Error that is thrown for error responses from the API.
 */
export class HitApiError extends Error {
  status = -1;

  constructor(err: ApiError) {
    super(err.text);
    this.status = err.status;
  }
}

export async function hitApi<T>(url: string, options: RequestInit = {}, isJson = true): Promise<T> {
  const {
    headers = {},
    ...otherOptions
  } = options;
  const fetchHeaders = {
    'X-CSRF-Token': getCSRFToken(),
    ...headers,
  };
  if (isJson) fetchHeaders['Content-Type'] = 'application/json';
  return fetch(url, {
    headers: fetchHeaders,
    credentials: 'same-origin',
    ...otherOptions,
  })
    .catch((err) => {
      throw new HitApiError({
        type: 'ERROR',
        status: -1,
        text: err.message,
      });
    })
    .then((res) => {
      if (!res.ok) {
        throw new HitApiError({
          type: 'ERROR',
          status: res.status,
          text: res.statusText,
        });
      }
      return res.json() as Promise<T>;
    });
}

export function useApiResponse<Server, Res = Server>(
  url: string,
  options?: RequestInit,
  transformSuccess?: (server: Server) => Res,
  deps?: React.DependencyList,
): ApiResponse<Res> {
  const [response, setResponse] = useState<Server>(undefined);
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
      .then((res) => res.json() as Promise<Server>)
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
  }, deps ?? []);
  if (error) {
    return error;
  }
  if (!response) {
    return {
      type: 'LOADING',
    };
  }
  if (transformSuccess) {
    return {
      type: 'RESULT',
      response: transformSuccess(response),
    };
  }
  return {
    type: 'RESULT',
    response: response as unknown as Res,
  };
}
