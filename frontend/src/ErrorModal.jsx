import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

function ErrorModal({ open, onClose, message, retryAction }) {
  return (
    <Dialog open={open} onClose={onClose} sx={{ zIndex: 1500 }}>
      <DialogTitle>Error</DialogTitle>
      <DialogContent>
        <p>{message}</p>
      </DialogContent>
      <DialogActions>
        {retryAction && (
          <Button onClick={retryAction} color="secondary">
            Retry
          </Button>
        )}
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ErrorModal;