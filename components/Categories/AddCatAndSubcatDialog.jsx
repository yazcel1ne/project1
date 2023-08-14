import React, { useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  DialogActions,
  Grid,
  DialogContent,
  DialogTitle,
  Autocomplete,
} from "@mui/material";
import { useState, Fragment } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { fetchCategory, createCategory } from "../../config/api";
import ConfirmationButtons from "../ConfirmationButtons";

const validationSchema = Yup.object().shape({
  subcategory: Yup.string().required("New Sub Category is required"),
});

const AddCatAndSubcatDialog = ({ snackBarData, onClose, data }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [getCategories, setGetCategories] = useState([]);
  const [confirmationButtons, setConfirmationButtons] = useState(false); // set the confirmation buttons
  const [isLoading, setIsLoading] = useState(false);// set the loading state

  const handleConfirmation = () => {
    setConfirmationButtons(true);
  };

  const handleSubmitCreateCategory = async (values) => {
    setIsLoading(true);
    //error message when button is clicked w/o user input
    if (!values.subcategory) {
      snackBarData(true, "error", "Please fill in all the required field");
      return;
    }
    const response = await createCategory( {
      name: values.subcategory,
      parentCategory: selectedCategory,
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

  const getCategory = async () => {
    const response = await fetchCategory();
    if (response.ok) {
      setGetCategories(response.data.categories);
    }
  };

  const formik = useFormik({
    initialValues: {
      subcategory: "",
    },
    validationSchema,
    onSubmit: handleSubmitCreateCategory,
  });
  useEffect(() => {
    getCategory();
  }, []);

  const getCategoryValue = () => {
    getCategories.find((option) => option.name === selectedCategory);
  };

  const handleCategoryChange = (event, newValue) => {
    if (newValue) {
      setSelectedCategory(newValue.id);
    } else {
      setSelectedCategory("");
    }
  };

  return (
    <Fragment>
      <DialogContent>
        <Grid
          container
          direction={"column"}
          spacing={3}
          marginTop="10px"
          marginBottom={5}
        >
          <Grid item>
            <TextField
              id="subcategory"
              name="subcategory"
              label={
                selectedCategory !== ""
                  ? "Enter New Subcategory"
                  : "Enter New Parent Category"
              }
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => formik.setFieldTouched("subcategory", true)}
              value={formik.values.subcategory}
              onChange={formik.handleChange}
              error={formik.touched.subcategory && !!formik.errors.subcategory}
              helperText={
                formik.touched.subcategory && formik.errors.subcategory
              }
            />
          </Grid>

          <Grid item>
            <Box>
              <Autocomplete
                options={getCategories}
                getOptionLabel={(option) => option.name || ""}
                value={getCategoryValue()}
                onChange={handleCategoryChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    size="small"
                    label="Select Parent Catergory"
                  />
                )}
              />
            </Box>
          </Grid>
        </Grid>

        <DialogActions>
          {confirmationButtons ?
            <ConfirmationButtons
              loading={isLoading}
              save={formik.handleSubmit}
              onClose={() => setConfirmationButtons(false)}
            />
            :
            <Button
              color="success"
              variant="contained"
              onClick={handleConfirmation}
              disabled={!formik.isValid}
            >
              Create
            </Button>
          }
        </DialogActions>
      </DialogContent>
    </Fragment>
  );
};
export default AddCatAndSubcatDialog;
