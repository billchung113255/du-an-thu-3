import type { ChatMessage } from '../types';
import { config } from './config';

/**
 * AI tutor API boundary.
 *
 * Contract with YOUR backend (which holds the Anthropic key):
 *   POST {apiBaseUrl}{tutorPath}
 *   body: TutorRequest
 *   200 -> TutorResponse  { reply: string }
 *   401 -> auth expired
 *
 * The backend is responsible for building the system prompt and calling the model.
 * Keep all secrets server-side.
 */

export interface TutorContext {
  curriculum?: string;
  subjectCode?: string;
  /** A topic name to scope the tutor, e.g. "Stoichiometry". */
  topic?: string;
}

export interface TutorRequest extends TutorContext {
  messages: ChatMessage[];
}

export interface TutorResponse {
  reply: string;
}

export class TutorError extends Error {
  constructor(
    message: string,
    readonly kind: 'auth' | 'network' | 'server' | 'malformed' = 'network',
  ) {
    super(message);
    this.name = 'TutorError';
  }
}

const TIMEOUT_MS = 30000;

function isTutorResponse(value: unknown): value is TutorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).reply === 'string'
  );
}

/**
 * Send the conversation to the tutor and return the assistant reply text.
 * @param getToken optional callback returning the current auth token.
 */
export async function sendTutorMessage(
  req: TutorRequest,
  getToken?: () => string | null | undefined,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const token = getToken?.();
    const res = await fetch(`${config.apiBaseUrl}${config.tutorPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(req),
      signal: controller.signal,
    });

    if (res.status === 401) {
      throw new TutorError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'auth');
    }
    if (!res.ok) {
      throw new TutorError(`Máy chủ trả về lỗi (${res.status}).`, 'server');
    }

    const data: unknown = await res.json().catch(() => null);
    if (!isTutorResponse(data)) {
      throw new TutorError('Dữ liệu trả về không hợp lệ.', 'malformed');
    }
    return data.reply.trim();
  } catch (err) {
    if (err instanceof TutorError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new TutorError('Yêu cầu quá thời gian. Em thử lại nhé.', 'network');
    }
    throw new TutorError('Không kết nối được với Gia sư AI. Kiểm tra mạng và thử lại.', 'network');
  } finally {
    clearTimeout(timer);
  }
}
