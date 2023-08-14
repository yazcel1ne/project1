import React, { useState, Fragment } from "react";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import ConfirmationButtons from "../ConfirmationButtons";
import { deactivateUser } from "../../config/api";

const DeactivateUserDialog = ({ onClose, selectedUser, snackBarData }) => {
  const [confirmationButtons, setConfirmationButtons] = useState(false);
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirmation = () => {
    setConfirmationButtons(true);
  };

  const handleSave = async () => {
    setIsLoading(true);

    const response = await deactivateUser({
      id: selectedUser.id,
    });
    if (response.ok) {
      snackBarData(true, "success", response.data.message);
      onClose();
    } else {
      setConfirmationButtons(false);
      setIsLoading(false);
      snackBarData(true, "error", response.data.error);
    }
  };

  return (
    <Fragment>

      <DialogContent >
        <Typography >Do you want to
          <Typography component={"span"} fontWeight={"bold"}> Deactivate </Typography>{selectedUser.name}'s account?
        </Typography>

        <DialogActions>
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

export default DeactivateUserDialog;
