import { Modaler } from "../molecules/Modal";
import ResultModal from "components/games/ten-seconds/ResultModal";

export const MODAL_TYPES = {
  TEN_SECONDS: {
    RESULT: "ten_seconds_result",
  },
};

const ModalRouter = () => {
  return (
    <Modaler>
      <ResultModal id={MODAL_TYPES.TEN_SECONDS.RESULT} />
    </Modaler>
  );
};

export default ModalRouter;
