const isDebug = () => {
  try { return !!localStorage.getItem("debug"); } catch { return false; }
};

export const logger = {
  debug: (...args) => { if (isDebug()) console.debug("[debug]", ...args); },
  info:  (...args) => console.info("[info]", ...args),
  warn:  (...args) => console.warn("[warn]", ...args),
  error: (...args) => console.error("[error]", ...args),
};
