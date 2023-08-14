import * as React from "react";
import {
  Box,
  Button,
  TextField,
  DialogActions,
  Grid,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState, useEffect, Fragment } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateCategorySubCategory } from "../../config/api";
import ConfirmationButtons from "../ConfirmationButtons";

const UpdateCategoryDialog = ({ data, snackBarData, onClose }) => {
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [confirmationButtons, setConfirmationButtons] = useState(false); // set the confirmation buttons
  const [isLoading, setIsLoading] = useState(false);// set the loading state

  const validationSchema = Yup.object({
    editCategory: Yup.string().required("Category is required"),
    editSubCategory: Yup.string().required("Sub Category is required"),
  });
  const formik = useFormik({
    initialValues: {
      editCategory: data.category,
      editSubCategory: data.subCategory,
    },
    validationSchema,
    onSubmit: () => {
      handleUpdateCategoryAndSubCategory();
    },
  });

  const handleConfirmation = () => {
    if (!formik.dirty) {
      snackBarData(true, "error", "No changes made");
    } else if (!formik.isValid) {
      snackBarData(true, "error", "Please fill in all the required fields")
    } else {
      setConfirmationButtons(true);
    }
  };

  //Update category and subcategory
  const handleUpdateCategoryAndSubCategory = async (values) => {
    setIsLoading(true);
    const response = await updateCategorySubCategory({
      oldCategory: category,
      category: formik.values.editCategory,
      oldSubCategory: subCategory,
      subCategory: formik.values.editSubCategory,
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

  useEffect(() => {
    setCategory(data.category);
    setSubCategory(data.subCategory);
  }, [
    data.category,
    data.subCategory,
  ]);

  return (
    <Fragment>
      <DialogContent>
        <Grid container direction={"column"} spacing={3} padding={2}>
          <Grid item>
            <Box>
              <TextField
                label="Edit Category"
                id="editCategory"
                name="editCategory"
                variant="outlined"
                size="small"
                value={formik.values.editCategory}
                onClick={() => formik.setFieldTouched("editCategory", true)}
                onBlur={formik.handleBlur}
                error={formik.touched.editCategory && Boolean(formik.errors.editCategory)}
                helperText={formik.touched.editCategory && formik.errors.editCategory}
                onChange={formik.handleChange}
                fullWidth
              />
            </Box>
          </Grid>
          <Grid item>
            <Grid item>
              <TextField
                label="Edit Subcategory"
                id="editSubCategory"
                name="editSubCategory"
                variant="outlined"
                size="small"
                value={formik.values.editSubCategory}
                onClick={() => formik.setFieldTouched("editSubCategory", true)}
                onBlur={formik.handleBlur}
                error={formik.touched.editSubCategory && Boolean(formik.errors.editSubCategory)}
                onChange={formik.handleChange}
                fullWidth
                helperText={
                  formik.touched.editSubCategory && formik.errors.editSubCategory
                    ? formik.errors.editSubCategory
                    : `Selected Category: ${formik.values.editCategory}`
                }
              />
            </Grid>
            <Grid item></Grid>
          </Grid>
        </Grid>
        <DialogActions>
          {confirmationButtons ?
            <ConfirmationButtons
              loading={isLoading}
              save={() => {
                handleUpdateCategoryAndSubCategory(formik.values);
              }}
              onClose={() => setConfirmationButtons(false)}
            />
            :
            <Button
              color="success"
              variant="contained"
              sx={{
                mr: 1,
              }}
              onClick={handleConfirmation}
              disabled={!formik.dirty || !formik.isValid}
            >
              Save Changes
            </Button>
          }
        </DialogActions>
      </DialogContent>
    </Fragment>
  );
};

export default UpdateCategoryDialog;
