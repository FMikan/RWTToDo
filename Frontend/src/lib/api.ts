import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  StoredSession,
  UserProfile,
} from '../types/auth';
import type { CreateTaskRequest, Subject, UpdateTaskRequest, UserTask } from '../types/task';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5101';

type RequestResult<T> = {
  data: T;
  session: StoredSession;
};

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function parseError(response: Response): Promise<ApiError> {
  let message = `Request failed (${response.status})`;

  try {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const body = (await response.json()) as Record<string, unknown>;
      message = JSON.stringify(body);
    } else {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }
  } catch {
    // ignore and keep fallback message
  }

  return new ApiError(response.status, message);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers ?? {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function register(payload: RegisterRequest): Promise<void> {
  await request<void>('/api/Auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>('/api/Auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<LoginResponse> {
  return request<LoginResponse>('/api/Auth/Refresh', {
    method: 'POST',
    body: JSON.stringify({ token: refreshToken }),
  });
}

async function authorizedRequest<T>(
  path: string,
  session: StoredSession,
  init?: RequestInit,
): Promise<RequestResult<T>> {
  const doRequest = async (accessToken: string) =>
    request<T>(path, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(init?.headers ?? {}),
      },
    });

  try {
    const data = await doRequest(session.accessToken);
    return { data, session };
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    const refreshed = await refreshAccessToken(session.refreshToken);
    const updatedSession: StoredSession = {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
    };

    const data = await doRequest(updatedSession.accessToken);
    return { data, session: updatedSession };
  }
}

export function getMe(session: StoredSession): Promise<RequestResult<UserProfile>> {
  return authorizedRequest<UserProfile>('/api/User/me', session, {
    method: 'GET',
  });
}

export function getSubjects(session: StoredSession): Promise<RequestResult<Subject[]>> {
  return authorizedRequest<Subject[]>('/api/Subject', session, {
    method: 'GET',
  });
}

export function createSubject(session: StoredSession, name: string): Promise<RequestResult<void>> {
  return authorizedRequest<void>('/api/Subject', session, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function updateSubject(session: StoredSession, id: string, name: string): Promise<RequestResult<void>> {
  return authorizedRequest<void>(`/api/Subject/${id}`, session, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
}

export function deleteSubject(session: StoredSession, id: string): Promise<RequestResult<void>> {
  return authorizedRequest<void>(`/api/Subject/${id}`, session, {
    method: 'DELETE',
  });
}

export function getTasks(session: StoredSession): Promise<RequestResult<UserTask[]>> {
  return authorizedRequest<UserTask[]>('/api/Task', session, {
    method: 'GET',
  });
}

export function createTask(
  session: StoredSession,
  payload: CreateTaskRequest,
): Promise<RequestResult<UserTask>> {
  return authorizedRequest<UserTask>('/api/Task', session, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTask(
  session: StoredSession,
  id: string,
  payload: UpdateTaskRequest,
): Promise<RequestResult<void>> {
  return authorizedRequest<void>(`/api/Task/${id}`, session, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteTask(session: StoredSession, id: string): Promise<RequestResult<void>> {
  return authorizedRequest<void>(`/api/Task/${id}`, session, {
    method: 'DELETE',
  });
}

export function completeTask(session: StoredSession, id: string): Promise<RequestResult<void>> {
  return authorizedRequest<void>(`/api/Task/${id}/complete`, session, {
    method: 'PATCH',
  });
}
