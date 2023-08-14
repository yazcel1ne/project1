import React, { useState, useEffect, Fragment } from "react";
import {
  Button,
  TextField,
  DialogActions,
  DialogContent,
  DialogTitle,
  Autocomplete,
} from "@mui/material";
import ConfirmationButtons from "../ConfirmationButtons";
import {
  createUsers,
  fetchRoles as fetchRolesApi,
  fetchCategory,
} from "../../config/api";
import { useFormik } from "formik";
import * as Yup from "yup";

const CreateUserDialog = ({ snackBarData, onClose }) => {
  //role
  const [role, setRole] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  //category
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [confirmationButtons, setConfirmationButtons] = useState(false); // set the confirmation buttons
  const [isLoading, setIsLoading] = useState(false); // set the loading state
  const [isFormValid, setFormValid] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .required("Email is required")
      .email("Invalid email address"),
    password: Yup.string().required("Password is required"),
    role: Yup.string().required("Role is required"),
    categories: Yup.array()
    .nullable()
    .min(1, "At least one category must be selected")
    .of(
      Yup.object().shape({
        id: Yup.number().required(),
        name: Yup.string().required(),
      })
    ),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: "",
      categories:[]
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      //needed
      console.log(values);
    },
  });

  const handleClose = () => {
    onClose();
  };

  const handleConfirmation = () => {
    setConfirmationButtons(true);
  };

  // CREATE FUNCTION
  const handleSubmitCreate = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    // Check if any field is empty
    const isAnyFieldEmpty = Object.keys(formik.values).some(
      (key) => !formik.values[key]
    );

    // Check if any field is touched
    const isAnyFieldTouched = Object.keys(formik.touched).some(
      (key) => formik.touched[key]
    );

    if (!isAnyFieldEmpty && isAnyFieldTouched) {
      const response = await createUsers(formik.values)
      if (response.ok) {
          snackBarData(true, "success", response.data.message);
          handleClose();
        } else {
          snackBarData(true, "error", response.data.error);
          setIsLoading(false);
          setConfirmationButtons(false);
        }
    } else {
      // Set the form fields as touched to display validation errors
      formik.setTouched({
        name: true,
        email: true,
        password: true,
        role: true,
        categories:true
      });
      snackBarData(
        true,
        "error",
        "Please provide the required information in the form."
      );
      setIsLoading(false);
      setConfirmationButtons(false);
    }
  };

  //get roles
  const fetchRoles = async () => {
    const response = await fetchRolesApi();
    if (response.ok) {
      const allRoles = response.data.role;
      setRole(allRoles);
    } else {
      snackBarData(true, "error", "Cannot fetch roles");
    }
  };

  const fetchCategories = async () => {
    const response = await fetchCategory();
    if (response.ok) {
      const allCategories = response.data.categories;
      setCategories(allCategories);
    } else {
      snackBarData(true, "error", "Cannot fetch categories");
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchCategories();
    setFormValid(Object.keys(formik.errors).length === 0);
  }, [formik.errors]);

  return (
    <Fragment>
      <DialogContent>
        <TextField
          id="name"
          name="name"
          margin="dense"
          label="Name"
          onClick={() => formik.setFieldTouched("name", true)}
          onBlur={formik.handleBlur}
          value={formik.values.name}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
          onChange={formik.handleChange}
          fullWidth
          variant="outlined"
          size="small"
        />
        <TextField
          id="email"
          name="email"
          margin="dense"
          label="Email"
          onClick={() => formik.setFieldTouched("email", true)}
          onBlur={formik.handleBlur}
          value={formik.values.email}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          onChange={(e) => formik.setFieldValue("email", e.target.value)}
          fullWidth
          variant="outlined"
          size="small"
        />
        <TextField
          id="password"
          name="password"
          margin="dense"
          label="Password"
          type="password"
          onClick={() => formik.setFieldTouched("password", true)}
          onBlur={formik.handleBlur}
          value={formik.values.password}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          onChange={(e) => formik.setFieldValue("password", e.target.value)}
          fullWidth
          variant="outlined"
          size="small"
        />
        <Autocomplete
          size="small"
          fullWidth
          options={role}
          getOptionLabel={(role) => role}
          value={formik.values.role}
          onChange={(event, newValue) => {
            formik.setFieldValue("role", newValue);
            setSelectedRole(newValue);
          }}
          onBlur={formik.handleBlur("role")}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              margin="dense"
              label={"Role"}
              variant="outlined"
              error={formik.touched.role && formik.errors.role}
              helperText={formik.touched.role && formik.errors.role}
            />
          )}
        />
        <Autocomplete
          size="small"
          fullWidth
          multiple
          options={categories}
          getOptionLabel={(categories) => categories.name}
          value={formik.values.categories}
          onChange={(event, newValue) => {
           formik.setFieldValue('categories', newValue );
           setSelectedCategories(newValue);
          }}
          getOptionDisabled={(categories) =>
            selectedCategories.some((chosenCategories) => chosenCategories.id === categories.id) //
          }
          onBlur={formik.handleBlur("categories")}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              margin="dense"
              label={"Categories"}
              variant="outlined"
              error={formik.touched.categories && formik.errors.categories}
              helperText={formik.touched.categories && formik.errors.categories}
            />
          )}
        />

        <DialogActions>
          {confirmationButtons ? (
            <ConfirmationButtons
              loading={isLoading}
              save={handleSubmitCreate}
              onClose={() => setConfirmationButtons(false)}
            />
          ) : (
            <Button
              color="success"
              variant="contained"
              onClick={handleConfirmation}
              disabled={!isFormValid}
            >
              Create
            </Button>
          )}
        </DialogActions>
      </DialogContent>
    </Fragment>
  );
};

export default CreateUserDialog;
