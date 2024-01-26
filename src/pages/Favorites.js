import { getFavoriteGamesReq } from "Requests/Favorite.req";
import Footer from "components/Footer";
import GameCard from "components/GameCard";
import IconInput from "components/IconInput";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoBarcode, IoLockClosed, IoSearch } from "react-icons/io5";

const Favorites = () => {
  const [games, setGames] = useState([]);

  const getFavoriteGames = async () => {
    try {
      const res = await getFavoriteGamesReq();
      setGames(res);
      console.log("favorites", res);
    } catch (err) {
      console.log(err);
      toast.error("즐겨찾기 게임 목록을 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    getFavoriteGames();
  }, []);

  return (
    <>
      {/* <div className="container join-game">
        <div className="sub-content">
          <IconInput className="input" icon={<IoSearch />} placeholder={"즐겨찾기 설정된 게임을 검색해보세요."} />
        </div>
      </div> */}
      <div className="container current-games games">
        <div className="label">즐겨찾기된 게임 ({games?.length ?? 0})</div>
        <div className="sub-content">
          <div className="game-session-list">
            {games.map((e, ind) => (
              <GameCard key={ind} game={e} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Favorites;
