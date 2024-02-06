import JsxUtil from "util/JsxUtil";
import { BetProcessType, BetType, Pedigrees, Stage, StageNames } from "./Main";
import { toRelFixed } from "util/MathUtil";
import userStore from "stores/userStore";
import GameMoney, { AnimatedGameMoney } from "./GameMoney";
import { useEffect, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { fastInterval } from "util/Common";

const DashBoard = ({
  stage,
  pot,
  currentBet,
  members,
  myOrderIndex,
  turnOrder,
  currentTurn,
  currentBetType,
  sendBet,
}) => {
  const uid = userStore((state) => state.uid);
  const isMyTurn = useMemo(() => uid === currentTurn, [uid, currentTurn]);
  const amIdied = useMemo(() => members?.[uid]?.died, [members, uid]);
  // console.log(members, myOrderIndex, turnOrder);

  const players = useMemo(() => {
    if (myOrderIndex === -1) {
      const arr = Object.values(members);
      const myIndex = arr.findIndex((e) => e.uid === uid);
      if (myIndex === -1) return arr;
      // pad to 5
      arr.push(...Array(5 - arr.length).fill(null));
      // swap myIndex and 3
      const temp = arr[3];
      arr[3] = arr[myIndex];
      arr[myIndex] = temp;
      return arr;
    } else {
      // order
      const arr = Array(5).fill(null);
      for (let key in members) {
        const member = members[key];
        const memberOrder = turnOrder.findIndex((e) => e === member.uid);
        // console.log((memberOrder - myOrderIndex + 5 - 2) % 5);
        arr[(memberOrder - myOrderIndex + 10 - 2) % 5] = member;
      }
      return arr;
    }
  }, [members, myOrderIndex]);

  return (
    <div className="panel dashboard">
      <div className="state">
        {stage === Stage.BET || stage === Stage.BET_CALL ? `${members[currentTurn]?.nickname ?? "-"} ` : ""}
        {stage === Stage.BET && currentBetType === BetProcessType.CALL ? "콜 " : ""}
        {StageNames[stage] ?? "-"}
      </div>
      <div className="board">
        <div className="stake-pot">
          <div className="pot row">
            <div className="label">POT</div>
            <div className="gold">
              <AnimatedGameMoney money={pot} highlight={true} unitSize={3} />
            </div>
          </div>
          <div className="call row">
            <div className="label">CALL</div>
            <div className="gold">
              <AnimatedGameMoney money={currentBet} highlight={true} unitSize={3} />
            </div>
          </div>
        </div>
        <div className="other-player-boards">
          <div className="row">
            <PlayerBoard player={players?.[0]} turn={players?.[0]?.uid === currentTurn} />
            <PlayerBoard player={players?.[1]} turn={players?.[1]?.uid === currentTurn} />
          </div>
          <div className="row">
            <PlayerBoard player={players?.[4]} turn={players?.[4]?.uid === currentTurn} />
            <PlayerBoard player={players?.[2]} turn={players?.[2]?.uid === currentTurn} />
          </div>
        </div>
        <PlayerBoard me={true} player={players?.[3]} turn={players?.[3]?.uid === currentTurn} />
      </div>
      <div className="expansion" />
      <div className="board-footer">
        <div className={"controller" + JsxUtil.classByCondition(!isMyTurn, "disabled")}>
          {amIdied && <div className="died">FOLDED</div>}
          <div className="action-pack">
            <div
              className={"action call" + JsxUtil.classByCondition(!isMyTurn || BigNumber(currentBet).eq(0), "disabled")}
              onClick={(e) => sendBet(BetType.CALL)}
            >
              콜
            </div>
            <div
              className={"action half" + JsxUtil.classByCondition(currentBetType !== BetProcessType.NORMAL, "disabled")}
              onClick={(e) => sendBet(BetType.HALF)}
            >
              하프
            </div>
            <div
              className={
                "action bbing" +
                JsxUtil.classByCondition(
                  currentBetType !== BetProcessType.NORMAL || !BigNumber(currentBet).eq(0),
                  "disabled"
                )
              }
              onClick={(e) => sendBet(BetType.BBING)}
            >
              삥
            </div>
            <div
              className={
                "action ddadang" +
                JsxUtil.classByCondition(
                  currentBetType !== BetProcessType.NORMAL || BigNumber(currentBet).eq(0),
                  "disabled"
                )
              }
              onClick={(e) => sendBet(BetType.DDADANG)}
            >
              따당
            </div>
            <div
              className={"action die" + JsxUtil.classByCondition(amIdied, "disabled")}
              onClick={(e) => sendBet(BetType.DIE)}
            >
              다이
            </div>
          </div>
          <div className="action-pack">
            <div className="action">10%</div>
            <div className="action">25%</div>
            <div className="action">50%</div>
            <div className="action">75%</div>
            <div className="action">100%</div>
          </div>
        </div>
        <div className="pedigree">
          <div className="pedigree-item head">
            <div className="level">티어</div>
            <div className="description">단계</div>
            <div className="probability">확률</div>
          </div>
          {Pedigrees.map((e, ind) => {
            return (
              <div className={"pedigree-item" + JsxUtil.classByCondition(ind === -1, "highlight")} key={ind}>
                <div className="level">{ind + 1}</div>
                <div className="description">{e.label}</div>
                <div className="probability">{toRelFixed((e.probability ?? 0) * 100, 3)}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PlayerBoard = ({ me = false, player, turn = false }) => {
  return (
    <div
      className={
        "player-board area" +
        JsxUtil.classByCondition(me, "my-board") +
        JsxUtil.classByEqual(player, null, "empty") +
        JsxUtil.classByCondition(turn, "turn") +
        JsxUtil.classByCondition(player?.died, "died")
      }
    >
      <div className="nickname">
        {player?.nickname ?? "-"}
        {me ? " (나)" : ""}
      </div>
      {player?.betType != null && (
        <div className={"bet-type" + JsxUtil.class(player?.betType)}>
          {{
            [BetType.CALL]: "콜",
            [BetType.HALF]: "하프",
            [BetType.BBING]: "삥",
            [BetType.DDADANG]: "따당",
            [BetType.DIE]: "다이",
          }[player?.betType] ?? "??"}
        </div>
      )}
      <div className="area-content">
        <div className="gold">
          <AnimatedGameMoney money={player?.gold ?? "0"} />
        </div>
        <div className="pot">
          <AnimatedGameMoney money={player?.bet ?? "0"} highlight={true} />
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
