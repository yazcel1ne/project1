import React, { useState, Fragment } from "react";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import ConfirmationButtons from "../ConfirmationButtons";
import { reactivateUser } from "../../config/api";

const ReactivateUserDialog = ({ onClose, selectedUser, snackBarData }) => {
  const [confirmationButtons, setConfirmationButtons] = useState(false); // set the confirmation buttons
  const [isLoading, setIsLoading] = useState(false);// set the loading state

  const handleConfirmation = () => {
    setConfirmationButtons(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    const response = await reactivateUser({
      id: selectedUser.id,
    });
    if (response.ok) {
      snackBarData(true, "success", response.data.message);
      onClose();
    } else {
      setIsLoading(false);
      setConfirmationButtons(false);
      snackBarData(true, "error", response.data.error);
    }
  };

  return (
    <Fragment>

      <DialogContent>
        <Typography >Do you want to
          <Typography component={"span"} fontWeight={"bold"}> Reactivate </Typography>{selectedUser.name}'s account?
        </Typography>

        <DialogActions >
          {confirmationButtons ?
            <ConfirmationButtons
              loading={isLoading}
              save={handleSave}
              onClose={() => setConfirmationButtons(false)}
            />
            :
            <Button
              color="success"
              variant="contained"
              onClick={handleConfirmation}
            >
              Save Changes
            </Button>
          }
        </DialogActions>
      </DialogContent>
    </Fragment>
  );
};

export default ReactivateUserDialog;
