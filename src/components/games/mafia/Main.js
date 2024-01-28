import GameFooter from "components/GameFooter";
import useMenu from "hooks/useMenu";
import {
  IoClose,
  IoDocumentText,
  IoFilterSharp,
  IoHome,
  IoPeople,
  IoPlay,
  IoRefresh,
  IoSettingsSharp,
} from "react-icons/io5";
import { FaCrown } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import userStore from "stores/userStore";
import JsxUtil from "util/JsxUtil";
import toast from "react-hot-toast";
import { endGameSessionReq } from "Requests/Session.req";
import "./Main.scss";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import socketStore from "stores/socketStore";
import { printf } from "util/Common";
import { SessionTopics } from "types/SocketTopics";

const GAME_NAME = "mafia";

export const TOPICS = {
  NEED_JOB_SETTING: `${GAME_NAME}/need-job-setting`, // -> 방장
  JOB_SETTING: `${GAME_NAME}/job-setting`, // <- 방장
  JOB_CONFIRMING: `${GAME_NAME}/job-confirming`, // -> 모든 유저
  GAME_READY: `${GAME_NAME}/game-ready`, // <- 방장
  START_VOTE: `${GAME_NAME}/start-vote`, // <- 방장
  VOTE: `${GAME_NAME}/vote`, // <- 모든 유저
  VOTE_COMPLETE: `${GAME_NAME}/vote-complete`, // -> 모든 유저
  VOTE_CONFIRM: `${GAME_NAME}/vote-confirm`, // <- 방장
  REVOTE_WAITING: `${GAME_NAME}/revote-waiting`,
  VOTE_RESULT_DECIDE: `${GAME_NAME}/vote-result-decide`, // -> 모든 유저
  EXECUTED: `${GAME_NAME}/executed`, // -> 모든 유저
  NO_ONE_EXECUTED: `${GAME_NAME}/no-one-executed`, // -> 모든 유저
  START_DAY: `${GAME_NAME}/start-day`, // -> 모든 유저
  START_NIGHT: `${GAME_NAME}/start-night`, // <- 방장, -> 모든 유저
  MAFIA_KILL_START: `${GAME_NAME}/mafia-kill-start`, // <- 방장, -> 모든 유저
  MAFIA_KILL: `${GAME_NAME}/mafia-kill`, // <-> 마피아
  MAFIA_KILL_DECIDE: `${GAME_NAME}/mafia-kill-decide`, // -> 모든 유저
  MAFIA_KILL_TARGET_MISMATCH: `${GAME_NAME}/mafia-kill-target-mismatch`, // -> 마피아
  MAFIA_KILL_VOTE_COMPLETE: `${GAME_NAME}/mafia-kill-vote-complete`, // -> 모든 유저
  POLICE_INVESTIGATE_START: `${GAME_NAME}/police-investigate-start`, // <- 방장, -> 모든 유저
  POLICE_INVESTIGATE: `${GAME_NAME}/police-investigate`, // <-> 경찰
  POLICE_INVESTIGATE_RESULT: `${GAME_NAME}/police-investigate-result`, // -> 모든 유저
  DOCTOR_HEAL_START: `${GAME_NAME}/doctor-heal-start`, // <- 방장, -> 모든 유저
  DOCTOR_HEAL: `${GAME_NAME}/doctor-heal`, // <-> 의사
  DOCTOR_HEAL_DECIDE: `${GAME_NAME}/doctor-heal-decide`, // -> 모든 유저
  NIGHT_RESULT_ANNOUNCEABLE: `${GAME_NAME}/night-result-announceable`, // -> 방장
  NIGHT_RESULT: `${GAME_NAME}/night-result`, // -> 모든 유저
  MURDERED: `${GAME_NAME}/murdered`, // -> 모든 유저
  REVIVED: `${GAME_NAME}/revived`, // -> 모든 유저
  MAFIA_WIN: `${GAME_NAME}/mafia-win`,
  MEMO: `${GAME_NAME}/memo`,
  CITIZEN_WIN: `${GAME_NAME}/citizen-win`,
  LOG: `${GAME_NAME}/log`,
};

const Stage = {
  INITIAL: "initial", // 초기 단계
  NEED_JOB_SETTING: "need-job-setting", // 직업 설정 단계
  JOB_CONFIRMING: "job-confirming", // 직업 확인 단계
  NIGHT_RESULT_ANNOUNCEMENT: "night-result-announcement", // 밤 결과 발표 단계
  PROCESS_DAY: "process-day", // 낮 단계 (회의)
  VOTE_FOR_EXECUTION: "vote-for-execution", // 투표 단계 (투표)
  EXECUTION_CONFIGM: "execution-confirm", // 처형 확인 단계
  WAITING_FOR_REVOTE: "waiting-for-revote", // 재투표 대기 단계 (방장 결정: 그냥 진행[투표 무시] or 재투표)
  PROCESS_NIGHT: "process-night",
  MAFIA_KILL: "mafia-kill",
  POLICE_INVESTIGATE: "police-investigate",
  DOCTOR_HEAL: "doctor-heal",
  END: "end",
};

