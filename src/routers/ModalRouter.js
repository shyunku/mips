import SetOrderModal from "components/games/seven-poker-no-chip/modals/SetOrderModal";
import { Modaler } from "../molecules/Modal";
import ResultModal from "components/games/ten-seconds/ResultModal";
import GiveMoneyModal from "components/games/seven-poker-no-chip/modals/GiveMoneyModal";

export const MODAL_TYPES = {
  TEN_SECONDS: {
    RESULT: "ten_seconds_result",
  },
  SEVEN_POKER_NO_CHIP: {
    SET_ORDER: "seven_poker_no_chip_set_order",
    GIVE_MONEY: "seven_poker_no_chip_give_money",
  },
};

const ModalRouter = () => {
  return (
    <Modaler>
      <ResultModal id={MODAL_TYPES.TEN_SECONDS.RESULT} />
      <>
        <SetOrderModal id={MODAL_TYPES.SEVEN_POKER_NO_CHIP.SET_ORDER} />
        <GiveMoneyModal id={MODAL_TYPES.SEVEN_POKER_NO_CHIP.GIVE_MONEY} />
      </>
    </Modaler>
  );
};

export default ModalRouter;
