import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import "./Modal.scss";
import { sendEvent, uuidv4 } from "util/Common";
import { IoClose } from "react-icons/io5";

/**
 * @param {object} props
 * @param {string} props.id
 * @param {boolean} props.active
 * @param {function} props.onOpen
 * @param {function} props.onClose
 * @param {function} props.onCancel
 * @param {function} props.beforeClose
 * @param {string} props.className
 */
const Modal = forwardRef(
  ({ children, id, active, onOpen, onClose, onCancel, beforeClose, className, ...rest }, ref) => {
    const modalRef = useRef(null);
    const [onOpenCabllback, setOnOpenCallback] = useState(null);

    const openHandler = useCallback(
      (e) => {
        const callback = onOpen?.(e.data);
        setOnOpenCallback(() => callback);
      },
      [onOpen]
    );

    const closeHandler = async (...args) => {
      const modalElem = modalRef.current;
      if (!modalElem) return;
      if (beforeClose) {
        if ((await beforeClose?.(...args)) === false) return;
      }
      const modalUuid = modalElem.getAttribute("data-uuid");
      if (!modalUuid) return;
      const modalCloseTopic = `modal_close_signal_${modalUuid}`;

      let retData = await onClose?.();
      sendEvent(modalCloseTopic, ...args, retData);
      onOpenCabllback?.();
    };

    const cancelHandler = async () => {
      const modalElem = modalRef.current;
      if (!modalElem) return;
      if (!onCancel) return;
      const modalUuid = modalElem.getAttribute("data-uuid");
      if (!modalUuid) return;
      const modalCloseTopic = `modal_close_signal_${modalUuid}`;
      let data = await onCancel?.();
      sendEvent(modalCloseTopic, data);
    };

    useImperativeHandle(ref, () => ({
      close: closeHandler,
      cancel: cancelHandler,
      // handleModalOpen,
    }));

    useEffect(() => {
      document.addEventListener(`modal_opened_${id}`, openHandler);
      return () => {
        document.removeEventListener(`modal_opened_${id}`, openHandler);
      };
    }, []);

    return (
      <div className={"modal-frame"} id={`modal_${id}`} ref={modalRef} {...rest}>
        <div className={"modal-back-panel"} onClick={cancelHandler}></div>
        <div className={"modal-content " + className}>
          <>
            <div className={"close-button"} onClick={closeHandler}>
              <IoClose />
            </div>
            {children}
          </>
        </div>
      </div>
    );
  }
);

export const Modaler = ({ children }) => {
  const [activeModals, setActiveModals] = useState({});
  const [closeListeners, setCloseListeners] = useState({});
  const modalElements = useMemo(() => {
    return Array.isArray(children) ? children : [children];
  }, [children]);

  useEffect(() => {
    const openListener = (e) => {
      const modalData = e.data;
      const { modalId, uuid, data: innerData, modalCloseTopic } = modalData;
      const realModalId = `modal_${modalId}`;
      // check if modal is already opened
      if (activeModals[modalId]) {
        console.log(`Modal with id ${modalId} is already opened.`);
        return;
      }

      const targetModalElement = document.querySelector(`.modal-frame#${realModalId}`);
      if (!targetModalElement) {
        console.error(`Modal with id ${modalId} not found.`);
        return;
      }
      targetModalElement.classList.add("active");
      targetModalElement.setAttribute("data-uuid", uuid);
      targetModalElement.setAttribute("data-close-topic", modalCloseTopic);
      targetModalElement.style.zIndex = 102 + Object.keys(activeModals).length;
      setActiveModals((prev) => {
        return { ...prev, [modalId]: uuid };
      });

      const openEvent = new Event(`modal_opened_${modalId}`, { bubbles: true });
      openEvent.data = innerData;
      document.dispatchEvent(openEvent);

      const closeSignalId = `modal_close_signal_${uuid}`;
      const closeListener = (e2) => {
        if (!targetModalElement) {
          console.error(`Modal with id ${modalId} not found.`);
          return;
        }
        targetModalElement.classList.remove("active");
        targetModalElement.removeAttribute("data-uuid");
        targetModalElement.removeAttribute("data-close-topic");
        setActiveModals((prev) => {
          const { [modalId]: removed, ...rest } = prev;
          return rest;
        });
        document.removeEventListener(closeSignalId, closeListener);
        setCloseListeners((prev) => {
          const { [modalId]: removed, ...rest } = prev;
          return rest;
        });
        // send closed
        const modalCloseTopic = `modal_close_${uuid}`;
        sendEvent(modalCloseTopic, e2.data);
      };
      document.addEventListener(closeSignalId, closeListener);
      setCloseListeners((prev) => {
        return { ...prev, [modalId]: closeListener };
      });
    };
    document.addEventListener("open_modal", openListener);
    return () => {
      document.removeEventListener("open_modal", openListener);
      Object.keys(closeListeners).forEach((modalId) => {
        const closeListener = closeListeners[modalId];
        document.removeEventListener(`modal_close_signal_${modalId}`, closeListener);
      });
    };
  }, [activeModals, closeListeners]);

  return <div className={"modal-container"}>{modalElements}</div>;
};

export const openModal = (modalId, data, closeHandler = null) => {
  const modalUuid = uuidv4();
  const modalCloseTopic = `modal_close_${modalUuid}`;
  sendEvent("open_modal", {
    modalId,
    uuid: modalUuid,
    modalCloseTopic,
    data,
  });
  const onModalClose = (e) => {
    const retData = e.data;
    closeHandler?.(retData);
    document.removeEventListener(modalCloseTopic, onModalClose);
  };
  document.addEventListener(modalCloseTopic, onModalClose);
};

export default Modal;
