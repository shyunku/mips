import { IoBarcode, IoPlay, IoStar, IoStarOutline } from "react-icons/io5";
import JsxUtil from "util/JsxUtil";
import "./GameCard.scss";
import { useNavigate } from "react-router-dom";
import { SESSION_STATUS } from "types/Common";
import { formatTime, formatTimeShort } from "util/TimeUtil";
import { useEffect, useMemo, useState } from "react";
import { fastInterval, printf } from "util/Common";
import { toggleFavoriteReq } from "Requests/Favorite.req";
import useRepaint from "hooks/useRepaint";

const GameCard = ({ game }) => {
  const navigate = useNavigate();
  const [favorited, setFavorited] = useState(game?.favorited ?? false);

  const goToCreationPage = () => {
    navigate(`/game-creation/${game?.gid}`);
  };

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await toggleFavoriteReq(game?.gid);
      setFavorited((favorited) => {
        game.favorites += favorited ? -1 : 1;
        return !favorited;
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      className={"game-card" + JsxUtil.classByCondition(game?.deployed, "deployed")}
      onClick={game?.deployed ? goToCreationPage : null}
    >
      <div className="game-image img">
        <img alt="" src={`/assets/img/session/${game?.gid}.png`} />
      </div>
      {game?.deployed !== true && <div className="placeholder">준비 중입니다.</div>}
      <div className="game-info">
        <div className="game-name">{game?.name}</div>
        <div className="game-description">{game?.description}</div>
        <div className="game-players">
          플레이어 {game?.minMembers}~{game?.maxMembers}명
        </div>
        <div className="statistic">
          <div className="game-favorites" onClick={toggleFavorite}>
            <div className="icon">{favorited ? <IoStar /> : <IoStarOutline />}</div>
            <div className="label">{game?.favorites ?? 0}</div>
          </div>
          <div className="game-played">
            <div className="icon">
              <IoPlay />
            </div>
            <div className="label">{game?.played ?? 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GameSessionCard = ({ data, interactive = true }) => {
  const navigate = useNavigate();
  const [updater, setUpdater] = useState(0);

  const description = useMemo(() => {
    if (data?.status == null) return null;
    switch (data?.status) {
      case SESSION_STATUS.WAITING:
        return `${formatTime(data?.createdAt)} (대기 중)`;
      case SESSION_STATUS.PLAYING:
        return `게임 중 (${formatTimeShort(data?.startedAt)})`;
      case SESSION_STATUS.ENDED:
        return `${formatTime(data?.endedAt)} (종료됨)`;
      default:
        return null;
    }
  }, [data?.createdAt, data?.status, updater]);

  const goToGameSessionPage = () => {
    if (interactive === false) return;
    switch (data?.status) {
      case SESSION_STATUS.WAITING:
        navigate(`/game-session/${data?.id}`);
        return;
      case SESSION_STATUS.PLAYING:
        navigate(`/game/${data?.game?.gid}/${data?.id}`);
        return;
      case SESSION_STATUS.ENDED:
        return;
      default:
        console.error("Invalid session status");
        return;
    }
  };

  useEffect(() => {
    const t = fastInterval(() => {
      setUpdater((e) => ++e);
    }, 1000);
    return () => {
      clearInterval(t);
    };
  }, []);

  return (
    <div
      className={
        "game-card" +
        JsxUtil.classByNonEqual(data?.status, SESSION_STATUS.ENDED, "active") +
        JsxUtil.classByCondition(data?.game?.deployed, "deployed")
      }
      onClick={goToGameSessionPage}
    >
      <div className="game-image img">
        <img alt="" src={`/assets/img/session/${data?.game?.gid}.png`} />
      </div>
      <div className="game-info">
        <div className="game-name">{data?.game?.name}</div>
        <div className="game-time">{description}</div>
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

export const InGameCard = ({ data }) => {
  useRepaint();

  return (
    <div className={"game-card ingame"}>
      <div className="game-info">
        <div className="game-name">{data?.game?.name}</div>
        <div className="game-time">({formatTimeShort(data?.startedAt)})</div>
      </div>
    </div>
  );
};

export default GameCard;
