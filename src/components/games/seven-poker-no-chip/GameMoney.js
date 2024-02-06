import { useMemo } from "react";
import BigNumber from "bignumber.js";
import "./GameMoney.scss";
import useAnimatedNumber from "hooks/useAnimatedNumber";
import JsxUtil from "util/JsxUtil";

const Units = ["만", "억", "조", "경", "해", "자", "양", "구", "간", "정", "재", "극"];

// money: string
const GameMoney = ({ money, highlight, unitSize = 2, excludeZero = false }) => {
  const isNegative = useMemo(() => {
    const bn = new BigNumber(money);
    return bn.isLessThan(0);
  }, [money]);
  const isZero = useMemo(() => {
    const bn = new BigNumber(money);
    return bn.isLessThanOrEqualTo(0);
  }, [money]);
  const segments = useMemo(() => {
    const segment = [];
    let bn = new BigNumber(money).abs();
    bn = bn.integerValue();
    if (bn.isLessThanOrEqualTo(0)) {
      return [0];
    }
    let unitIndex = 0;
    while (bn.isGreaterThanOrEqualTo(1)) {
      const mod = bn.modulo(10000);
      if (!(mod.isEqualTo(0) && excludeZero)) {
        segment.push({
          unit: Units[unitIndex],
          value: mod.toString(),
          unitIndex: unitIndex,
        });
      }
      unitIndex++;
      bn = bn.dividedBy(10000).integerValue(BigNumber.ROUND_DOWN);
    }
    const reversed = segment.reverse();
    if (unitSize === -1) return reversed;
    return reversed.slice(0, unitSize);
  }, [money, unitSize, excludeZero]);

  return (
    <div className={"game-money" + JsxUtil.classByCondition(highlight, "highlight")}>
      {isZero ? (
        "0"
      ) : (
        <>
          {isNegative && <span className="negative">-</span>}
          {segments.map((segment, index) => (
            <div key={index}>
              <span key={index} className={"segment" + JsxUtil.class(`u-${segment.unitIndex}`)}>
                <span className="value">{index !== 0 ? segment.value.padStart(4, "0") : segment.value}</span>
                <span className="unit">{segment.unit ?? "?"}</span>
              </span>
              {index < segments.length - 1 && <span className="segment">&nbsp;</span>}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export const AnimatedGameMoney = ({ money, ...rest }) => {
  const animatedMoney = useAnimatedNumber({ value: parseInt(money), useInt: true, asr: 0.99999 });
  return <GameMoney money={animatedMoney.value} {...rest} />;
};

export default GameMoney;