const StageNames = {
  [Stage.INITIAL]: "시작 전",
  [Stage.NEED_JOB_SETTING]: "직업 설정 중...",
  [Stage.JOB_CONFIRMING]: "직업 확인 중...",
  [Stage.NIGHT_RESULT_ANNOUNCEMENT]: "밤 결과 발표 중...",
  [Stage.PROCESS_DAY]: "낮 (회의 중...)",
  [Stage.VOTE_FOR_EXECUTION]: "사형 투표 중...",
  [Stage.EXECUTION_CONFIGM]: "사형 찬반 투표 중...",
  [Stage.WAITING_FOR_REVOTE]: "재투표/진행 대기 중...",
  [Stage.PROCESS_NIGHT]: "밤 (진행 중...)",
  [Stage.MAFIA_KILL]: "밤 (마피아 킬 지목 중...)",
  [Stage.POLICE_INVESTIGATE]: "밤 (경찰 조사 중...)",
  [Stage.DOCTOR_HEAL]: "밤 (의사가 살릴 사람 선택 중...)",
  [Stage.END]: "게임 종료됨",
};

const Jobs = {
  CITIZEN: "citizen",
  MAFIA: "mafia",
  POLICE: "police",
  DOCTOR: "doctor",
};

const JobNames = {
  [Jobs.CITIZEN]: "시민",
  [Jobs.MAFIA]: "마피아",
  [Jobs.POLICE]: "경찰",
  [Jobs.DOCTOR]: "의사",
};

