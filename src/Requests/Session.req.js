import axios from "axios";
import { reqInstance, resolveUrl } from "./Common";

export const findSessionReq = async (code) => {
  try {
    const resp = await reqInstance.post(`session/find`, { code });
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const joinSessionReq = async (code, password) => {
  try {
    const resp = await reqInstance.post(`session/join`, {
      code,
      password,
    });
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const getJoinedSessionsReq = async () => {
  try {
    const resp = await reqInstance.get(`session/sessions`);
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const getGameSessionReq = async (sessionId) => {
  try {
    const resp = await reqInstance.get(`session?sessionId=${sessionId}`);
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const createGameSessionReq = async (gameId, password) => {
  try {
    const resp = await reqInstance.post("session/create", {
      gameId,
      password,
    });
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const deleteGameSessionReq = async (sessionId) => {
  try {
    const resp = await reqInstance.delete(resolveUrl(`session?sessionId=${sessionId}`));
    return resp.data;
  } catch (err) {
    throw err;
  }
};
