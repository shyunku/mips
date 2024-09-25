import Modal from "molecules/Modal";
import { createRef, useEffect, useMemo, useState } from "react";
import { fastInterval, printf } from "util/Common";
import userStore from "stores/userStore";
import JsxUtil from "util/JsxUtil";
import { Draggable } from "react-drag-reorder";
import "./GiveMoneyModal.scss";
import GameMoney from "../GameMoney";
import BigNumber from "bignumber.js";

const GiveMoneyModal = ({ state, ...props }) => {
  const uid = userStore((state) => state.uid);
  const modalRef = createRef();
  // printf("state", state);

  const [giveToAll, setGiveToAll] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [uidList, setUidList] = useState([]);
  const [givingMoney, setGivingMoney] = useState("100");

  const onOpen = ({ participants, giveToAll }) => {
    setGiveToAll(giveToAll);
    setParticipants(participants);
    console.log(giveToAll, participants);
  };

  const onGivingMoneyChange = (func) => {
    setGivingMoney((prev) => {
      const newMoney = BigNumber(prev);
      const converted = func(newMoney);
      if (converted.isLessThan(1)) return "1";
      const integerValue = converted.integerValue();
      return integerValue.toString();
    });
  };

  const onConfirm = () => {
    modalRef.current?.close({
      givingMoney: givingMoney,
      givingTo: uidList,
    });
  };

  const toggleUser = (uid) => {
    console.log("uid", uid);
    if (uidList.includes(uid)) {
      setUidList((prev) => prev.filter((e) => e !== uid));
    } else {
      setUidList((prev) => [...prev, uid]);
    }
  };

  return (
    <Modal className="give-money-modal" ref={modalRef} {...props} onOpen={onOpen}>
      <div className="title">줄 금액 설정</div>
      <div className="content">
        {!giveToAll && (
          <div className="target">
            <div className="label">금액을 줄 대상 선택 (복수 선택 가능)</div>
            <div className="list">
              {participants.map((e, i) => (
                <div
                  className={"participant" + JsxUtil.classByCondition(uidList.includes(e.uid), "selected")}
                  key={i}
                  onClick={(x) => toggleUser(e.uid)}
                >
                  <div className="nickname">{e.nickname}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="giving-money">
          <div className="label">{giveToAll ? "모두에게 " : ""}줄 금액</div>
          <div className="money-display">
            <GameMoney money={givingMoney} highlight={true} excludeZero={true} unitSize={-1} />
          </div>
          <div className="controllers">
            <div className="up row">
              <div className="btn" onClick={() => onGivingMoneyChange((e) => e.multipliedBy(100))}>
                ×100
              </div>
              <div className="btn" onClick={() => onGivingMoneyChange((e) => e.multipliedBy(10))}>
                ×10
              </div>
              <div className="btn" onClick={() => onGivingMoneyChange((e) => e.multipliedBy(5))}>
                ×5
              </div>
              <div className="btn" onClick={() => onGivingMoneyChange((e) => e.multipliedBy(2))}>
                ×2
              </div>
            </div>
            <div className="down row">
              <div className="btn" onClick={() => onGivingMoneyChange((e) => e.dividedBy(10))}>
                ÷10
              </div>
              <div className="btn" onClick={() => onGivingMoneyChange((e) => e.dividedBy(5))}>
                ÷5
              </div>
              <div className="btn" onClick={() => onGivingMoneyChange((e) => e.dividedBy(2))}>
                ÷2
              </div>
              <div className="btn init" onClick={() => onGivingMoneyChange((e) => BigNumber("100"))}>
                초기화
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="confirm" onClick={onConfirm}>
        확인
      </div>
    </Modal>
  );
};

export default GiveMoneyModal;
