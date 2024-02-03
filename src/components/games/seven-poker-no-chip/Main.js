import { endGameSessionReq } from "Requests/Session.req";
import GameFooter from "components/GameFooter";
import useMenu from "hooks/useMenu";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import toast from "react-hot-toast";
import { FaCrown } from "react-icons/fa";
import {
  IoBook,
  IoClose,
  IoDocumentText,
  IoFilterSharp,
  IoHome,
  IoPeople,
  IoRefresh,
  IoSettingsSharp,
} from "react-icons/io5";
import { useOutletContext } from "react-router-dom";
import socketStore from "stores/socketStore";
import userStore from "stores/userStore";
import { SessionTopics } from "types/SocketTopics";
import { printf } from "util/Common";
import JsxUtil from "util/JsxUtil";
import "./Main.scss";
import { toMaxFixed, toRelFixed } from "util/MathUtil";
import DashBoard from "./DashBoard";

export const Pedigrees = [
  {
    label: "로티플",
    probability: 0.000032,
  },
  {
    label: "스티플",
    probability: 0.000279,
  },
  {
    label: "포카드",
    probability: 0.00168,
  },
  {
    label: "풀하우스",
    probability: 0.026,
  },
  {
    label: "플러시",
    probability: 0.0303,
  },
  {
    label: "마운틴",
    probability: 0.00462,
  },
  {
    label: "백스트레이트",
    probability: 0.00462,
  },
  {
    label: "스트레이트",
    probability: 0.03696,
  },
  {
    label: "트리플",
    probability: 0.0483,
  },
  {
    label: "투페어",
    probability: 0.235,
  },
  {
    label: "원페어",
    probability: 0.438,
  },
  {
    label: "탑",
    probability: 0.174209,
  },
];

const SevenPokerNoChip = forwardRef((props, _) => {
  const { ref, sessionId, session, isCreator, creatorUid, onMenuChange, goToDashboard } = useOutletContext();
  const { key, menus, setMenu } = useMenu(
    [
      {
        key: "dashboard",
        label: "대시보드",
        icon: <IoHome />,
      },
      {
        key: "gameRule",
        label: `게임 규칙`,
        icon: <IoBook />,
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

  console.log(Pedigrees.reduce((acc, e) => acc + (e.probability ?? 0), 0));

  const uid = userStore((state) => state.uid);
  const socket = socketStore((state) => state.socket);
  useImperativeHandle(
    ref,
    () => ({
      setMenu,
    }),
    [setMenu]
  );

  useEffect(() => {
    if (socket?.connected) {
      const onRoundStart = (data) => {
        printf("onRoundStart", data);
      };
      const onRoundEnd = (data) => {
        printf("onRoundEnd", data);
      };
      const onRoundStatus = (data) => {
        printf("onRoundStatus", data);
      };

      return () => {};
    }
  }, [socket?.connected, sessionId]);

  useEffect(() => {
    if (socket?.connected) {
      socket?.emitSession(sessionId, SessionTopics.ROUND_STATUS);
    }
  }, [socket?.connected]);

  return (
    <div className="game-panel">
      <div className="content">
        {
          {
            dashboard: <DashBoard />,
            gameRule: <GameRule />,
            participants: <Participants participants={session?.participants} creatorUid={creatorUid} />,
            settings: <Settings sessionId={sessionId} goToDashboard={goToDashboard} />,
          }[key]
        }
      </div>
      <GameFooter menus={menus} selectedMenuKey={key} />
    </div>
  );
});

const GameRule = ({}) => {
  return (
    <div className="panel game-rule">
      <div className="rule-box">
        <div className="title">게임 규칙</div>
        <div className="description">일반적인 세븐 포커 룰을 따릅니다.</div>
        <div className="description">
          이 게임 모드에서는 현실에서 카드로 게임을 하는데 칩이 없거나 가상 머니가 필요할 때 유용합니다.
        </div>
        <div className="description">
          세븐 포커에서의 기본적인 액션 (콜, 삥, 따당, 하프, 다이 등)을 취하셔야 다음 턴으로 진행됩니다.
        </div>
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

const Settings = ({ sessionId, stage, goToDashboard }) => {
  const socket = socketStore((state) => state.socket);

  const initializeSession = async () => {
    try {
      socket?.emitSession(sessionId, SessionTopics.ROUND_INITIALIZE);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "오류가 발생했습니다.");
    }
  };

  const endSession = async () => {
    try {
      await endGameSessionReq(sessionId);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "오류가 발생했습니다.");
    }
  };

  const menus = [
    {
      label: "모두에게 돈 추가하기",
      activeFilter: [],
      // onClick: initializeSession,
    },
  ];

  return (
    <div className="panel settings">
      <div className="menus">
        {menus.map((e, ind) => {
          return (
            <div className={"menu" + (e.activeFilter.includes(stage) ? "" : " inactive")} onClick={e.onClick} key={ind}>
              {e.label}
            </div>
          );
        })}
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

export default SevenPokerNoChip;
