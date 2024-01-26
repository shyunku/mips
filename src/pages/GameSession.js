import {
  IoArrowBack,
  IoBarcode,
  IoClose,
  IoCopy,
  IoLockClosed,
  IoPeople,
  IoSearch,
  IoSettingsSharp,
} from "react-icons/io5";
import "./GameSession.scss";
import { useEffect, useMemo, useState } from "react";
import JsxUtil from "util/JsxUtil";
import toast from "react-hot-toast";
import { copyToClipboard } from "util/Common";
import { useNavigate, useParams } from "react-router-dom";
import userStore from "stores/userStore";
import {
  createGameSessionReq,
  deleteGameSessionReq,
  getGameSessionReq,
  leaveSessionReq,
  startGameSessionReq,
} from "Requests/Session.req";
import { getGameReq } from "Requests/Game.req";
import socketStore from "stores/socketStore";
import SocketTopics from "types/SocketTopics";
import GoBackButton from "molecules/GoBackButton";
import { FaCrown } from "react-icons/fa";

const GameSession = () => {
  const navigate = useNavigate();
  const params = useParams();
  const socket = socketStore((state) => state.socket);
  const uid = userStore((state) => state.uid);

  const gameId = useMemo(() => params.gameId, [params]);
  const sessionId = useMemo(() => params.sessionId, [params]);

  const [session, setSession] = useState(null); // {id, code, creator, status, game, ...}
  const [game, setGame] = useState(null); // {gid, name, description, minMembers, maxMembers, ...}
  const creatorUid = useMemo(() => session?.creator?.uid, [session?.creator?.uid]);

  const [creating, setCreating] = useState(false);

  const creatorMode = useMemo(() => {
    return gameId != null || session?.creator?.uid === uid;
  }, [gameId, session?.creator?.uid, uid]);

  const createGame = async () => {
    try {
      console.log("create game");
      const res = await createGameSessionReq(null, null);
      const { id, status, code, game } = res;
      console.log("create game", res);
      navigate(`/game-session/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("오류가 발생했습니다.");
      setCreating(false);
    }
  };

  const leaveGame = async () => {
    try {
      await leaveSessionReq(session?.id);
      navigate(`/`);
    } catch (err) {
      console.error(err);
      toast.error("오류가 발생했습니다.");
    }
  };

  const deleteGame = async () => {
    try {
      await deleteGameSessionReq(session?.id);
      navigate(`/`);
    } catch (err) {
      console.error(err);
      toast.error("오류가 발생했습니다.");
    }
  };

  const copyCode = () => {
    if (session?.code == null) return;
    toast.success("게임 코드가 복사되었습니다.");
    copyToClipboard(session?.code);
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

  const startSession = async () => {
    try {
      await startGameSessionReq(session?.id);
      navigate(`/game/${game?.gid}/${session?.id}`);
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

  useEffect(() => {
    if (socket?.connected) {
      const onSessionJoin = (data) => {
        console.log("session join", data);
        setSession((s) => {
          return {
            ...s,
            participants: [...(s?.participants ?? []), data],
          };
        });
      };

      const onSessionLeave = (leaverUid) => {
        console.log("session leave", leaverUid);
        setSession((s) => {
          return {
            ...s,
            participants: s?.participants?.filter((e) => e?.uid !== leaverUid),
          };
        });
      };

      const onSessionStart = () => {
        toast.success("게임이 시작되었습니다.");
        navigate(`/game/${game?.gid}/${session?.id}`);
      };

      const onSessionEnd = () => {
        toast.success("게임이 종료되었습니다.");
        navigate("/");
      };

      socket.on(SocketTopics.SESSION_JOIN, onSessionJoin);
      socket.on(SocketTopics.SESSION_LEAVE, onSessionLeave);
      socket.on(SocketTopics.SESSION_START, onSessionStart);
      socket.on(SocketTopics.SESSION_END, onSessionEnd);

      return () => {
        socket.off(SocketTopics.SESSION_JOIN, onSessionJoin);
        socket.off(SocketTopics.SESSION_LEAVE, onSessionLeave);
        socket.off(SocketTopics.SESSION_START, onSessionStart);
        socket.off(SocketTopics.SESSION_END, onSessionEnd);
      };
    }
  }, [socket, game, session, navigate]);

  return (
    <>
      <GoBackButton />
      <div className={"game-creation card" + JsxUtil.classByCondition(creating, "creating")}>
        <div className={"header game-card" + JsxUtil.classByCondition(game?.deployed, "deployed")}>
          <div className="game-image img">
            <img alt="" src={`/assets/img/session/${game?.gid}.png`} />
          </div>
          <div className="game-info">
            <div className="game-name">{game?.name}</div>
            <div className="game-description">{game?.description}</div>
            <div className="game-players">
              플레이어 {game?.minMembers}~{game?.maxMembers}명
            </div>
            <div className="game-initial-settings">
              {creatorMode ? (
                <button className="game-btn" onClick={creating ? startSession : createGame}>
                  {creating ? "시작하기" : "방 만들기"}
                </button>
              ) : (
                <button className="game-btn leave" onClick={leaveGame}>
                  떠나기
                </button>
              )}
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
              {creatorMode && (
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
              )}

              <div className="participants-section">
                <div className="label">
                  참여자 ({session?.participants?.length}/{game?.maxMembers})
                </div>
                <div className="participants">
                  {(session?.participants ?? [])
                    .sort((a, b) => (b?.uid === creatorUid) - (a?.uid === creatorUid))
                    .map((e, ind) => {
                      return (
                        <div className={"participant" + JsxUtil.classByEqual(e?.uid, uid, "me")} key={e?.uid}>
                          <div className="icon">{e?.uid === creatorUid ? <FaCrown /> : <IoPeople />}</div>
                          <div className="nickname">
                            {e?.nickname}
                            {e?.uid === uid ? " (나)" : ""}
                          </div>
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
