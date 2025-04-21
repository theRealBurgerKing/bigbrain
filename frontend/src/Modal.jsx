import React, { useEffect } from "react";


const modalWrapper = {
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
  
const modalOverlay = {
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
};
  
const modalContent = {
  position: 'relative',
  zIndex: 10,
  backgroundColor: 'white',
  borderRadius: '1rem',
  boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
  padding: '1.5rem',
  maxWidth: '90%',
};
  
const modalClose = {
  position: 'absolute',
  top: '0.75rem',
  right: '0.75rem',
  color: '#6b7280',
  fontSize: '1.25rem',
  cursor: 'pointer',
};


const Modal = ({ onClose, children }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div style={modalWrapper}>
      {}
      <div
        style={modalOverlay}
        onClick={onClose}
      />

      {}
      <div style={modalContent}>
        {}
        <button
          onClick={onClose}
          style={modalClose}
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