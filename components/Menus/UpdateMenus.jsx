import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import api from "../../config/api";
import ConfirmationButtons from "../ConfirmationButtons";
import { useFormik } from "formik";
import * as Yup from "yup";

const UpdateMenus = ({ selectedDayItems, onClose, snackBarData }) => {
  const [menus, setMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationButtons, setConfirmationButtons] = useState(false);

  useEffect(() => {
    setMenus(selectedDayItems);
  }, [selectedDayItems]);

  const validationSchema = Yup.object().shape({
    menus: Yup.array().of(
      Yup.object().shape({
        menu: Yup.string()
          .required("This field is required")
          .matches(/^[A-Za-z\s]+$/, "Only alphabets and spaces are allowed"),
      })
    ),
  });

  const formik = useFormik({
    initialValues: {
      menus: selectedDayItems,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      const response = await api.put("/api/menus/update", {
        menus: values.menus,
      });

      if (response.ok) {
        snackBarData(true, "success", response.data.message);
        setConfirmationButtons(false);
        onClose();
      } else {
        snackBarData(true, "error", response.data.error);
        setConfirmationButtons(false);
        setIsLoading(false);
      }
    },
  });

  const { values, errors, touched, setTouched } = formik;

  const handleConfirmation = async () => {
    setTouched({ menus: Array(values.menus.length).fill(true) });

    // check if any errors exist
    if (Object.keys(errors).length > 0) {
      snackBarData(true, "error", "Please fill in all required fields.");
      return;
    }

    // check if any values are entered
    const hasValues = values.menus.some((menu) => menu.menu.trim() !== "");
    if (!hasValues) {
      snackBarData(true, "error", "Please enter values for fields.");
      return;
    }

    setConfirmationButtons(true);
  };

  const handleMenusUpdate = async () => {
    try {
      setIsLoading(true);
      const response = await api.put("/api/menus/update", {
        menus: values.menus,
      });

      if (response.ok) {
        snackBarData(true, "success", response.data.message);
        onClose();
      } else {
        snackBarData(true, "error", response.data.error);
      }
    } catch (error) {
      snackBarData(true, "error", "An error occurred.");
    } finally {
      setConfirmationButtons(false);
      setIsLoading(false);
    }
  };

  return (
    <Fragment>
      <DialogTitle>Update Menu or Snack</DialogTitle>
      <DialogContent>
        <Grid container spacing={1} padding>
          {values.menus.map((menu, index) => (
            <Grid item xs={12} md={12} lg={4} key={index}>
              <TextField
                size="small"
                fullWidth
                label={
                  index === menus.length - 1 ? "Snack" : `Menu ${index + 1}`
                }
                name={`menus[${index}].menu`}
                value={values.menus[index].menu}
                onBlur={formik.handleBlur}
                onFocus={formik.handleBlur}
                onChange={formik.handleChange}
                error={
                  touched.menus &&
                  errors.menus &&
                  touched.menus[index] &&
                  Boolean(errors.menus[index]?.menu)
                }
                helperText={
                  touched.menus &&
                  errors.menus &&
                  touched.menus[index] &&
                  errors.menus[index]?.menu
                }
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        {confirmationButtons ? (
          <ConfirmationButtons
            loading={isLoading}
            save={handleMenusUpdate}
            onClose={() => setConfirmationButtons(false)}
          />
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmation}
          >
            Save Changes
          </Button>
        )}
      </DialogActions>
    </Fragment>
  );
};

export default UpdateMenus;
