import React, { useEffect } from "react";
import './Modal.css';

const Modal = ({ onClose, children }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="modal-wrapper">
      {}
      <div
        className="modal-overlay"
        onClick={onClose}
      />

      {}
      <div className="modal-content">
        {}
        <button
          onClick={onClose}
          className="modal-close"
        >
          ×
        </button>

        {}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;