const config = {
  apiUrl: import.meta.env.VITE_API_URL || '',
  socketUrl: import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '/',
};

export default config;
