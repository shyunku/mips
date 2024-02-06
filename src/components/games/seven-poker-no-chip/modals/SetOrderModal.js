import Modal from "molecules/Modal";
import { createRef, useEffect, useMemo, useState } from "react";
import { fastInterval, printf } from "util/Common";
import userStore from "stores/userStore";
import JsxUtil from "util/JsxUtil";
import { Draggable } from "react-drag-reorder";
import "./SetOrderModal.scss";
import GameMoney from "../GameMoney";
import BigNumber from "bignumber.js";

const SetOrderModal = ({ state, ...props }) => {
  const uid = userStore((state) => state.uid);
  const modalRef = createRef();
  // printf("state", state);

  const participants = useMemo(() => [...(state?.participants ?? [])], [state?.participants]);
  const [participantOrder, setParticipantOrder] = useState([]);
  const [initialMoney, setInitialMoney] = useState("1000000");
  const [startingMoney, setStartingMoney] = useState("100");

  const onOrderUp = (ind) => {
    if (ind === 0) return;
    setParticipantOrder((prev) => {
      const newOrder = [...prev];
      const temp = newOrder[ind];
      newOrder[ind] = newOrder[ind - 1];
      newOrder[ind - 1] = temp;
      return newOrder;
    });
  };

  const onOrderDown = (ind) => {
    if (ind === participantOrder.length - 1) return;
    setParticipantOrder((prev) => {
      const newOrder = [...prev];
      const temp = newOrder[ind];
      newOrder[ind] = newOrder[ind + 1];
      newOrder[ind + 1] = temp;
      return newOrder;
    });
  };

  const onInitialMoneyChange = (func) => {
    setInitialMoney((prev) => {
      const newMoney = BigNumber(prev);
      const converted = func(newMoney);
      if (converted.isLessThan(1)) return "1";
      const integerValue = converted.integerValue();
      return integerValue.toString();
    });
  };

  const onStartingMoneyChange = (func) => {
    setStartingMoney((prev) => {
      const newMoney = BigNumber(prev);
      const converted = func(newMoney);
      if (converted.isLessThan(1)) return "1";
      if (converted.isGreaterThan(initialMoney)) return initialMoney;
      const integerValue = converted.integerValue();
      return integerValue.toString();
    });
  };

  const onConfirm = () => {
    modalRef.current?.close({
      order: participantOrder.map((p) => p.uid),
      initialMoney: initialMoney,
      startingMoney: startingMoney,
    });
  };

  useEffect(() => {
    setParticipantOrder(() => {
      return participants?.map((p, ind) => {
        return {
          uid: p.uid,
          nickname: p.nickname,
          order: ind,
        };
      });
    });
  }, [participants]);

  return (
    <Modal className="set-order-modal" ref={modalRef} {...props}>
      <div className="title">턴 순서 및 초기 금액 정하기</div>
      <div className="content">
        <div className="participant-turn-order">
          {participantOrder.map((p, ind) => {
            return (
              <div className="participant" key={p.uid}>
                <div className="order">{ind + 1}</div>
                <div className="nickname">{p.nickname}</div>
                <div className="controllers">
                  <div className={"up" + JsxUtil.classByEqual(ind, 0, "disabled")} onClick={(e) => onOrderUp(ind)}>
                    ▲
                  </div>
                  <div
                    className={"down" + JsxUtil.classByEqual(ind, participantOrder.length - 1, "disabled")}
                    onClick={(e) => onOrderDown(ind)}
                  >
                    ▼
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="initial-money">
          <div className="label">사람별 초기 금액</div>
          <div className="money-display">
            <GameMoney money={initialMoney} highlight={true} excludeZero={true} unitSize={-1} />
          </div>
          <div className="controllers">
            <div className="up row">
              <div className="btn" onClick={() => onInitialMoneyChange((e) => e.multipliedBy(100))}>
                ×100
              </div>
              <div className="btn" onClick={() => onInitialMoneyChange((e) => e.multipliedBy(10))}>
                ×10
              </div>
              <div className="btn" onClick={() => onInitialMoneyChange((e) => e.multipliedBy(5))}>
                ×5
              </div>
              <div className="btn" onClick={() => onInitialMoneyChange((e) => e.multipliedBy(2))}>
                ×2
              </div>
            </div>
            <div className="down row">
              <div className="btn" onClick={() => onInitialMoneyChange((e) => e.dividedBy(10))}>
                ÷10
              </div>
              <div className="btn" onClick={() => onInitialMoneyChange((e) => e.dividedBy(5))}>
                ÷5
              </div>
              <div className="btn" onClick={() => onInitialMoneyChange((e) => e.dividedBy(2))}>
                ÷2
              </div>
              <div className="btn init" onClick={() => onInitialMoneyChange((e) => BigNumber("1000000"))}>
                초기화
              </div>
            </div>
          </div>
        </div>
        <div className="starting-money">
          <div className="label">시작 베팅 금액</div>
          <div className="money-display">
            <GameMoney money={startingMoney} highlight={true} excludeZero={true} unitSize={-1} />
          </div>
          <div className="controllers">
            <div className="up row">
              <div className="btn" onClick={() => onStartingMoneyChange((e) => e.multipliedBy(100))}>
                ×100
              </div>
              <div className="btn" onClick={() => onStartingMoneyChange((e) => e.multipliedBy(10))}>
                ×10
              </div>
              <div className="btn" onClick={() => onStartingMoneyChange((e) => e.multipliedBy(5))}>
                ×5
              </div>
              <div className="btn" onClick={() => onStartingMoneyChange((e) => e.multipliedBy(2))}>
                ×2
              </div>
            </div>
            <div className="down row">
              <div className="btn" onClick={() => onStartingMoneyChange((e) => e.dividedBy(10))}>
                ÷10
              </div>
              <div className="btn" onClick={() => onStartingMoneyChange((e) => e.dividedBy(5))}>
                ÷5
              </div>
              <div className="btn" onClick={() => onStartingMoneyChange((e) => e.dividedBy(2))}>
                ÷2
              </div>
              <div className="btn init" onClick={() => onStartingMoneyChange((e) => BigNumber("100"))}>
                초기화
              </div>
            </div>
          </div>
        </div>
        <div className="messages">
          {BigNumber(startingMoney).multipliedBy(10).isGreaterThanOrEqualTo(initialMoney) && (
            <div className="warning">시작 베팅 금액은 초기 금액의 10%보다 작게 설정하는 것을 추천합니다.</div>
          )}
        </div>
      </div>

      <div className="confirm" onClick={onConfirm}>
        확인
      </div>
    </Modal>
  );
};

export default SetOrderModal;