const Mafia = forwardRef((props, _) => {
  const { ref, sessionId, session, isCreator, creatorUid, onMenuChange, goToDashboard } = useOutletContext();
  const [sessionReady, setSessionReady] = useState(false);
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
      {
        key: "memo",
        label: `메모장`,
        icon: <IoDocumentText />,
      },
      {
        key: "logs",
        label: `진행 상황`,
        icon: <IoFilterSharp />,
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

  const uid = userStore((state) => state.uid);
  const socket = socketStore((state) => state.socket);

  const [stage, setStage] = useState(Stage.INITIAL);
  const [logs, setLogs] = useState([]);
  const [voteCount, setVoteCount] = useState(0);
  const [voteConfirmCount, setVoteConfirmCount] = useState(0);
  const [mafiaKillVoteCount, setMafiaKillVoteCount] = useState(0);
  const [aliveMafiaCount, setAliveMafiasCount] = useState(0);
  const [participantMap, setParticipantMap] = useState({});
  const [voteResult, setVoteResult] = useState([]);
  const [executeTargetUid, setExecuteTargetUid] = useState(null);
  const [dayCount, setDayCount] = useState(0);
  const [mafiaWin, setMafiaWin] = useState(null);

  const aliveCount = useMemo(() => {
    return Object.keys(participantMap).filter((e) => participantMap[e]?.alive).length;
  }, [participantMap]);
  const myStatus = useMemo(() => {
    return participantMap[uid] ?? null;
  }, [uid, participantMap]);
  const myJob = useMemo(() => {
    return myStatus?.job ?? null;
  }, [myStatus?.job]);
  const myVote = useMemo(() => {
    return myStatus?.vote ?? null;
  }, [myStatus?.vote]);
  const myExecutionAgree = useMemo(() => {
    return myStatus?.agreeExecution ?? null;
  }, [myStatus?.agreeExecution]);
  const myMafiaKillVote = useMemo(() => {
    return myStatus?.victimForMafia ?? null;
  }, [myStatus?.victimForMafia]);
  const myMemo = useMemo(() => {
    return myStatus?.memo ?? "";
  }, [myStatus?.memo]);
  const amIAlive = useMemo(() => {
    return myStatus == null ? true : myStatus?.alive ?? false;
  }, [myStatus?.alive]);

  useImperativeHandle(
    ref,
    () => ({
      setMenu,
    }),
    [setMenu]
  );

  const sendVote = async (targetUid) => {
    socket?.emitSession(sessionId, TOPICS.VOTE, targetUid);
    setParticipantMap((m) => {
      return {
        ...m,
        [uid]: {
          ...m[uid],
          vote: targetUid,
        },
      };
    });
  };

  const sendVoteConfirm = async (agree) => {
    socket?.emitSession(sessionId, TOPICS.VOTE_CONFIRM, agree);
    setParticipantMap((m) => {
      return {
        ...m,
        [uid]: {
          ...m[uid],
          agreeExecution: agree,
        },
      };
    });
  };

  const sendMafiaKillVote = async (targetUid) => {
    socket?.emitSession(sessionId, TOPICS.MAFIA_KILL, targetUid);
  };

  const sendPoliceInvestigate = async (targetUid) => {
    socket?.emitSession(sessionId, TOPICS.POLICE_INVESTIGATE, targetUid);
  };

  const sendDoctorHeal = async (targetUid) => {
    socket?.emitSession(sessionId, TOPICS.DOCTOR_HEAL, targetUid);
  };

  const sendMemo = async (memo) => {
    socket?.emitSession(sessionId, TOPICS.MEMO, memo);
  };

  useEffect(() => {
    if (socket?.connected) {
      const onRoundStart = () => {
        console.log("round started");
        setStage(Stage.NEED_JOB_SETTING);
      };
      const onRoundEnd = (data) => {
        console.log("round end");
        setStage(Stage.END);
      };
      const onRoundStatus = (data) => {
        printf("onRoundStatus", data); // {eventLog, jobSet, participants, stage, time}
        const {
          jobSet,
          stage,
          participants,
          voteCount,
          voteConfirmCount,
          nextToBeVoteKilled,
          mafiaKillVoteCount,
          aliveMafiaCount,
          dayCount,
          mafiaWin,
        } = data; // participants: []{uid, nickname, vote, alive, agreeExecution}
        setStage(stage);
        setParticipantMap(participants.reduce((acc, e) => ({ ...acc, [e.uid]: e }), {}));
        setSessionReady(true);
        setVoteCount(voteCount);
        setVoteConfirmCount(voteConfirmCount);
        setExecuteTargetUid(nextToBeVoteKilled);
        setMafiaKillVoteCount(mafiaKillVoteCount);
        setAliveMafiasCount(aliveMafiaCount);
        setDayCount(dayCount);
        setMafiaWin(mafiaWin);
      };
      const onInitialize = () => {
        console.log("initialize");
        toast.success("라운드가 초기화되었습니다.");
        setStage(Stage.NEED_JOB_SETTING);
        setParticipantMap({});
        setVoteCount(0);
        setVoteResult([]);
        setExecuteTargetUid(null);
        setMafiaKillVoteCount(0);
        setLogs([]);
        setAliveMafiasCount(0);
        setDayCount(0);
        setMafiaWin(null);
      };

      const onNeedJobSetting = (data) => {
        printf("onNeedJobSetting", data);
        setStage(Stage.NEED_JOB_SETTING);
      };
      const onJobSetting = (data) => {
        printf("onJobSetting", data);
        const { job } = data;
        setParticipantMap((m) => {
          return {
            ...m,
            [uid]: {
              ...m[uid],
              job,
            },
          };
        });
        toast.success(`당신은 ${JobNames[job] ?? "??"}입니다.`, {
          duration: 3000,
        });
      };
      const onJobConfirming = (data) => {
        printf("onJobConfirming", data);
        setStage(Stage.JOB_CONFIRMING);
      };
      const onGameReady = (data) => {
        printf("onGameReady", data);
        setStage(Stage.JOB_CONFIRMING);
      };
      const onStartVote = (data) => {
        printf("onStartVote", data);
        setStage(Stage.VOTE_FOR_EXECUTION);
        setParticipantMap((m) => {
          return Object.keys(m).reduce((acc, e) => {
            return {
              ...acc,
              [e]: {
                ...m[e],
                vote: null,
              },
            };
          }, {});
        });
      };
      const onVote = (data) => {
        printf("onVote", data);
        const { voteCount } = data;
        setVoteCount(voteCount);
      };
      const onVoteConfirm = (data) => {
        printf("onVoteConfirm", data);
        const { voteConfirmCount } = data;
        setVoteConfirmCount(voteConfirmCount);
      };
      const onRevoteWaiting = (data) => {
        printf("onRevoteWaiting", data);
        toast.success("결과가 모호하여 재투표가 필요합니다.", { duration: 3000 });
        setStage(Stage.WAITING_FOR_REVOTE);
      };
      const onVoteComplete = (data) => {
        printf("onVoteComplete", data); // []{uid, nickname, voteCount}
        toast.success("투표가 완료되었습니다.");
        setVoteResult(data);
      };
      const onVoteResultDecide = (data) => {
        printf("onVoteResultDecide", data); // {targetUid, targetNickname}
        const { targetUid, targetNickname } = data;
        toast.success(`${targetNickname}님을 처형할지 결정하세요.`, { duration: 3000 });
        setStage(Stage.EXECUTION_CONFIGM);
        setExecuteTargetUid(targetUid);
      };
      const onExecuted = (data) => {
        printf("onExecuted", data); // {targetUid, targetNickname}
        toast.success(`${data.targetNickname}님이 처형되었습니다.`);
        const { targetUid, targetNickname } = data;
        setParticipantMap((m) => {
          return {
            ...m,
            [targetUid]: {
              ...m[targetUid],
              alive: false,
            },
          };
        });
        setExecuteTargetUid(targetUid);
      };
      const onNoOneExecuted = (data) => {
        printf("onNoOneExecuted", data);
        toast.success("아무도 처형되지 않았습니다.");
      };
      const onStartDay = (data) => {
        printf("onStartDay", data);
        setStage(Stage.PROCESS_DAY);
        toast.success("낮이 되었습니다.");
        setDayCount((c) => c + 1);
        setVoteCount(0);
        setVoteConfirmCount(0);
        setVoteResult([]);
        setExecuteTargetUid(null);
        setMafiaKillVoteCount(0);
        setParticipantMap((m) => {
          return Object.keys(m).reduce((acc, e) => {
            return {
              ...acc,
              [e]: {
                ...m[e],
                vote: null,
                victimForMafia: null,
                agreeExecution: null,
              },
            };
          }, {});
        });
      };
      const onStartNight = (data) => {
        printf("onStartNight", data);
        setStage(Stage.PROCESS_NIGHT);
        toast.success("밤이 되었습니다.");
      };
      const onMafiaKillStart = (data) => {
        printf("onMafiaKillStart", data);
        setStage(Stage.MAFIA_KILL);
        // toast.success("마피아가 죽일 사람을 고르고 있습니다.");
      };
      const onMafiaKill = (data) => {
        printf("onMafiaKill", data);
        toast.success("죽일 사람을 고르세요.");
        const { aliveMafiaCount } = data;
        setAliveMafiasCount(aliveMafiaCount);
      };
      const onMafiaKillDecide = (data) => {
        printf("onMafiaKillDecide", data);
        const {
          sourceUid,
          sourceNickname,
          targetUid,
          targetNickname,
          mafiaKillVoteCount,
          aliveMafiaCount,
          voteCurrentResult,
        } = data;
        // toast.success(`${sourceNickname} (마피아)가 죽일 사람으로 ${targetNickname}를 선택했습니다.`);
        setMafiaKillVoteCount(mafiaKillVoteCount);
        setAliveMafiasCount(aliveMafiaCount);
        setParticipantMap((m) => {
          return {
            ...m,
            [sourceUid]: {
              ...m[sourceUid],
              victimForMafia: targetUid,
            },
          };
        });
      };
      const onMafiaKillVoteComplete = (data) => {
        printf("onMafiaKillVoteComplete", data);
        // toast.success("마피아(가/들이) 죽일 사람을 골랐습니다.");
      };
      const onMafiaKillTargetMismatch = (data) => {
        printf("onMafiaKillTargetMismatch", data);
        toast.success("마피아(가/들이) 고른 사람이 모호합니다.");
      };
      const onPoliceInvestigateStart = (data) => {
        printf("onPoliceInvestigateStart", data);
        setStage(Stage.POLICE_INVESTIGATE);
        // toast.success("경찰이 조사할 사람을 고르고 있습니다.");
      };
      const onPoliceInvestigate = (data) => {
        printf("onPoliceInvestigate", data);
        toast.success("조사할 사람을 고르세요.");
      };
      const onPoliceInvestigateResult = (data) => {
        printf("onPoliceInvestigateResult", data);
        const { targetUid, targetNickname, job } = data;
        toast.success(`${targetNickname}님은 ${JobNames[job] ?? "???"}입니다.`, {
          duration: 5000,
        });
      };
      const onDoctorHealStart = (data) => {
        printf("onDoctorHealStart", data);
        setStage(Stage.DOCTOR_HEAL);
        // toast.success("의사가 살릴 사람을 고르고 있습니다.");
      };
      const onDoctorHeal = (data) => {
        printf("onDoctorHeal", data);
        toast.success("살릴 사람을 고르세요.");
      };
      const onDoctorHealDecide = (data) => {
        printf("onDoctorHealDecide", data);
        // toast.success("의사가 살릴 사람을 골랐습니다.");
      };
      const onNightResultAnnounceable = (data) => {
        printf("onNightResultAnnounceable", data);
        toast.success("밤 결과를 발표할 수 있습니다.", { duration: 5000 });
        setStage(Stage.NIGHT_RESULT_ANNOUNCEMENT);
      };
      const onNightResult = (data) => {
        printf("onNightResult", data);
        toast.success("밤 결과를 발표합니다.");
      };
      const onMurdered = (data) => {
        printf("onMurdered", data);
        const { targetUid, targetNickname } = data;
        toast.success(`${targetNickname}가 죽었고, 의사는 살리지 못했습니다.`, { duration: 5000 });
        setParticipantMap((m) => {
          return {
            ...m,
            [targetUid]: {
              ...m[targetUid],
              alive: false,
            },
          };
        });
      };
      const onRevived = (data) => {
        printf("onRevived", data);
        const { targetUid, targetNickname } = data;
        toast.success(`${targetNickname}가 마피아에 의해 죽을뻔 했지만 의사에 의해 살아났습니다.`, { duration: 5000 });
      };
      const onMafiaWin = (data) => {
        printf("onMafiaWin", data);
        toast.success("마피아가 승리했습니다.", {
          duration: 5000,
        });
      };
      const onCitizenWin = (data) => {
        printf("onCitizenWin", data);
        toast.success("시민이 승리했습니다.", {
          duration: 5000,
        });
      };
      const onMemo = (data) => {
        printf("onMemo", data);
        setParticipantMap((m) => {
          return {
            ...m,
            [uid]: {
              ...m[uid],
              memo: data,
            },
          };
        });
      };
      const onLog = (data) => {
        printf("onLog", data);
        setLogs([...logs, data]);
      };

      socket.on(SessionTopics.ROUND_START, onRoundStart);
      socket.on(SessionTopics.ROUND_ENDED, onRoundEnd);
      socket.on(SessionTopics.ROUND_STATUS, onRoundStatus);
      socket.on(SessionTopics.ROUND_INITIALIZE, onInitialize);
      socket.on(TOPICS.NEED_JOB_SETTING, onNeedJobSetting);
      socket.on(TOPICS.JOB_SETTING, onJobSetting);
      socket.on(TOPICS.JOB_CONFIRMING, onJobConfirming);
      socket.on(TOPICS.GAME_READY, onGameReady);
      socket.on(TOPICS.START_VOTE, onStartVote);
      socket.on(TOPICS.VOTE, onVote);
      socket.on(TOPICS.VOTE_CONFIRM, onVoteConfirm);
      socket.on(TOPICS.REVOTE_WAITING, onRevoteWaiting);
      socket.on(TOPICS.VOTE_COMPLETE, onVoteComplete);
      socket.on(TOPICS.VOTE_RESULT_DECIDE, onVoteResultDecide);
      socket.on(TOPICS.EXECUTED, onExecuted);
      socket.on(TOPICS.NO_ONE_EXECUTED, onNoOneExecuted);
      socket.on(TOPICS.START_DAY, onStartDay);
      socket.on(TOPICS.START_NIGHT, onStartNight);
      socket.on(TOPICS.MAFIA_KILL_START, onMafiaKillStart);
      socket.on(TOPICS.MAFIA_KILL, onMafiaKill);
      socket.on(TOPICS.MAFIA_KILL_DECIDE, onMafiaKillDecide);
      socket.on(TOPICS.MAFIA_KILL_VOTE_COMPLETE, onMafiaKillVoteComplete);
      socket.on(TOPICS.MAFIA_KILL_TARGET_MISMATCH, onMafiaKillTargetMismatch);
      socket.on(TOPICS.POLICE_INVESTIGATE_START, onPoliceInvestigateStart);
      socket.on(TOPICS.POLICE_INVESTIGATE, onPoliceInvestigate);
      socket.on(TOPICS.POLICE_INVESTIGATE_RESULT, onPoliceInvestigateResult);
      socket.on(TOPICS.DOCTOR_HEAL_START, onDoctorHealStart);
      socket.on(TOPICS.DOCTOR_HEAL, onDoctorHeal);
      socket.on(TOPICS.DOCTOR_HEAL_DECIDE, onDoctorHealDecide);
      socket.on(TOPICS.NIGHT_RESULT_ANNOUNCEABLE, onNightResultAnnounceable);
      socket.on(TOPICS.NIGHT_RESULT, onNightResult);
      socket.on(TOPICS.MURDERED, onMurdered);
      socket.on(TOPICS.REVIVED, onRevived);
      socket.on(TOPICS.MAFIA_WIN, onMafiaWin);
      socket.on(TOPICS.CITIZEN_WIN, onCitizenWin);
      socket.on(TOPICS.MEMO, onMemo);
      socket.on(TOPICS.LOG, onLog);

      return () => {
        socket.off(SessionTopics.ROUND_START, onRoundStart);
        socket.off(SessionTopics.ROUND_ENDED, onRoundEnd);
        socket.off(SessionTopics.ROUND_STATUS, onRoundStatus);
        socket.off(SessionTopics.ROUND_INITIALIZE, onInitialize);
        socket.off(TOPICS.NEED_JOB_SETTING, onNeedJobSetting);
        socket.off(TOPICS.JOB_SETTING, onJobSetting);
        socket.off(TOPICS.JOB_CONFIRMING, onJobConfirming);
        socket.off(TOPICS.GAME_READY, onGameReady);
        socket.off(TOPICS.START_VOTE, onStartVote);
        socket.off(TOPICS.VOTE, onVote);
        socket.off(TOPICS.VOTE_CONFIRM, onVoteConfirm);
        socket.off(TOPICS.REVOTE_WAITING, onRevoteWaiting);
        socket.off(TOPICS.VOTE_COMPLETE, onVoteComplete);
        socket.off(TOPICS.VOTE_RESULT_DECIDE, onVoteResultDecide);
        socket.off(TOPICS.EXECUTED, onExecuted);
        socket.off(TOPICS.NO_ONE_EXECUTED, onNoOneExecuted);
        socket.off(TOPICS.START_DAY, onStartDay);
        socket.off(TOPICS.START_NIGHT, onStartNight);
        socket.off(TOPICS.MAFIA_KILL_START, onMafiaKillStart);
        socket.off(TOPICS.MAFIA_KILL, onMafiaKill);
        socket.off(TOPICS.MAFIA_KILL_DECIDE, onMafiaKillDecide);
        socket.off(TOPICS.MAFIA_KILL_VOTE_COMPLETE, onMafiaKillVoteComplete);
        socket.off(TOPICS.MAFIA_KILL_TARGET_MISMATCH, onMafiaKillTargetMismatch);
        socket.off(TOPICS.POLICE_INVESTIGATE_START, onPoliceInvestigateStart);
        socket.off(TOPICS.POLICE_INVESTIGATE, onPoliceInvestigate);
        socket.off(TOPICS.POLICE_INVESTIGATE_RESULT, onPoliceInvestigateResult);
        socket.off(TOPICS.DOCTOR_HEAL_START, onDoctorHealStart);
        socket.off(TOPICS.DOCTOR_HEAL, onDoctorHeal);
        socket.off(TOPICS.DOCTOR_HEAL_DECIDE, onDoctorHealDecide);
        socket.off(TOPICS.NIGHT_RESULT_ANNOUNCEABLE, onNightResultAnnounceable);
        socket.off(TOPICS.NIGHT_RESULT, onNightResult);
        socket.off(TOPICS.MURDERED, onMurdered);
        socket.off(TOPICS.REVIVED, onRevived);
        socket.off(TOPICS.MAFIA_WIN, onMafiaWin);
        socket.off(TOPICS.CITIZEN_WIN, onCitizenWin);
        socket.off(TOPICS.MEMO, onMemo);
        socket.off(TOPICS.LOG, onLog);
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
                sessionId={sessionId}
                stage={stage}
                myJob={myJob}
                participantMap={participantMap}
                aliveCount={aliveCount}
                voteCount={voteCount}
                myVote={myVote}
                myMafiaKillVote={myMafiaKillVote}
                sendVote={sendVote}
                myExecutionAgree={myExecutionAgree}
                sendVoteConfirm={sendVoteConfirm}
                sendMafiaKillVote={sendMafiaKillVote}
                mafiaKillVoteCount={mafiaKillVoteCount}
                voteConfirmCount={voteConfirmCount}
                aliveMafiaCount={aliveMafiaCount}
                voteResult={voteResult}
                executeTargetUid={executeTargetUid}
                amIAlive={amIAlive}
                dayCount={dayCount}
                sendPoliceInvestigate={sendPoliceInvestigate}
                sendDoctorHeal={sendDoctorHeal}
              />
            ),
            participants: <Participants participants={session?.participants} creatorUid={creatorUid} />,
            memo: <Memo memo={myMemo} sendMemo={sendMemo} />,
            logs: <Logs logs={logs} />,
            settings: <Settings sessionId={sessionId} goToDashboard={goToDashboard} stage={stage} />,
          }[key]
        }
      </div>
      <GameFooter menus={menus} selectedMenuKey={key} />
    </div>
  );
});

const DashBoard = ({
  stage,
  myJob,
  participantMap,
  aliveCount,
  myVote,
  myMafiaKillVote,
  voteCount,
  sendVote,
  myExecutionAgree,
  sendVoteConfirm,
  sendMafiaKillVote,
  voteResult,
  voteConfirmCount,
  aliveMafiaCount,
  mafiaKillVoteCount,
  executeTargetUid,
  amIAlive,
  dayCount,
  sendPoliceInvestigate,
  sendDoctorHeal,
}) => {
  const uid = userStore((state) => state.uid);
  const [selectedUid, setSelectedUid] = useState(null);
  const [agreeExecute, setAgreeExecute] = useState(null);
  const amIvoted = useMemo(() => {
    return myVote != null;
  }, [myVote]);
  const executeTargetNickname = useMemo(() => {
    return participantMap[executeTargetUid]?.nickname ?? null;
  }, [executeTargetUid, participantMap]);
  const amIMafia = useMemo(() => myJob === Jobs.MAFIA, [myJob]);
  const amIPolice = useMemo(() => myJob === Jobs.POLICE, [myJob]);
  const amIDoctor = useMemo(() => myJob === Jobs.DOCTOR, [myJob]);
  const mafiaVoteResult = useMemo(() => {
    const countMap = {};
    Object.keys(participantMap).forEach((e) => {
      const victim = participantMap[e]?.victimForMafia;
      if (victim != null) {
        countMap[victim] = (countMap[victim] ?? 0) + 1;
      }
    });
    return countMap;
  }, [participantMap]);

  return (
    <div className="panel dashboard">
      <div className="current-status">
        <div className="stage">
          {StageNames[stage] != null ? `${StageNames[stage]} (${dayCount}일차)` : stage ?? "???"}
        </div>
        {myJob != null && (
          <div className="job">
            당신은 <div className={"highlight" + JsxUtil.class(myJob)}>{JobNames[myJob] ?? "미정"}</div>입니다.
          </div>
        )}
      </div>
      {amIAlive ? (
        {
          [Stage.VOTE_FOR_EXECUTION]: (
            <div className="vote card">
              <div className="title">사형 투표</div>
              <div className="description">사형에 투표할 사람을 고르세요.</div>
              <div className="participants">
                {Object.keys(participantMap)
                  .filter((e) => participantMap[e]?.alive && e != uid)
                  .map((e, ind) => {
                    return (
                      <div
                        className={"vote-item" + JsxUtil.classByCondition(e == selectedUid || e == myVote, "selected")}
                        key={ind}
                        onClick={() =>
                          amIvoted
                            ? null
                            : selectedUid != null && e == selectedUid
                            ? setSelectedUid(null)
                            : setSelectedUid(e)
                        }
                      >
                        {participantMap[e]?.nickname}
                      </div>
                    );
                  })}
              </div>
              <div
                className={"vote-button" + JsxUtil.classByCondition(selectedUid == null || amIvoted, "inactive")}
                onClick={(e) => {
                  sendVote(parseInt(selectedUid));
                  setSelectedUid(null);
                }}
              >{`투표하기 (${voteCount ?? 0}/${aliveCount ?? "?"})`}</div>
            </div>
          ),
          [Stage.EXECUTION_CONFIGM]:
            executeTargetUid == uid ? (
              <div className="vote card">
                <div className="title">사형 찬반 투표</div>
                <div className="description">사형이 취소되길 기도하세요.</div>
              </div>
            ) : (
              <div className="vote card">
                <div className="title">사형 찬반 투표</div>
                <div className="description">{executeTargetNickname}를 사형할지 선택하세요.</div>
                <div className="execution-agree-options">
                  <div
                    className={
                      "vote-item" + JsxUtil.classByCondition((myExecutionAgree ?? agreeExecute) === true, "selected")
                    }
                    onClick={() =>
                      myExecutionAgree != null
                        ? null
                        : agreeExecute === true
                        ? setAgreeExecute(null)
                        : setAgreeExecute(true)
                    }
                  >
                    찬성
                  </div>
                  <div
                    className={
                      "vote-item" + JsxUtil.classByCondition((myExecutionAgree ?? agreeExecute) === false, "selected")
                    }
                    onClick={() =>
                      myExecutionAgree != null
                        ? null
                        : agreeExecute === false
                        ? setAgreeExecute(null)
                        : setAgreeExecute(false)
                    }
                  >
                    반대
                  </div>
                </div>
                <div
                  className={
                    "vote-button" +
                    JsxUtil.classByCondition(agreeExecute == null || myExecutionAgree != null, "inactive")
                  }
                  onClick={(e) => sendVoteConfirm(agreeExecute)}
                >{`결정하기 (${voteConfirmCount ?? 0}/${aliveCount != null ? aliveCount - 1 : "?"})`}</div>
              </div>
            ),
          [Stage.MAFIA_KILL]: amIMafia ? (
            <div className="vote card">
              <div className="title">죽일 사람 선택</div>
              <div className="description">이번 턴에 죽일 사람을 고르세요.</div>
              <div className="participants">
                {Object.keys(participantMap)
                  .filter((e) => participantMap[e]?.alive && e != uid)
                  .map((e, ind) => {
                    return (
                      <div
                        className={
                          "vote-item" +
                          JsxUtil.classByCondition(e == myMafiaKillVote, "prev-selected") +
                          JsxUtil.classByCondition(e == selectedUid, "selected")
                        }
                        key={ind}
                        onClick={() =>
                          selectedUid != null && e == selectedUid ? setSelectedUid(null) : setSelectedUid(e)
                        }
                      >
                        <div className="nickname">{participantMap[e]?.nickname}</div>
                        <div className="votes">({mafiaVoteResult?.[e] ?? "0"}표)</div>
                      </div>
                    );
                  })}
              </div>
              <div
                className={
                  "vote-button" + JsxUtil.classByCondition(myMafiaKillVote == null && selectedUid == null, "inactive")
                }
                onClick={(e) => {
                  sendMafiaKillVote(parseInt(selectedUid));
                  setSelectedUid(null);
                }}
              >{`투표하기 (${mafiaKillVoteCount ?? 0}/${aliveMafiaCount ?? "?"})`}</div>
            </div>
          ) : (
            <div className="vote card">
              <div className="title">마피아 턴</div>
              <div className="description">마피아가 죽일 사람을 고를 때까지 기다리세요...</div>
            </div>
          ),
          [Stage.POLICE_INVESTIGATE]: amIPolice ? (
            <div className="vote card">
              <div className="title">경찰 조사</div>
              <div className="description">직업을 조사할 사람을 고르세요.</div>
              <div className="participants">
                {Object.keys(participantMap)
                  .filter((e) => participantMap[e]?.alive && e != uid)
                  .map((e, ind) => {
                    return (
                      <div
                        className={"vote-item" + JsxUtil.classByCondition(e == selectedUid, "selected")}
                        key={ind}
                        onClick={() =>
                          selectedUid != null && e == selectedUid ? setSelectedUid(null) : setSelectedUid(e)
                        }
                      >
                        {participantMap[e]?.nickname}
                      </div>
                    );
                  })}
              </div>
              <div
                className={"vote-button" + JsxUtil.classByCondition(selectedUid == null, "inactive")}
                onClick={(e) => {
                  sendPoliceInvestigate(parseInt(selectedUid));
                  setSelectedUid(null);
                }}
              >
                조사하기
              </div>
            </div>
          ) : (
            <div className="vote card">
              <div className="title">경찰 턴</div>
              <div className="description">경찰이 조사할 사람을 고를 때까지 기다리세요...</div>
            </div>
          ),
          [Stage.DOCTOR_HEAL]: amIDoctor ? (
            <div className="vote card">
              <div className="title">의사 치료</div>
              <div className="description">살릴 사람을 고르세요.</div>
              <div className="participants">
                {Object.keys(participantMap)
                  .filter((e) => participantMap[e]?.alive)
                  .map((e, ind) => {
                    return (
                      <div
                        className={"vote-item" + JsxUtil.classByCondition(e == selectedUid, "selected")}
                        key={ind}
                        onClick={() =>
                          selectedUid != null && e == selectedUid ? setSelectedUid(null) : setSelectedUid(e)
                        }
                      >
                        {participantMap[e]?.nickname}
                        {e == uid ? " (나)" : ""}
                      </div>
                    );
                  })}
              </div>
              <div
                className={"vote-button" + JsxUtil.classByCondition(selectedUid == null, "inactive")}
                onClick={(e) => {
                  sendDoctorHeal(parseInt(selectedUid));
                  setSelectedUid(null);
                }}
              >
                치료하기
              </div>
            </div>
          ) : (
            <div className="vote card">
              <div className="title">의사 턴</div>
              <div className="description">의사가 치료할 사람을 고를 때까지 기다리세요...</div>
            </div>
          ),
        }[stage]
      ) : (
        <div className="killed">당신은 죽었습니다.</div>
      )}

      <div className="game-rule">
        <div className="title">게임 규칙</div>
        <div className="description">시민은 마피아를 모두 죽이면 승리합니다.</div>
        <div className="description">마피아는 시민 수가 마피아 수와 같거나 적어지면 승리합니다.</div>
        <div className="description">진행자는 턴마다 진행 설정 탭에서 단계를 진행하세요.</div>
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

const Memo = ({ memo, sendMemo }) => {
  const [memoContent, setMemoContent] = useState(memo);

  const onMemoLeave = () => {
    sendMemo(memoContent);
  };

  return (
    <div className="panel memo">
      <textarea
        className="memo"
        placeholder="여기에 자유롭게 기록하세요. 다른 사람들에게 공개되지 않습니다."
        value={memoContent}
        onBlur={onMemoLeave}
        onChange={(e) => setMemoContent(e.target.value)}
      />
    </div>
  );
};

const Logs = ({ logs }) => {
  return (
    <div className="panel logs">
      <div className="log-list">
        {logs.map((e, ind) => {
          return (
            <div className="log" key={ind}>
              {JSON.stringify(e)}
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

  const menus = [
    {
      label: "직업 설정",
      activeFilter: [Stage.NEED_JOB_SETTING],
      onClick: () => socket?.emitSession(sessionId, TOPICS.JOB_SETTING),
    },
    {
      label: "직업 확인 완료 및 게임 시작",
      activeFilter: [Stage.JOB_CONFIRMING],
      onClick: () => socket?.emitSession(sessionId, TOPICS.GAME_READY),
    },
    {
      label: "처형 투표 시작",
      activeFilter: [Stage.PROCESS_DAY, Stage.WAITING_FOR_REVOTE],
      onClick: () => {
        socket?.emitSession(sessionId, TOPICS.START_VOTE);
        goToDashboard();
      },
    },
    {
      label: "재투표 없이 밤으로 진행",
      activeFilter: [Stage.WAITING_FOR_REVOTE],
      onClick: () => socket?.emitSession(sessionId, TOPICS.START_NIGHT),
    },
    {
      label: "마피아 킬 지목 단계 진행",
      activeFilter: [Stage.PROCESS_NIGHT],
      onClick: () => {
        socket?.emitSession(sessionId, TOPICS.MAFIA_KILL_START);
        goToDashboard();
      },
    },
    {
      label: "밤동안의 결과 발표",
      activeFilter: [Stage.NIGHT_RESULT_ANNOUNCEMENT],
      onClick: () => socket?.emitSession(sessionId, TOPICS.NIGHT_RESULT),
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

export default Mafia;
