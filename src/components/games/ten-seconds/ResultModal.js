import Modal from "molecules/Modal";
import { createRef, useEffect, useMemo } from "react";
import { fastInterval, printf } from "util/Common";
import "components/GameResultModal.scss";
import userStore from "stores/userStore";
import JsxUtil from "util/JsxUtil";

const ResultModal = ({ state, ...props }) => {
  const uid = userStore((state) => state.uid);
  const results = useMemo(() => state?.results ?? [], [state?.results]);
  const modalRef = createRef();
  const closeHandler = () => {
    modalRef.current?.close();
  };

  printf("state", results);

  return (
    <Modal className="result-modal" ref={modalRef} {...props}>
      <div className="title">게임 결과</div>
      <div className="content">
        <div className="result">
          <div className="result-item row">
            <div className="name">이름</div>
            <div className="time">시간</div>
            <div className="rank">순위</div>
          </div>
          {results
            .sort((a, b) => {
              if (a?.rating == null) return 1;
              if (b?.rating == null) return -1;
              return (b?.stopAt ?? 0) - (a?.stopAt ?? 0);
            })
            .map((e) => {
              return (
                <div className={"result-item" + JsxUtil.classByEqual(e?.uid, uid, "me")}>
                  <div className="name">{e?.nickname}</div>
                  <div className="time">{e?.stopAt != null ? `${e?.stopAt}초` : "-"}</div>
                  <div className="rank">{e?.rating != null ? `${e?.rating}위` : "버스트"}</div>
                </div>
              );
            })}
        </div>
      </div>
      <div className="confirm" onClick={closeHandler}>
        확인
      </div>
    </Modal>
  );
};

export default ResultModal;
