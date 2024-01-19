import { getAllGamesReq } from "Requests/Game.req";
import Footer from "components/Footer";
import GameCard from "components/GameCard";
import IconInput from "components/IconInput";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoBarcode, IoLockClosed, IoSearch } from "react-icons/io5";

const Games = () => {
  const [games, setGames] = useState([]);

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

  useEffect(() => {
    fetchAllGames();
  }, [fetchAllGames]);

  return (
    <>
      <div className="container join-game">
        <div className="sub-content">
          <IconInput className="input" icon={<IoSearch />} placeholder={"게임을 검색해보세요."} />
        </div>
      </div>
      <div className="container current-games games">
        <div className="label">검색된 게임 ({games.length})</div>
        <div className="sub-content">
          <div className="game-session-list">
            {games.map((e, ind) => (
              <GameCard
                key={e.name}
                name={e.name}
                description={e.description}
                minMembers={e.minMembers}
                maxMembers={e.maxMembers}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Games;
