import axios from "axios";
import { reqInstance, resolveUrl } from "./Common";

export const getFavoriteGamesReq = async () => {
  try {
    const resp = await reqInstance.get("favorite/getGames");
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const toggleFavoriteReq = async (gameId) => {
  try {
    const resp = await reqInstance.post(`favorite/toggle`, {
      gameId,
    });
    return resp.data;
  } catch (err) {
    throw err;
  }
};
