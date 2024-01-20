import axios from "axios";
import { resolveUrl } from "./Common";

export const getGameReq = async (gid) => {
  try {
    const resp = await axios.get(resolveUrl(`game?id=${gid}`));
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const getAllGamesReq = async () => {
  try {
    const resp = await axios.get(resolveUrl("game/all"));
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const getJoinedSessionsReq = async (uid) => {
  try {
    const resp = await axios.get(resolveUrl(`game/sessions?uid=${uid}`));
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const getGameSessionReq = async (sessionId) => {
  try {
    const resp = await axios.get(resolveUrl(`game/session?sessionId=${sessionId}`));
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const createGameSessionReq = async (gameId, uid, password) => {
  try {
    const resp = await axios.post(resolveUrl("game/createSession"), {
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
    const resp = await axios.delete(resolveUrl(`game/session?sessionId=${sessionId}`));
    return resp.data;
  } catch (err) {
    throw err;
  }
};
