import { findGameReq, getAllGamesReq } from "Requests/Game.req";
import Footer from "components/Footer";
import GameCard from "components/GameCard";
import IconInput from "components/IconInput";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { IoBarcode, IoLockClosed, IoSearch } from "react-icons/io5";

const Games = () => {
  const [games, setGames] = useState([]);
  const [gameSearchInput, setGameSearchInput] = useState("");
  const showDefaultMode = useMemo(() => gameSearchInput.length === 0, [gameSearchInput]);

  const fetchAllGames = useCallback(async () => {
    try {
      const res = await getAllGamesReq();
      setGames(res);
      console.log(res);
    } catch (err) {
      console.log(err);
      toast.error("게임 목록을 불러오지 못했습니다.");
    }
  }, []);

  const onGameSearchInputChange = useCallback(
    async (e) => {
      const trimmed = e.trim();
      setGameSearchInput(trimmed);
      try {
        if (trimmed.length === 0) {
          await fetchAllGames();
          return;
        }
        const res = await findGameReq(trimmed);
        setGames(res);
      } catch (err) {
        console.log(err);
      }
    },
    [fetchAllGames]
  );

  useEffect(() => {
    fetchAllGames();
  }, [fetchAllGames]);

  return (
    <>
      <div className="container join-game">
        <div className="sub-content">
          <IconInput
            className="input"
            icon={<IoSearch />}
            placeholder={"게임을 검색해보세요."}
            value={gameSearchInput}
            onChange={onGameSearchInputChange}
          />
        </div>
      </div>
      <div className="container current-games games">
        <div className="label">
          {showDefaultMode ? "모든" : "검색된"} 게임 ({games.length})
        </div>
        <div className="sub-content">
          <div className="game-session-list">
            {games.map((e, ind) => (
              <GameCard key={e.gid} game={e} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Games;
