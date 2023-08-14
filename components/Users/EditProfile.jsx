import * as React from "react";
import {
  Button,
  TextField,
  DialogActions,
  Grid,
  Box,
  DialogContent,
  DialogTitle,
  CardMedia,
  Typography,
  Divider,
  Stack,
  Input,
  Avatar,
} from "@mui/material";
import { useState, Fragment, useEffect } from "react";
import ConfirmationButtons from "../ConfirmationButtons";
import { useAuth } from "../../contexts/AuthContext";
import { centerContents } from "../style";
import { editUserProfile } from "../../config/api";
import CloseIcon from "@mui/icons-material/Close";
import { useFormik } from "formik";
import * as Yup from 'yup';

const EditProfile = ({ snackBarData, onClose }) => {
  const [confirmationButtons, setConfirmationButtons] = useState(false); // set the confirmation buttons
  const [isLoading, setIsLoading] = useState(false); // set the loading state
  const [userDetails, setUserDetails] = useState([]);
  const [passwordDetails, setPasswordDetails] = useState([]);
  const [isImageUploaded, setIsImageUploaded] = useState(false);

  const { user } = useAuth();

  const handleConfirmation = () => {
    const { oldPassword, newPassword, confirmPassword } = formik.values;

    if (oldPassword && (!newPassword || !confirmPassword)) {
      formik.setFieldError(
        "newPassword",
        "Please enter a new password and confirm it."
      );
      snackBarData(true, "error", "Please enter a new password and confirm it.");
      return;
    }

    setConfirmationButtons(true);
  };

  const changeHandler = (e) => {
    let file = e.target.files[0];
    let reader = new FileReader();
    let limit = 1024 * 1024 * 10; // 10MB
    if (!file.type.startsWith("image/")) {
      snackBarData(true, "error", "Please select an image file.");
      return;
    } else if (file.size > limit) {
      snackBarData(true, "error", "The image size limit is 10MB.");
      return;
    } else {
      reader.onloadend = () => {
        const value = reader.result;
        setUserDetails({ ...userDetails, image: value });
        setIsImageUploaded(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmClick = async (event) => {
    setIsLoading(true);
    event.preventDefault();

    const response = await editUserProfile({
      userDetails,
      passwordDetails: {
        oldPassword: formik.values.oldPassword,
        newPassword: formik.values.newPassword,
        confirmPassword: formik.values.confirmPassword,
      },
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

  const validationSchema = Yup.object().shape({
    oldPassword: Yup.string().required("Old Password is required"),
    newPassword: Yup.string().required("New Password is required"),
    confirmPassword: Yup.string()
      .required("Confirm Password is required")
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match"),
  });

  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: handleConfirmClick,
  });

  const isFormDirty =
    userDetails.name !== user.name ||
    userDetails.email !== user.email ||
    userDetails.image !== null ||
    formik.values.oldPassword !== "" ||
    formik.values.newPassword !== "" ||
    formik.values.confirmPassword !== "";

  useEffect(() => {
    setUserDetails({
      name: user.name,
      email: user.email,
      image: null,
    });
  }, [user]);

  return (
    <Fragment>
      <DialogContent>
        <Grid container spacing={1} padding={2} borderRadius={"20px"}>
          <Grid item xs={12} md={3}>
            <Grid container spacing={1} padding={1}>
              <Grid item xs={7.5} md={10}></Grid>
              <Grid item xs={2} md={2}>
                {isImageUploaded && (
                  <CloseIcon
                    sx={{
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setUserDetails({ ...userDetails, image: null });
                      setIsImageUploaded(false);
                    }}
                  />
                )}
              </Grid>
              <Grid item xs={12} md={12} sx={centerContents}>
                <Avatar
                  src={
                    userDetails.image ||
                    `${user.profile_url}${user.profile}`
                  }
                  sx={{
                    height: "170px",
                    width: "170px",
                    marginLeft: "15px",
                  }}
                />
              </Grid>
              <Grid item xs={12} md={12} sx={centerContents}>
                <Box
                  className="image_item-form"
                  marginTop="17px"
                  marginLeft="27px"
                >
                  <Button variant="contained" component="label" color="info">
                    Upload Image
                    <input
                      type="file"
                      key={
                        isImageUploaded ? "fileKey-1" : "fileKey-2"
                      }
                      className="image_item-form--input"
                      onChange={(e) => changeHandler(e)}
                      style={{
                        display: "none",
                      }}
                    />
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={4} marginLeft={1} marginRight={2}>
            <Typography variant="h6" marginBottom={2} sx={{ color: '#E74C3C' }}>Account Information </Typography>
            <Typography fontWeight="bold" marginBottom={3}>Role: {user.role}</Typography>

            <TextField
              id="name"
              name="name"
              label="Name"
              size="small"
              variant="outlined"
              fullWidth
              value={userDetails.name}
              onChange={(event) =>
                setUserDetails({ ...userDetails, name: event.target.value })
              }
              sx={{ marginBottom: 3 }}
            />


            <TextField
              id="name"
              name="name"
              label="Email"
              size="small"
              variant="outlined"
              fullWidth
              value={userDetails.email}
              onChange={(event) =>
                setUserDetails({ ...userDetails, email: event.target.value })
              }

            />
          </Grid>
          <Divider orientation="vertical" flexItem />

          <Grid item xs={12} md={4} marginLeft={1}>
            <Typography variant="h6" marginBottom={3} sx={{ color: "#E74C3C" }}>
              Change Password{" "}
            </Typography>
            <TextField
              id="oldPassword"
              name="oldPassword"
              label="Enter old password"
              size="small"
              variant="outlined"
              type="password"
              fullWidth
              value={formik.values.oldPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onFocus={formik.handleBlur}
              error={
                formik.touched.oldPassword &&
                formik.errors.oldPassword !== undefined
              }
              helperText={
                formik.touched.oldPassword && formik.errors.oldPassword
              }
              sx={{ marginBottom: 3 }}
            />


            <TextField
              id="newPassword"
              name="newPassword"
              label="Enter new password"
              size="small"
              variant="outlined"
              type="password"
              fullWidth
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onFocus={formik.handleBlur}
              error={
                formik.touched.newPassword &&
                formik.errors.newPassword !== undefined
              }
              helperText={
                formik.touched.newPassword && formik.errors.newPassword
              }
              sx={{ marginBottom: 3 }}
            />


            <TextField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm new password"
              size="small"
              variant="outlined"
              type="password"
              fullWidth
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onFocus={formik.handleBlur}
              error={
                formik.touched.confirmPassword &&
                formik.errors.confirmPassword !== undefined
              }
              helperText={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
              sx={{ marginBottom: 3 }}
            />


          </Grid>
        </Grid>

























      </DialogContent>
      <DialogActions>
        {confirmationButtons ? (
          <ConfirmationButtons
            loading={isLoading}
            save={handleConfirmClick}
            onClose={() => setConfirmationButtons(false)}
          />
        ) : (
          <Button
            color="success"
            variant="contained"
            onClick={() => {
              handleConfirmation();
            }}
            disabled={!isFormDirty}
          >
            Save
          </Button>
        )}
      </DialogActions>

    </Fragment>
  );
};
export default EditProfile;
