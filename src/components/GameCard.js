import { IoBarcode, IoPlay, IoStar } from "react-icons/io5";
import JsxUtil from "util/JsxUtil";
import "./GameCard.scss";
import { useNavigate } from "react-router-dom";
import { SESSION_STATUS } from "types/Common";

const GameCard = ({ gid, name, description, minMembers, maxMembers, active = false }) => {
  const navigate = useNavigate();

  const goToCreationPage = () => {
    navigate(`/game-creation/${gid}`);
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

export const GameSessionCard = ({ data, active = false }) => {
  const navigate = useNavigate();

  const goToGameSessionPage = () => {
    switch (data?.status) {
      case SESSION_STATUS.WAITING:
        navigate(`/game-session/${data?.id}`);
        return;
      case SESSION_STATUS.PLAYING:
        // TODO :: implement
        return;
      case SESSION_STATUS.ENDED:
        return;
      default:
        console.error("Invalid session status");
        return;
    }
  };

  // console.log(data);

  return (
    <div className={"game-card" + JsxUtil.classByCondition(active, "active")} onClick={goToGameSessionPage}>
      <div className="game-image img">
        <img alt="" src={"https://picsum.photos/200/300"} />
      </div>
      <div className="game-info">
        <div className="game-name">{data?.game?.name}</div>
        <div className="game-time">오늘 오후 5시 53분 (1:03:23)</div>
        <div className="game-players">{data?.participants?.length ?? 0}명 참여</div>
        <div className="game-code">
          <div className="label">
            <IoBarcode />
          </div>
          <div className="code">{data?.code}</div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
