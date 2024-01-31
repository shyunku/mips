import { createRef, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { getGameSessionReq } from "Requests/Session.req";
import GoBackButton from "molecules/GoBackButton";
import "./GameLayout.scss";
import userStore from "stores/userStore";
import GameSession from "pages/GameSession";
import { GameSessionCard, InGameCard } from "components/GameCard";
import GameFooter from "components/GameFooter";
import socketStore from "stores/socketStore";
import SocketTopics from "types/SocketTopics";

const GameLayout = () => {
  const navigate = useNavigate();
  const params = useParams();
  const uid = userStore((state) => state.uid);
  const nickname = userStore((state) => state.nickname);
  const sessionId = useMemo(() => params.sessionId, [params]);
  const [session, setSession] = useState(null); // {id, code, creator, status, game, ...}
  const creatorUid = useMemo(() => session?.creator?.uid, [session?.creator?.uid]);
  const isCreator = useMemo(() => uid === creatorUid, [uid, creatorUid]);

  const socket = socketStore((state) => state.socket);

  const gameMainRef = useRef(null);

  const getSessionData = async () => {
    try {
      const res = await getGameSessionReq(sessionId);
      console.log("session data", res);
      setSession(res);
    } catch (err) {
      console.error(err);
      toast.error("오류가 발생했습니다.");
    }
  };

  const goToDashboard = () => {
    gameMainRef?.current?.setMenu("dashboard");
  };

  useEffect(() => {
    getSessionData();
  }, []);

  useEffect(() => {
    if (socket?.connected) {
      const onSessionEnd = () => {
        toast.success("게임이 종료되었습니다.");
        navigate("/");
      };

      socket.on(SocketTopics.SESSION_END, onSessionEnd);

      return () => {
        socket.off(SocketTopics.SESSION_END, onSessionEnd);
      };
    }
  }, [socket?.connected]);

  return (
    <div className="game-layout-wrapper">
      <div className="game-layout">
        <div className="game-header">
          <div className="top-line">
            <GoBackButton handler={(e) => navigate("/")} />
            <div className="nickname">{nickname ?? "???"}</div>
          </div>
          <InGameCard data={session} />
        </div>
        <div className="game-content">
          <Outlet
            context={{
              ref: gameMainRef,
              sessionId,
              session,
              isCreator,
              creatorUid,
              goToDashboard,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GameLayout;
