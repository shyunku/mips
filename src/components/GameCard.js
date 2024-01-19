import { IoBarcode, IoPlay, IoStar } from "react-icons/io5";
import JsxUtil from "util/JsxUtil";
import "./GameCard.scss";
import { useNavigate } from "react-router-dom";

const GameCard = ({ name, description, minMembers, maxMembers, active = false }) => {
  const navigate = useNavigate();

  const goToCreationPage = () => {
    navigate("/game-creation");
  };

  return (
    <div className={"game-card" + JsxUtil.classByCondition(active, "active")} onClick={goToCreationPage}>
      <div className="game-image img">
        <img alt="" src={"https://picsum.photos/200/300"} />
      </div>
      <div className="game-info">
        <div className="game-name">{name}</div>
        <div className="game-description">{description}</div>
        <div className="game-players">
          플레이어 {minMembers}~{maxMembers}명
        </div>
        <div className="statistic">
          <div className="game-favorites">
            <div className="icon">
              <IoStar />
            </div>
            <div className="label">0</div>
          </div>
          <div className="game-played">
            <div className="icon">
              <IoPlay />
            </div>
            <div className="label">0</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GameSessionCard = ({ name, startedAt, participants, code, active = false }) => {
  const navigate = useNavigate();

  const goToGameSessionPage = () => {
    // TODO :: implement
  };

  return (
    <div className={"game-card" + JsxUtil.classByCondition(active, "active")} onClick={goToGameSessionPage}>
      <div className="game-image img">
        <img alt="" src={"https://picsum.photos/200/300"} />
      </div>
      <div className="game-info">
        <div className="game-name">게임 이름</div>
        <div className="game-time">오늘 오후 5시 53분 (1:03:23)</div>
        <div className="game-players">5명 참여</div>
        <div className="game-code">
          <div className="label">
            <IoBarcode />
          </div>
          <div className="code">123456</div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
