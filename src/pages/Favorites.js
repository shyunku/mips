import Footer from "components/Footer";
import GameCard from "components/GameCard";
import IconInput from "components/IconInput";
import { IoBarcode, IoLockClosed, IoSearch } from "react-icons/io5";

const Favorites = () => {
  return (
    <>
      <div className="container join-game">
        <div className="sub-content">
          <IconInput className="input" icon={<IoSearch />} placeholder={"즐겨찾기 설정된 게임을 검색해보세요."} />
        </div>
      </div>
      <div className="container current-games games">
        <div className="label">등록된 게임 (133)</div>
        <div className="sub-content">
          <div className="game-session-list">
            {Array(13)
              .fill()
              .map((e, ind) => (
                <GameCard key={ind} />
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Favorites;
