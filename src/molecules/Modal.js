import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import "./Modal.scss";
import { IoClose } from "react-icons/io5";
import { printf, sendEvent, uuidv4 } from "util/Common";

const Modal = forwardRef(({ children, id, hideDefaultClose = false, onClose, onCancel, className, ...rest }, ref) => {
  const modalRef = useRef(null);
  const closeHandler = async () => {
    const modalElem = modalRef.current;
    if (!modalElem) return;
    const modalUuid = modalElem.getAttribute("data-uuid");
    if (!modalUuid) return;
    const modalCloseTopic = `modal_close_signal_${modalUuid}`;
    let data = await onClose?.();
    sendEvent(modalCloseTopic, data);
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
  }));

  return (
    <div className={"modal"} id={`modal-${id}`} ref={modalRef} {...rest}>
      <div className={"modal-back-panel"} onClick={cancelHandler}></div>
      <div className={"modal-content " + (className ?? "")}>
        <>
          {!hideDefaultClose && (
            <div className={"close-button"} onClick={closeHandler}>
              <IoClose />
            </div>
          )}

          {children}
        </>
      </div>
    </div>
  );
});

export const Modaler = ({ children }) => {
  const [activeModals, setActiveModals] = useState({});
  const [modalStates, setModalStates] = useState({});
  const [closeListeners, setCloseListeners] = useState({});
  const activeChildren = useMemo(() => {
    return React.Children.map(children, (child) => {
      return React.cloneElement(child, { state: modalStates[child.props?.id] ?? null });
    });
  }, [children, modalStates]);

  useEffect(() => {
    const openListener = (e) => {
      const modalData = e.data;
      const { modalId, uuid, modalCloseTopic, state } = modalData;
      const realModalId = `modal-${modalId}`;

      // check if modal is already opened
      if (activeModals[modalId]) {
        console.log(`Modal with id ${modalId} is already opened.`);
        return;
      }

      const targetModalElement = document.querySelector(`.modal#${realModalId}`);
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

      setModalStates((prev) => {
        return { ...prev, [modalId]: state };
      });

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

        // remove listeners
        document.removeEventListener(closeSignalId, closeListener);
        setModalStates((prev) => {
          const { [modalId]: removed, ...rest } = prev;
          return rest;
        });

        setCloseListeners((prev) => {
          const { [modalId]: removed, ...rest } = prev;
          return rest;
        });
        // send closed
        const modalCloseTopic = `modal_close_${uuid}`;
        sendEvent(modalCloseTopic, e2.data);
      };

      // add listeners
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

  return <div className={"modal-container"}>{activeChildren}</div>;
};

export const openModal = (modalId, { state = null, closeHandler = null }) => {
  const modalUuid = uuidv4();
  const modalCloseTopic = `modal_close_${modalUuid}`;
  const modalStateTopic = `modal_state_${modalUuid}`;
  const modalStateReadyTopic = `modal_state_ready_${modalUuid}`;
  sendEvent("open_modal", {
    modalId,
    uuid: modalUuid,
    modalCloseTopic,
    state,
  });
  const onModalClose = (e) => {
    const retData = e.data;
    closeHandler?.(retData);
    document.removeEventListener(modalCloseTopic, onModalClose);
  };
  document.addEventListener(modalCloseTopic, onModalClose);
};

export default Modal;
