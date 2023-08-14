import {
  Button,
  Grid,
  TextField,
  Autocomplete,
  DialogContent,
  DialogTitle,
  DialogActions,
  Tooltip,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Divider,
  Paper,
} from "@mui/material";
import React, { useEffect, useState, Fragment, useRef } from "react";
import { Delete, Add } from "@mui/icons-material/";
import { updateSingleItem, updateMultipleItems } from "../../config/api";
import ConfirmationButtons from "../ConfirmationButtons";
import { centerContents } from "../style";
import { purchaseRequestPaper } from "../customizedComponentStyle";
import { useFormik } from 'formik';
import * as Yup from 'yup';

const UseMultipleDialog = ({ onClose, snackBarData }) => {
  const [items, setItems] = useState([]);
  const [confirmationButtons, setConfirmationButtons] = useState(false); // set the confirmation buttons
  const [isLoading, setIsLoading] = useState(false); // set the loading state
  const [filteredItems, setFilteredItems] = useState([]);
  const [useItems, setUseItems] = useState([
    {
      itemId: "",
      itemName: "",
      measurement: "",
      quantity: "",
      unit: "",
    },
  ]);

  const [isFormValid, setIsFormValid] = useState(false);

  const validationSchema = Yup.object().shape({
    quantity: Yup.array().of(
      Yup.number().required('Quantity is required')
        .typeError('Quantity must be a number')
        .positive('Quantity must be a positive number')
    ),

  });

  const formik = useFormik({
    initialValues: {
      quantity: useItems.map((item) => item.quantity),
    },
    validationSchema,
    onSubmit: async (values) => {
      const updatedUseItems = useItems.map((item, index) => ({
        ...item,
        quantity: values.quantity[index],
      }));

      setIsLoading(true);
      const response = await updateMultipleItems({
        useItems: updatedUseItems,
      });
      if (response.ok) {
        snackBarData(true, "success", response.data.message);
        onClose();
      } else {
        setIsLoading(false);
        snackBarData(true, "error", response.data.error);
        setConfirmationButtons(false);
      }
    },
  });

  const handleConfirmation = () => {
    formik.validateForm().then(() => {
      setIsFormValid(formik.isValid);
      setConfirmationButtons(true);
    });
  };

  const handleAddClick = () => {
    setUseItems([
      ...useItems,
      {
        itemId: "",
        itemName: "",
        measurement: "",
        quantity: "",
        unit: "",
      },
    ]);

    formik.setFieldValue(
      "quantity",
      [...formik.values.quantity, ""],
      true
    );
    setConfirmationButtons(false);
  };

  const handleUseItemsUpdate = (index, field, value) => {
    const updatedUseItems = {
      ...useItems[index],
      [field]:
        field === "itemName"
          ? value.replace(/\b\w/g, (c) => c.toUpperCase())
          : value,
    };

    // Update corresponding fields based on selected item
    if (field === "itemName") {
      const filteredItems = items
        .filter((item) =>
          item.item_name.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 100);
      setFilteredItems(filteredItems);

      const selectedItem = items.find((item) => item.item_name === value);

      if (selectedItem) {
        updatedUseItems.itemId = selectedItem.id;
        updatedUseItems.measurement = selectedItem.quantity;
        updatedUseItems.unit = selectedItem.unit;
        setFilteredItems(items.slice(0, 200));
      } else {
        updatedUseItems.itemId = "";
        updatedUseItems.measurement = "";
        updatedUseItems.unit = "";
      }
    }

    const updatedUseItemList = [...useItems];
    updatedUseItemList[index] = updatedUseItems;
    setUseItems(updatedUseItemList);
  };

  const handleRemoveClick = (index) => {
    const newUseItem = [...useItems];
    newUseItem.splice(index, 1);
    setUseItems(newUseItem);
  };

  const fetchItems = async () => {
    setIsLoading(true);
    const response = await updateSingleItem();
    if (response.ok) {
      const items = response.data.items;
      setItems(items);

      const filteredItems = items.slice(0, Math.min(items.length, 200));
      setFilteredItems(filteredItems);
      setIsLoading(false);
    }
  };

  const scrollContainerRef = useRef(null);
  useEffect(() => {
    const scrollableElement = scrollContainerRef.current;
    scrollableElement.scrollTop = scrollableElement.scrollHeight;

  }, [useItems]);

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <Fragment>
      <DialogTitle>Update Multiple Items</DialogTitle>
      <DialogContent>
        <Paper sx={purchaseRequestPaper} ref={scrollContainerRef}>
          {useItems.map((useItem, index) => (
            <Fragment key={index} >
              <Box sx={centerContents}>
                <Typography marginRight={2}>{index + 1}</Typography>
                <Grid
                  container
                  spacing={1}
                  marginTop={1}
                  padding={1}
                  paddingBottom={0}
                >
                  <Grid container spacing={1} item xs={10} md={10} lg={10}>
                    <Grid item marginBottom={1} xs={12} lg={6}>
                      <Autocomplete
                        loading={isLoading}
                        fullWidth
                        options={filteredItems}
                        getOptionDisabled={(option) =>
                          useItems.some((p) => p.itemName === option.item_name)
                        }
                        value={
                          items.find(
                            (option) =>
                              option.item_name.toLowerCase() ===
                              useItem.itemName.toLowerCase()
                          ) || {
                            item_name: useItem.itemName,
                            value: useItem.itemName,
                          }
                        }
                        getOptionLabel={(option) => option.item_name}
                        onChange={(event, newValue) => {
                          handleUseItemsUpdate(
                            index,
                            "itemName",
                            newValue.item_name
                          );
                        }}
                        onInputChange={(event, newInputValue) => {
                          handleUseItemsUpdate(index, "itemName", newInputValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            label="Item Name"
                            variant="outlined"
                          />
                        )}
                        disableClearable
                      />
                    </Grid>

                    <Grid item marginBottom={1} xs={12} sm={12} md={12} lg={6}>
                      <TextField
                        size="small"
                        helperText={
                          (formik.touched.quantity?.[index] && formik.errors.quantity?.[index]) ||
                          (formik.touched.quantity?.[index] && !formik.values.quantity[index]
                            ? "Quantity is required"
                            : useItem.measurement - formik.values.quantity[index] < 0
                              ? "Item is out of stock"
                              : useItem.measurement - formik.values.quantity[index] < useItem.quantity
                                ? "Item exceeds its quantity"
                                : `Item remaining will be ${useItem.measurement - formik.values.quantity[index]
                                } ${useItem.unit}`
                          )
                        }
                        label="Quantity to be reduced"
                        value={formik.values.quantity[index]}
                        fullWidth
                        onClick={() => formik.setFieldTouched(`quantity[${index}]`, true)}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        name={`quantity[${index}]`}
                        error={formik.touched.quantity?.[index] && Boolean(formik.errors.quantity?.[index])}
                      />
                    </Grid>
                  </Grid>
                  <Grid container item xs={2} md={2} lg={2}>
                    <Grid item xs={6} sm={6} md={6} lg={6}>
                      <Tooltip title="Remove Item">
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveClick(index)}
                          style={{
                            visibility:
                              useItems.length === 1 ? "hidden" : "visible",
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Grid>

                    {index === useItems.length - 1 && (
                      <Grid item xs={6} sm={6} md={6} lg={6}>
                        <Tooltip title="Add Row">
                          <Button
                            variant="contained"
                            color="info"
                            onClick={handleAddClick}
                          >
                            <Add />
                          </Button>
                        </Tooltip>
                      </Grid>
                    )}
                  </Grid>

                </Grid>
              </Box>
              {index !== useItems.length - 1 && <Divider sx={{ margin: '2px 0' }} />}
            </Fragment>
          ))}
        </Paper>
      </DialogContent>
      <DialogActions>
        {confirmationButtons ? (
          <ConfirmationButtons
            loading={isLoading}
            save={formik.handleSubmit}
            onClose={() => setConfirmationButtons(false)}
          />
        ) : (
          <Button
            color="success"
            variant="contained"
            disabled={isLoading || !formik.isValid}
            onClick={handleConfirmation}
          >
            Update
          </Button>
        )}
      </DialogActions>
    </Fragment>
  );
};
export default UseMultipleDialog;
