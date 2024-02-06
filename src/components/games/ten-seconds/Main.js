import GameFooter from "components/GameFooter";
import useMenu from "hooks/useMenu";
import { IoClose, IoHome, IoPeople, IoPlay, IoRefresh, IoSettingsSharp } from "react-icons/io5";
import { FaCrown } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import userStore from "stores/userStore";
import JsxUtil from "util/JsxUtil";
import toast from "react-hot-toast";
import { endGameSessionReq } from "Requests/Session.req";
import { Doughnut } from "react-chartjs-2";
import "./Main.scss";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import socketStore from "stores/socketStore";
import useRepaint from "hooks/useRepaint";
import RateDoughnut from "components/RateDoughnut";
import { floatModal } from "molecules/Modal";
import { MODAL_TYPES } from "routers/ModalRouter";
import { printf } from "util/Common";
import { microNow } from "util/TimeUtil";
import { SessionTopics } from "types/SocketTopics";

const TOPICS = {
  STOP_COUNTER: "ten-seconds/stop-counter",
};

const STATUS = {
  WAITING: 0,
  STARTED: 1,
  WAITING_FOR_RESULT: 2,
  ENDED: 3,
};

const GameTenSeconds = forwardRef((props, _) => {
  const { ref, sessionId, session, isCreator, creatorUid, onMenuChange, goToDashboard } = useOutletContext();

  const { key, menus, setMenu } = useMenu(
    [
      {
        key: "dashboard",
        label: "대시보드",
        icon: <IoHome />,
      },
      {
        key: "participants",
        label: `참여자(${session?.participants?.length ?? 0})`,
        icon: <IoPeople />,
      },
      isCreator && {
        key: "settings",
        label: "진행 설정",
        icon: <IoSettingsSharp />,
      },
    ].filter(Boolean),
    null,
    onMenuChange
  );

  useImperativeHandle(
    ref,
    () => ({
      setMenu,
    }),
    [setMenu]
  );

  return (
    <div className="game-panel">
      <div className="content">
        {
          {
            dashboard: <DashBoard sessionId={sessionId} />,
            participants: <Participants participants={session?.participants} creatorUid={creatorUid} />,
            settings: <Settings sessionId={sessionId} goToDashboard={goToDashboard} />,
          }[key]
        }
      </div>
      <GameFooter menus={menus} selectedMenuKey={key} />
    </div>
  );
});

