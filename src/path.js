export default (url) => {
  const builtUrl = new URL('/get', 'https://allorigins.hexlet.app');
  const searchParams = new URLSearchParams(builtUrl.search);
  searchParams.append('disabledCache', 'true');
  searchParams.append('url', url);
  return `${builtUrl.toString()}?${decodeURIComponent(searchParams.toString())}`;
};
