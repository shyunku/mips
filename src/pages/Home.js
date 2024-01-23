import { findSessionReq, getJoinedSessionsReq, joinSessionReq } from "Requests/Session.req";
import Footer from "components/Footer";
import GameCard, { GameSessionCard } from "components/GameCard";
import IconInput from "components/IconInput";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { IoBarcode, IoLockClosed, IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import socketStore from "stores/socketStore";
import userStore from "stores/userStore";
import { SESSION_STATUS } from "types/Common";
import SocketTopics from "types/SocketTopics";

const Home = () => {
  const navigate = useNavigate();
  const uid = userStore((state) => state.uid);
  const [sessions, setSessions] = useState([]); // [{id, code, creator, status, game, ...}]
  const socket = socketStore((state) => state.socket);

  const [sessionCodeInput, setSessionCodeInput] = useState("");
  const [needPassword, setNeedPassword] = useState(false);
  const [foundSession, setFoundSession] = useState(false);

  const [waitingSessions, playingSessions, endedSessions] = useMemo(() => {
    const waiting = [];
    const playing = [];
    const ended = [];

    sessions.forEach((e) => {
      switch (e.status) {
        case SESSION_STATUS.WAITING:
          waiting.push(e);
          break;
        case SESSION_STATUS.PLAYING:
          playing.push(e);
          break;
        case SESSION_STATUS.ENDED:
          ended.push(e);
          break;
        default:
          console.error("Invalid session status");
          break;
      }
    });

    // sort
    const dateDescSorter = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
    waiting.sort(dateDescSorter);
    playing.sort(dateDescSorter);
    ended.sort(dateDescSorter);
    return [waiting, playing, ended];
  }, [sessions]);

  const sessionCodeInputHandler = async (e) => {
    setSessionCodeInput(e);
    setFoundSession(false);
    try {
      const res = await findSessionReq(e);
      if (res != null && typeof res == "boolean") {
        setNeedPassword(res);
        setFoundSession(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const joinSession = async () => {
    try {
      const res = await joinSessionReq(sessionCodeInput, null);
      const { id: sessionId } = res;
      console.log("join session", res);
      navigate(`/game-session/${sessionId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const getJoinedSessions = async () => {
    try {
      const res = await getJoinedSessionsReq();
      setSessions(res);
      console.log(res);
    } catch (err) {
      toast.error("세션 목록을 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    getJoinedSessions();
  }, []);

  useEffect(() => {
    if (socket?.connected) {
      const onSessionEnd = (sessionId) => {
        setSessions((s) => s.map((e) => (e.id === sessionId ? { ...e, status: SESSION_STATUS.ENDED } : e)));
        console.log("session end", sessionId);
      };

      socket.on(SocketTopics.SESSION_END, onSessionEnd);

      return () => {
        socket.off(SocketTopics.SESSION_END, onSessionEnd);
      };
    }
  }, [socket]);

  return (
    <>
      <div className="container join-game">
        <div className="label">게임 참여</div>
        <div className="sub-content">
          <IconInput
            className="input"
            icon={<IoBarcode />}
            placeholder={"게임 코드를 입력해서 참가하세요."}
            value={sessionCodeInput}
            onChange={(e) => sessionCodeInputHandler(e)}
          />
          {needPassword && (
            <IconInput
              className="input"
              type={"password"}
              icon={<IoLockClosed />}
              iconColor="#9D6FFF"
              placeholder={"해당 게임에 입장하려면 비밀번호를 입력해야합니다."}
            />
          )}
          {foundSession && (
            <div className="join-btn" onClick={joinSession}>
              참여하기
            </div>
          )}
        </div>
      </div>
      <div className="container waiting-games games">
        <div className="label">대기 중인 게임 ({waitingSessions.length})</div>
        <div className="sub-content">
          <div className="game-session-list">
            {waitingSessions.map((e, ind) => (
              <GameSessionCard key={ind} data={e} />
            ))}
          </div>
        </div>
      </div>
      <div className="container current-games games">
        <div className="label">진행 중인 게임 ({playingSessions.length})</div>
        <div className="sub-content">
          <div className="game-session-list">
            {playingSessions.map((e, ind) => (
              <GameSessionCard key={ind} data={e} />
            ))}
          </div>
        </div>
      </div>
      <div className="container previous-games games">
        <div className="label">지난 게임 ({endedSessions.length})</div>
        <div className="sub-content">
          <div className="game-session-list">
            {endedSessions.map((e, ind) => (
              <GameSessionCard key={ind} data={e} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
