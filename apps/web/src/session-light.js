const SESSION_USER_KEY = 'odontoflow:session-user';

export const loadLightSessionSnapshot = () => {
  const fallback = { firstName: 'Profissional', email: '' };
  const raw = window.localStorage.getItem(SESSION_USER_KEY);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);
    const fullName = String(parsed?.name || '').trim();
    const firstName = fullName ? fullName.split(' ')[0] : fallback.firstName;
    return {
      firstName,
      email: String(parsed?.email || '').trim()
    };
  } catch {
    return fallback;
  }
};

