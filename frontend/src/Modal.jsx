import { useEffect } from 'react';
import styled from 'styled-components';

const ModalWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => true,
})(() => ({
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ModalOverlay = styled.div.withConfig({
  shouldForwardProp: (prop) => true,
})(() => ({
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
}));

const ModalContent = styled.div.withConfig({
  shouldForwardProp: (prop) => true,
})(() => ({
  position: 'relative',
  zIndex: 10,
  backgroundColor: 'white',
  borderRadius: '1rem',
  boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
  padding: '1.5rem',
  maxWidth: '90%',
}));

const ModalClose = styled.button.withConfig({
  shouldForwardProp: (prop) => true,
})(() => ({
  position: 'absolute',
  top: '0.75rem',
  right: '0.75rem',
  color: '#6b7280',
  fontSize: '1.25rem',
  cursor: 'pointer',
}));

const Modal = ({ onClose, children }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <ModalWrapper>
      <ModalOverlay
        onClick={onClose}
        aria-hidden="true"
      />
      <ModalContent
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <ModalClose
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </ModalClose>
        <div id="modal-title">{children}</div>
      </ModalContent>
    </ModalWrapper>
  );
};

export default Modal;