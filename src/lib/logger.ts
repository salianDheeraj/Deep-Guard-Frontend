const isProd = process.env.NODE_ENV === 'production';

export function debug(...args: any[]) {
  if (!isProd) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

export function info(...args: any[]) {
  // info may still be useful in production; forward to console.info
  // eslint-disable-next-line no-console
  console.info(...args);
}

export function warn(...args: any[]) {
  // eslint-disable-next-line no-console
  console.warn(...args);
}

export function error(...args: any[]) {
  // eslint-disable-next-line no-console
  console.error(...args);
}

export default {
  debug,
  info,
  warn,
  error,
};
