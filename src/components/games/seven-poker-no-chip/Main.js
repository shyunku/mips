import { endGameSessionReq } from "Requests/Session.req";
import GameFooter from "components/GameFooter";
import useMenu from "hooks/useMenu";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
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
import { toCurrency, toMaxFixed, toRelFixed } from "util/MathUtil";
import DashBoard from "./DashBoard";
import { floatModal } from "molecules/Modal";
import { MODAL_TYPES } from "routers/ModalRouter";

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

const GameName = "seven-poker-nochip";

const Topics = {
  INITIAL_SETTING: `${GameName}/initial-setting`,
  START: `${GameName}/start`,
  BET: `${GameName}/bet`,
  WIN: `${GameName}/win`,
  STATE_CHANGE: `${GameName}/state-change`,
  GIVE_MONEY_TO_ALL: `${GameName}/give-money-to-all`,
  GIVE_MONEY_TO: `${GameName}/give-money-to`,
  GAME_END: `${GameName}/game-end`,
};

export const Stage = {
  INITIAL: "initial",
  READY: "ready",
  BET: "bet",
};

export const StageNames = {
  [Stage.INITIAL]: "초기 설정 중...",
  [Stage.READY]: "게임 시작 전...",
  [Stage.BET]: "베팅 중...",
};

export const BetType = {
  CALL: "call",
  HALF: "half",
  BBING: "bbing",
  DDADANG: "ddadang",
  DIE: "die",
};

export const BetProcessType = {
  NORMAL: "normal",
  CALL: "call",
};

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

  useImperativeHandle(ref, () => ({ setMenu }), [setMenu]);

  // printf(
  //   "prob sum",
  //   Pedigrees.reduce((acc, e) => acc + (e.probability ?? 0), 0)
  // );

  const uid = userStore((state) => state.uid);
  const socket = socketStore((state) => state.socket);
  const [stage, setStage] = useState(Stage.INITIAL);

  const [members, setMembers] = useState({});
  const [turnOrder, setTurnOrder] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [currentBetType, setCurrentBetType] = useState(null);
  const [pot, setPot] = useState("0");
  const [currentBet, setCurrentBet] = useState("0");

  const myOrderIndex = useMemo(() => {
    return turnOrder?.findIndex((e) => e === uid) ?? -1;
  }, [turnOrder, uid]);

  const sendBet = async (betType) => {
    try {
      socket?.emitSession(sessionId, Topics.BET, betType);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "오류가 발생했습니다.");
    }
  };

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
        const { stage, pot, currentBet, currentTurn, currentBetType, turnOrder, members } = data;
        setStage(stage);
        setPot(pot);
        setCurrentTurn(currentTurn);
        setTurnOrder(turnOrder);
        setCurrentBet(currentBet);
        setCurrentBetType(currentBetType);
        setMembers((members ?? []).reduce((acc, e) => ({ ...acc, [e.uid]: e }), {}));
      };
      const onInitialize = () => {
        printf("onInitialize");
        toast.success("라운드가 초기화되었습니다.");
        setStage(Stage.INITIAL);
      };

      const onInitialSetting = (data) => {
        printf("onInitialSetting", data);
        const { order, members: memberMap, initialGold } = data;
        setStage(Stage.READY);
        setTurnOrder(order);
        setMembers((memberMap ?? []).reduce((acc, e) => ({ ...acc, [e.uid]: e }), {}));
      };
      const onStart = (data) => {
        printf("onStart", data);
        const { pot, round, currentTurn } = data;
        setPot(pot);
        setStage(Stage.BET);
        setCurrentTurn(currentTurn);
      };
      const onStateChange = (data) => {
        printf("onStateChange", data);
        socket?.emitSession(sessionId, SessionTopics.ROUND_STATUS);
      };
      const onWin = (data) => {
        printf("onWin", data);
        const { uid, nickname, earned } = data;
        toast.success(`${nickname}님이 ${toCurrency(earned)}원을 획득했습니다.`);
      };

      socket?.on(SessionTopics.ROUND_START, onRoundStart);
      socket?.on(SessionTopics.ROUND_ENDED, onRoundEnd);
      socket?.on(SessionTopics.ROUND_STATUS, onRoundStatus);
      socket?.on(SessionTopics.ROUND_INITIALIZE, onInitialize);
      socket?.on(Topics.INITIAL_SETTING, onInitialSetting);
      socket?.on(Topics.START, onStart);
      socket?.on(Topics.STATE_CHANGE, onStateChange);
      socket?.on(Topics.WIN, onWin);

      return () => {
        socket?.off(SessionTopics.ROUND_START, onRoundStart);
        socket?.off(SessionTopics.ROUND_ENDED, onRoundEnd);
        socket?.off(SessionTopics.ROUND_STATUS, onRoundStatus);
        socket?.off(SessionTopics.ROUND_INITIALIZE, onInitialize);
        socket?.off(Topics.INITIAL_SETTING, onInitialSetting);
        socket?.off(Topics.START, onStart);
        socket?.off(Topics.STATE_CHANGE, onStateChange);
        socket?.off(Topics.WIN, onWin);
      };
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
            dashboard: (
              <DashBoard
                stage={stage}
                pot={pot}
                currentBet={currentBet}
                members={members}
                myOrderIndex={myOrderIndex}
                turnOrder={turnOrder}
                currentTurn={currentTurn}
                currentBetType={currentBetType}
                sendBet={sendBet}
              />
            ),
            gameRule: <GameRule />,
            participants: <Participants participants={session?.participants} creatorUid={creatorUid} />,
            settings: <Settings sessionId={sessionId} goToDashboard={goToDashboard} stage={stage} session={session} />,
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
        <div className="description">
          방장은 포커 게임 중 승리자가 결정된 경우 진행 설정에서 게임을 종료할 수 있습니다.
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

const Settings = ({ sessionId, stage, session, goToDashboard }) => {
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
      label: "순서 정하기 및 게임 시작",
      activeFilter: [Stage.INITIAL],
      onClick: () => {
        console.log(session?.participants);
        floatModal(MODAL_TYPES.SEVEN_POKER_NO_CHIP.SET_ORDER, {
          state: {
            participants: session?.participants ?? [],
          },
          closeHandler: (result) => {
            try {
              const { order, startingMoney, initialMoney } = result;
              socket?.emitSession(sessionId, Topics.INITIAL_SETTING, {
                order,
                initialGold: initialMoney,
                startBetGold: startingMoney,
              });
              // console.log(result);
            } catch (err) {
              console.error(err);
              toast.error(err?.response?.data?.message ?? "오류가 발생했습니다.");
            }
          },
        });
      },
    },
    {
      label: "게임 시작",
      activeFilter: [Stage.READY],
      onClick: () => {
        socket?.emitSession(sessionId, SessionTopics.ROUND_START);
        goToDashboard();
      },
    },
    {
      label: "우승자 결정 (팟 금액 지급)",
      activeFilter: [Stage.READY],
      onClick: () => {
        socket?.emitSession(sessionId, Topics.WIN, null);
        goToDashboard();
      },
    },
    {
      label: "모두에게 돈 주기",
      activeFilter: [],
      // onClick: initializeSession,
    },
    {
      label: "특정 멤버에게 돈 주기",
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
