import axios from "axios";
import { resolveUrl } from "./Common";

export const getAllGamesReq = async () => {
  try {
    const resp = await axios.get(resolveUrl("game/all"));
    return resp.data;
  } catch (err) {
    throw err;
  }
};
