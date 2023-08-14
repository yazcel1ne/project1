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
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  editUsers,
  fetchCategory,
  fetchRoles as fetchRolesApi,
} from "../../config/api";

const EditUserDialog = ({ onClose, selectedUser, snackBarData }) => {
  const [name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [confirmationButtons, setConfirmationButtons] = useState(false); // set the confirmation buttons
  const [isLoading, setIsLoading] = useState(false); // set the loading state
  const [submitted, setSubmitted] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .required("Email is required")
      .email("Invalid email address"),
    password: Yup.string(),
    role: Yup.string(),
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
    initialValues: selectedUser,
    validationSchema,
  });

  const handleConfirmation = () => {
    const { name, email } = formik.values;

    if (formik.dirty) {
      if (!name && !email && !password && !role) {
        snackBarData(true, "error", "Please fill in all the required fields.");
      } else {
        setConfirmationButtons(true);
      }
    } else {
      snackBarData(true, "error", "No changes made.");
    }
  };

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
    fetchCategories();
    fetchRoles();
  }, []);

  const handleSave = async (values) => {
    setIsLoading(true);

    const response = await editUsers(values); 

    if (response.ok) {
      snackBarData(true, "success", response.data.message);
      onClose();
    } else {
      setConfirmationButtons(false);
      setIsLoading(false);
      snackBarData(true, "error", response.data.error);
    }

  };

  useEffect(() => {
    setFullName(selectedUser.name);
    setEmail(selectedUser.email);
    setPassword(selectedUser.password);
    setSelectedRole(selectedUser.role);
    setSelectedCategories(selectedUser.categories);
  }, [
    selectedUser.name,
    selectedUser.email,
    selectedUser.password,
    selectedUser.role,
    selectedUser.categories,
  ]);

  return (
    <Fragment>

      <DialogContent>
        <TextField
          id="name"
          name="name"
          margin="dense"
          label="Name"
          type="text"
          value={formik.values.name}
          onClick={() => formik.setFieldTouched("name", true)}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            (formik.touched.name && Boolean(formik.errors.name)) ||
            (submitted && !formik.values.name)
          }
          helperText={
            (formik.touched.name && formik.errors.name) ||
            (submitted && !formik.values.name && "Name is required")
          }
          fullWidth
          variant="outlined"
          size="small"
        />
        <TextField
          id="email"
          margin="dense"
          label="Email"
          type="text"
          value={formik.values.email}
          onClick={() => formik.setFieldTouched("email", true)}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            (formik.touched.email && Boolean(formik.errors.email)) ||
            (submitted && !formik.values.email)
          }
          helperText={
            (formik.touched.email && formik.errors.email) ||
            (submitted && !formik.values.email && "Email is required")
          }
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
          value={formik.values.password}
          onClick={() => formik.setFieldTouched("password", true)}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          fullWidth
          variant="outlined"
          size="small"
        />

        <Autocomplete
          size="small"
          fullWidth
          options={role}
          getOptionLabel={(role) => role}
          value={selectedRole}
          onChange={(event, newValue) => {
            formik.setFieldValue("role", newValue);
            setSelectedRole(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label={"Role"}
              margin="dense"
              variant="outlined"
            />
          )}
        />

        <Autocomplete
          size="small"
          fullWidth
          multiple
          options={categories}
          getOptionLabel={(categories) => {
            if (typeof categories === "string") {
              return categories;
            } else {
              return categories.name;
            }
          }}
          value={selectedCategories}
          onChange={(event, newValue) => {
            formik.setFieldValue("categories", newValue);
            setSelectedCategories(newValue);
          }}
          getOptionDisabled={(categories) =>
            selectedCategories.some((chosenCategories) =>
              chosenCategories.name === (typeof categories === 'object' ? categories.name : category.name)
            )
          }
          onBlur={formik.handleBlur("categories")}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              margin="dense"
              label={"Categories"}
              variant="outlined"
            />
          )}
        />

        <DialogActions>
          {confirmationButtons ? (
            <ConfirmationButtons
              loading={isLoading}
              save={() => handleSave(formik.values)}
              onClose={() => setConfirmationButtons(false)}
            />
          ) : (
            <Button
              color="success"
              variant="contained"
              onClick={() => {
                handleConfirmation();
                setSubmitted(true);
              }}
              disabled={!formik.dirty || !formik.isValid}
            >
              Save Changes
            </Button>
          )}
        </DialogActions>
      </DialogContent>
    </Fragment>
  );
};

export default EditUserDialog;
