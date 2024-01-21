import axios from "axios";
import toast from "react-hot-toast";
import userStore from "stores/userStore";

export const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;
export const SERVER_PORT = process.env.REACT_APP_SERVER_PORT;

export const SERVER_URL = `http://${SERVER_HOST}:${SERVER_PORT}`;

console.log("SERVER_URL: ", SERVER_URL);

export const reqInstance = axios.create({
  baseURL: SERVER_URL,
  timeout: 10000,
});

reqInstance.interceptors.request.use(
  (config) => {
    const token = userStore.getState().token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

reqInstance.interceptors.response.use(
  (resp) => resp,
  (err) => {
    if (err.response.status === 401) {
      // TODO :: apply refresh token
      toast.error("로그인 정보가 만료되었습니다.");
      userStore.getState().clear();
    } else {
      return Promise.reject(err);
    }
  }
);

export const resolveUrl = (path) => {
  if (path.startsWith("/")) {
    path = path.substring(1);
  }
  return `${SERVER_URL}/${path}`;
};
