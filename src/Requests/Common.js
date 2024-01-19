export const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;
export const SERVER_PORT = process.env.REACT_APP_SERVER_PORT;

export const SERVER_URL = `http://${SERVER_HOST}:${SERVER_PORT}`;

console.log("SERVER_URL: ", SERVER_URL);

export const resolveUrl = (path) => {
  if (path.startsWith("/")) {
    path = path.substring(1);
  }
  return `${SERVER_URL}/${path}`;
};
