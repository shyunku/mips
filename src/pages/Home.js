import Footer from "components/Footer";
import GameCard from "components/GameCard";
import IconInput from "components/IconInput";
import { IoBarcode, IoLockClosed, IoSearch } from "react-icons/io5";

const Home = () => {
  return (
    <>
      <div className="container join-game">
        <div className="label">게임 참여</div>
        <div className="sub-content">
          <IconInput className="input" icon={<IoBarcode />} placeholder={"게임 코드를 입력해서 참가하세요."} />
          <IconInput
            className="input"
            type={"password"}
            icon={<IoLockClosed />}
            iconColor="#9D6FFF"
            placeholder={"해당 게임에 입장하려면 비밀번호를 입력해야합니다."}
          />
        </div>
      </div>
      <div className="container current-games games">
        <div className="label">진행 중인 게임 (2)</div>
        <div className="sub-content">
          <div className="game-session-list">
            {Array(2)
              .fill()
              .map((e, ind) => (
                <GameCard key={ind} active={true} />
              ))}
          </div>
        </div>
      </div>
      <div className="container previous-games games">
        <div className="label">지난 게임 (7)</div>
        <div className="sub-content">
          <div className="game-session-list">
            {Array(7)
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

export default Home;
