// utils/storage.js
export const load = (k) => {
    if (typeof window === "undefined") return null;
    try { return window.localStorage.getItem(k); } catch { return null; }
  };
  export const save = (k, v) => {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(k, v); } catch {}
  };
  export const remove = (k) => {
    if (typeof window === "undefined") return;
    try { window.localStorage.removeItem(k); } catch {}
  };
  