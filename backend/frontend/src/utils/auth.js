const STORAGE_KEY_TOKEN = 'billingDeepToken';
const STORAGE_KEY_USER = 'billingDeepUser';

export const getStoredAuth = () => {
  const token =
    window.localStorage.getItem(STORAGE_KEY_TOKEN) ||
    window.sessionStorage.getItem(STORAGE_KEY_TOKEN);

  const userJson =
    window.localStorage.getItem(STORAGE_KEY_USER) ||
    window.sessionStorage.getItem(STORAGE_KEY_USER);

  let user = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch {
      user = null;
    }
  }

  return { token, user };
};

export const saveAuth = ({ token, user, remember }) => {
  const storage = remember ? window.localStorage : window.sessionStorage;

  storage.setItem(STORAGE_KEY_TOKEN, token);
  storage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
};

export const clearAuth = () => {
  window.localStorage.removeItem(STORAGE_KEY_TOKEN);
  window.localStorage.removeItem(STORAGE_KEY_USER);
  window.sessionStorage.removeItem(STORAGE_KEY_TOKEN);
  window.sessionStorage.removeItem(STORAGE_KEY_USER);
};

