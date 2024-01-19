import { IoArrowBack, IoBarcode, IoCopy, IoLockClosed, IoSearch, IoSettingsSharp } from "react-icons/io5";
import "./GameCreation.scss";
import { useState } from "react";
import JsxUtil from "util/JsxUtil";
import toast from "react-hot-toast";
import { copyToClipboard } from "util/Common";

const GameCreation = () => {
  const [creating, setCreating] = useState(false);
  const [gameCode, setGameCode] = useState("123456");

  const createGame = () => {
    // TODO :: create game
    setCreating(true);
  };

  const copyCode = () => {
    if (gameCode == null) return;
    toast.success("게임 코드가 복사되었습니다.");
    copyToClipboard("123456");
  };

  return (
    <>
      <div className="backward">
        <div className="icon">
          <IoArrowBack />
        </div>
        <div className="label">뒤로가기</div>
      </div>
      <div className={"game-creation card" + JsxUtil.classByCondition(creating, "creating")}>
        <div className="header game-card">
          <div className="game-image img">
            <img alt="" src={"https://picsum.photos/200/300"} />
          </div>
          <div className="game-info">
            <div className="game-name">게임 이름</div>
            <div className="game-description">여기에 게임 설명 추가!</div>
            <div className="game-players">플레이어 2~15명</div>
            <div className="game-initial-settings">
              <button className="game-btn" onClick={createGame}>
                {creating ? "시작하기" : "방 만들기"}
              </button>
              <div className="pw-setting">
                <div className="icon">
                  <IoLockClosed />
                </div>
                <div className="label">비밀번호 설정</div>
              </div>
            </div>
          </div>
        </div>
        <div className="body">
          {creating ? (
            <div className="content">
              <div className="game-code-section">
                <div className="label">게임코드</div>
                <div className="copy-section" onClick={copyCode}>
                  <div className="copy icon">
                    <IoCopy />
                  </div>
                  <div className="code">{gameCode}</div>
                </div>
              </div>
              <div className="setting-section">
                <div className="session-setting-btn">
                  <div className="icon">
                    <IoSettingsSharp />
                  </div>
                  <div className="label">게임 룰 설정</div>
                </div>
              </div>
              <div className="participants-section">
                <div className="label">참여자 (11/15)</div>
                <div className="participants">
                  {Array(33)
                    .fill(null)
                    .map((e, ind) => {
                      return (
                        <div className="participant">
                          <div className="nickname">참여자 {ind + 1}</div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="placeholder">방을 만들어서 참여자를 모집하세요.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default GameCreation;
