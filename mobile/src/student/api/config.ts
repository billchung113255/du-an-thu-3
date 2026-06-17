/**
 * Runtime config. Values come from Expo public env vars (app.json > extra or .env).
 * NEVER put the Anthropic API key in the mobile client — the tutor goes through your backend.
 */
export const config = {
  /** Your backend base URL that proxies the model. */
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ?? 'https://api.times.edu.vn',
  /** Path on your backend that holds the Anthropic key and forwards the chat. */
  tutorPath: '/v1/tutor/chat',
  supportEmail: 'admin@times.edu.vn',
} as const;
