import SetOrderModal from "components/games/seven-poker-no-chip/modals/SetOrderModal";
import { Modaler } from "../molecules/Modal";
import ResultModal from "components/games/ten-seconds/ResultModal";

export const MODAL_TYPES = {
  TEN_SECONDS: {
    RESULT: "ten_seconds_result",
  },
  SEVEN_POKER_NO_CHIP: {
    SET_ORDER: "seven_poker_no_chip_set_order",
  },
};

const ModalRouter = () => {
  return (
    <Modaler>
      <ResultModal id={MODAL_TYPES.TEN_SECONDS.RESULT} />
      <SetOrderModal id={MODAL_TYPES.SEVEN_POKER_NO_CHIP.SET_ORDER} />
    </Modaler>
  );
};

export default ModalRouter;
