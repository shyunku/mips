import axios from "axios";
import { reqInstance, resolveUrl } from "./Common";

export const getGameReq = async (gid) => {
  try {
    const resp = await reqInstance.get(`game?id=${gid}`);
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const getAllGamesReq = async () => {
  try {
    const resp = await reqInstance.get("game/all");
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const findGameReq = async (keyword) => {
  try {
    const resp = await reqInstance.post(`game/find`, {
      keyword,
    });
    return resp.data;
  } catch (err) {
    throw err;
  }
};