const DashBoard = ({ sessionId }) => {
  const socket = socketStore((state) => state.socket);
  const [counterStartTime, setCounterStartTime] = useState(null);
  const [status, setStatus] = useState(0);
  const [stoppedAt, setStoppedAt] = useState(null);
  const [rating, setRating] = useState(null); // [uid, rating
  const uid = userStore((state) => state.uid);
  const counterTime = counterStartTime != null ? microNow() - counterStartTime : 0;

  useRepaint();

  const stopCounter = async () => {
    try {
      const stopwatch = parseInt((microNow() - counterStartTime) * 10000) / 10000;
      socket?.emitSession(sessionId, TOPICS.STOP_COUNTER, stopwatch);
      setStoppedAt(stopwatch);
      setStatus(STATUS.WAITING_FOR_RESULT);
    } catch (err) {
      console.error(err);
      toast.error("오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (socket?.connected) {
      const onCounterStart = () => {
        console.log("counter started");
        setStatus(STATUS.STARTED);
        setCounterStartTime(microNow());
      };
      const onCounterEnded = (data) => {
        console.log("counter ended", data);
        const { sessionId: sid, results } = data;
        if (sessionId != sid) return;

        setStatus(STATUS.ENDED);
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          if (result.uid == uid) {
            setRating(result.rating);
            break;
          }
        }
        printf("results", results);
        toast.success("카운트가 종료되었습니다.");

        setTimeout(() => {
          floatModal(MODAL_TYPES.TEN_SECONDS.RESULT, {
            state: {
              results,
            },
          });
        }, 500);
      };
      const onInitialize = () => {
        console.log("initialize");
        toast.success("라운드가 초기화되었습니다.");
        setStatus(STATUS.WAITING);
        setStoppedAt(null);
        setRating(null);
      };

      socket.on(SessionTopics.ROUND_START, onCounterStart);
      socket.on(SessionTopics.ROUND_ENDED, onCounterEnded);
      socket.on(SessionTopics.ROUND_INITIALIZE, onInitialize);

      return () => {
        socket.off(SessionTopics.ROUND_START, onCounterStart);
        socket.off(SessionTopics.ROUND_ENDED, onCounterEnded);
        socket.off(SessionTopics.ROUND_INITIALIZE, onInitialize);
      };
    }
  }, [socket?.connected, sessionId]);

  return (
    <div className="panel dashboard">
      <div className="counter">
        <div className="counter-wrapper">
          <RateDoughnut
            enableTransition={false}
            current={
              {
                [STATUS.WAITING]: 0,
                [STATUS.STARTED]: microNow() - counterStartTime,
                [STATUS.WAITING_FOR_RESULT]: stoppedAt,
                [STATUS.ENDED]: stoppedAt,
              }[status] ?? 0
            }
            max={10}
          />
          <div className="time">
            {
              {
                [STATUS.WAITING]: `기다리세요...`,
                [STATUS.STARTED]: `${counterTime.toFixed(4)}초`,
                [STATUS.WAITING_FOR_RESULT]: `${stoppedAt?.toFixed(4)}초`,
                [STATUS.ENDED]: `${rating != null ? `${rating}위` : "버스트"}`,
              }[status]
            }
          </div>
        </div>
        <div className="controller">
          <button className="btn" disabled={status !== STATUS.STARTED} onClick={stopCounter}>
            STOP
          </button>
        </div>
      </div>
      <div className="game-rule">
        <div className="title">게임 규칙</div>
        <div className="description">10초에 가장 근접하여 STOP한 사람이 승리합니다!</div>
        <div className="description">10초를 초과하면 버스트됩니다.</div>
        <div className="description">방장의 경우 "진행 설정" 탭에서 카운트를 시작할 수 있습니다.</div>
      </div>
    </div>
  );
};

const Participants = ({ participants = [], creatorUid }) => {
  const uid = userStore((state) => state.uid);
  return (
    <div className="panel participants">
      <div className="participant-list">
        {participants
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
  );
};

const Settings = ({ sessionId, goToDashboard }) => {
  const socket = socketStore((state) => state.socket);

  const startCount = async () => {
    try {
      socket?.emitSession(sessionId, SessionTopics.ROUND_START);
      goToDashboard();
    } catch (err) {
      console.error(err);
      toast.error("오류가 발생했습니다.");
    }
  };

  const initializeSession = async () => {
    try {
      socket?.emitSession(sessionId, SessionTopics.ROUND_INITIALIZE);
      // goToDashboard();
      toast.success("라운드가 초기화되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error("오류가 발생했습니다.");
    }
  };

  const endSession = async () => {
    try {
      await endGameSessionReq(sessionId);
    } catch (err) {
      console.error(err);
      toast.error("오류가 발생했습니다.");
    }
  };

  return (
    <div className="panel settings">
      <div className="menus">
        <div className="menu" onClick={startCount}>
          <div className="icon">
            <IoPlay />
          </div>
          <div className="label">카운트 시작하기</div>
        </div>
        <div className="menu" onClick={initializeSession}>
          <div className="icon">
            <IoRefresh />
          </div>
          <div className="label">한번 더 하기</div>
        </div>
        <div className="menu dangerous" onClick={endSession}>
          <div className="icon">
            <IoClose />
          </div>
          <div className="label">세션 종료</div>
        </div>
      </div>
    </div>
  );
};

export default GameTenSeconds;
