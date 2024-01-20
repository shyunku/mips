import { IoArrowBack, IoBarcode, IoClose, IoCopy, IoLockClosed, IoSearch, IoSettingsSharp } from "react-icons/io5";
import "./GameSession.scss";
import { useEffect, useMemo, useState } from "react";
import JsxUtil from "util/JsxUtil";
import toast from "react-hot-toast";
import { copyToClipboard } from "util/Common";
import { useNavigate, useParams } from "react-router-dom";
import userStore from "stores/userStore";
import { createGameSessionReq, deleteGameSessionReq, getGameSessionReq } from "Requests/Session.req";
import { getGameReq } from "Requests/Game.req";

const GameSession = (props) => {
  const navigate = useNavigate();
  const params = useParams();
  const uid = userStore((state) => state.uid);

  const gameId = useMemo(() => params.gameId, [params]);
  const sessionId = useMemo(() => params.sessionId, [params]);

  const [session, setSession] = useState(null); // {id, code, creator, status, game, ...}
  const [game, setGame] = useState(null); // {gid, name, description, minMembers, maxMembers, ...}

  const [creating, setCreating] = useState(false);

  const createGame = async () => {
    try {
      const res = await createGameSessionReq(null, uid, null);
      const { id, status, code, game } = res;
      console.log("create game", res);
      navigate(`/game-session/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("오류가 발생했습니다.");
      setCreating(false);
    }
  };

  const deleteGame = async () => {
    try {
      await deleteGameSessionReq(session?.id);
      navigate(`/`);
    } catch (err) {
      console.error(err);
      toast.error("오류가 발생했습니다.");
      setCreating(false);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  const copyCode = () => {
    if (session?.code == null) return;
    toast.success("게임 코드가 복사되었습니다.");
    copyToClipboard("123456");
  };

  const getGameData = async () => {
    try {
      const res = await getGameReq(gameId);
      console.log("game data", res);
      setGame(res);
    } catch (err) {
      console.error(err);
      toast.error("오류가 발생했습니다.");
    }
  };

  const getSessionData = async () => {
    try {
      const res = await getGameSessionReq(sessionId);
      console.log("session data", res);
      setSession(res);
      setGame(res.game);
    } catch (err) {
      console.error(err);
      toast.error("오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (sessionId != null) {
      getSessionData();
      setCreating(true);
      return;
    }
    if (gameId != null) {
      getGameData();
    }
  }, [gameId, sessionId]);

  return (
    <>
      <div className="backward" onClick={goBack}>
        <div className="icon">
          <IoArrowBack />
        </div>
        <div className="label">뒤로가기</div>
      </div>
      <div className={"game-creation card" + JsxUtil.classByCondition(creating, "creating")}>
        <div className="header game-card">
          <div className="game-image img">
            <img alt="" src={"https://picsum.photos/200/300"} />
          </div>
          <div className="game-info">
            <div className="game-name">{game?.name}</div>
            <div className="game-description">{game?.description}</div>
            <div className="game-players">
              플레이어 {game?.minMembers}~{game?.maxMembers}명
            </div>
            <div className="game-initial-settings">
              <button className="game-btn" onClick={createGame}>
                {creating ? "시작하기" : "방 만들기"}
              </button>
              <div className="pw-setting">
                <div className="icon">
                  <IoLockClosed />
                </div>
                <div className="label">비밀번호 설정</div>
              </div>
            </div>
          </div>
        </div>
        <div className="body">
          {creating ? (
            <div className="content">
              <div className="game-code-section">
                <div className="label">게임코드</div>
                <div className="copy-section" onClick={copyCode}>
                  <div className="copy icon">
                    <IoCopy />
                  </div>
                  <div className="code">{session?.code}</div>
                </div>
              </div>
              <div className="setting-section">
                <div className="session-setting-btn">
                  <div className="icon">
                    <IoSettingsSharp />
                  </div>
                  <div className="label">게임 룰 설정</div>
                </div>
                <div className="session-setting-btn dangerous" onClick={deleteGame}>
                  <div className="icon">
                    <IoClose />
                  </div>
                  <div className="label">세션 삭제</div>
                </div>
              </div>
              <div className="participants-section">
                <div className="label">
                  참여자 ({session?.participants?.length}/{game?.maxMembers})
                </div>
                <div className="participants">
                  {session?.participants.map((e, ind) => {
                    return (
                      <div className="participant" key={e?.uid}>
                        <div className="nickname">{e?.nickname}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="placeholder">방을 만들어서 참여자를 모집하세요.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default GameSession;
