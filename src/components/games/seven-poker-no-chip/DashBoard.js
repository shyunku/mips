import JsxUtil from "util/JsxUtil";
import { Pedigrees } from "./Main";
import { toRelFixed } from "util/MathUtil";
import userStore from "stores/userStore";
import GameMoney, { AnimatedGameMoney } from "./GameMoney";
import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { fastInterval } from "util/Common";

const DashBoard = ({}) => {
  const uid = userStore((state) => state.uid);

  return (
    <div className="panel dashboard">
      <div className="state">플레이어 2 턴</div>
      <div className="board">
        <div className="stake-pot">
          <div className="pot row">
            <div className="label">POT</div>
            <div className="gold">
              <AnimatedGameMoney money={"145212256"} highlight={true} unitSize={3} />
            </div>
          </div>
          <div className="call row">
            <div className="label">CALL</div>
            <div className="gold">
              <AnimatedGameMoney money={"19992000"} highlight={true} unitSize={3} />
            </div>
          </div>
        </div>
        <div className="other-player-boards">
          <div className="row">
            <PlayerBoard nickname={"플레이어 1"} gold={"231256300"} pot={"512666"} />
            <PlayerBoard nickname={"플레이어 2"} gold={"5129529"} pot={"5120528"} />
          </div>
          <div className="row">
            <PlayerBoard nickname={"플레이어 5"} gold={"1552028"} pot={"525666"} />
            <PlayerBoard nickname={"플레이어 3"} gold={"10"} pot={"56100"} />
          </div>
        </div>
        <PlayerBoard me={true} nickname={"플레이어 4"} gold={"51259929500"} pot={"61969900"} />
      </div>
      <div className="expansion" />
      <div className="board-footer">
        <div className="controller">
          <div className="action-pack">
            <div className="action call">콜</div>
            <div className="action half">하프</div>
            <div className="action bbing">삥</div>
            <div className="action ddadang">따당</div>
            <div className="action die">다이</div>
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

const PlayerBoard = ({ me = false, nickname, gold, pot }) => {
  return (
    <div className={"player-board area" + JsxUtil.classByCondition(me, "my-board")}>
      <div className="nickname">
        {nickname}
        {me ? " (나)" : ""}
      </div>
      <div className="area-content">
        <div className="gold">
          <AnimatedGameMoney money={gold} />
        </div>
        <div className="pot">
          <AnimatedGameMoney money={pot} highlight={true} />
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
