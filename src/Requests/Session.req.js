import axios from "axios";
import { resolveUrl } from "./Common";

export const findSessionReq = async (code) => {
  try {
    const resp = await axios.post(resolveUrl(`session/find`), { code });
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const joinSessionReq = async (code, uid, password) => {
  try {
    const resp = await axios.post(resolveUrl(`session/join`), {
      code,
      uid,
      password,
    });
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const getJoinedSessionsReq = async (uid) => {
  try {
    const resp = await axios.get(resolveUrl(`session/sessions?uid=${uid}`));
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const getGameSessionReq = async (sessionId) => {
  try {
    const resp = await axios.get(resolveUrl(`session?sessionId=${sessionId}`));
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const createGameSessionReq = async (gameId, uid, password) => {
  try {
    const resp = await axios.post(resolveUrl("session/create"), {
      gameId,
      uid,
      password,
    });
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const deleteGameSessionReq = async (sessionId) => {
  try {
    const resp = await axios.delete(resolveUrl(`session?sessionId=${sessionId}`));
    return resp.data;
  } catch (err) {
    throw err;
  }
};
