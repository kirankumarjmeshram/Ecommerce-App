const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  // Infrastructure errors are not useful customer messages.
  if (Number(error?.status) >= 500 || ['FETCH_ERROR', 'PARSING_ERROR', 'TIMEOUT_ERROR'].includes(error?.status)) return fallback;
  for (const candidate of [error?.data?.message, error?.error, error?.message]) {
    if (typeof candidate !== 'string') continue;
    const value = candidate.trim();
    if (value && value.length <= 200 && !/[{}<>\n\r]|\[object Object\]|\bat \S+\(/.test(value)) return value;
  }
  return fallback;
};
export default getErrorMessage;
