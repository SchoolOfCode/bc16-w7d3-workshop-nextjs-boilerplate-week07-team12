"use client";
//hooks
import React, { useReducer, useMemo } from "react";
//reducers
import { FORM_ACTIONS, reducer } from "./reducers.js";
//mui components
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import Stack from "@mui/material/Stack";
//styling
import "./Form.css";
//mui icon
import { EventNote } from "@mui/icons-material";

const { UPDATE, SET_STATUS_MESSAGE, SUBMIT, SUBMIT_ERROR, SUBMIT_SUCCESS } =
  FORM_ACTIONS;

const createInitialState = (formData) => {
  const formFields = formData.reduce((acc, field) => {
    acc[field.id] = { value: "", isValid: true, invalidMessage: "" };
    return acc;
  }, {});

  return {
    formData: formFields,
    statusMessage: "",
    isSubmitting: false,
    submissionSuccess: false,
  };
};

const createValidators = (formData) => {
  const validators = formData.reduce((acc, field) => {
    acc[field.id] = field.validations.pattern || (() => true);
    return acc;
  }, {});

  return validators;
};

const Form = ({ formData }) => {
  const initialState = useMemo(() => createInitialState(formData), [formData]);
  const validators = useMemo(() => createValidators(formData), [formData]);

  const [state, dispatch] = useReducer(reducer, initialState);

  let invalidMessage = "";

  const handlePOST = async (data) => {
    const finalData = Object.entries(data).reduce((acc, [key, { value }]) => {
      acc[key] = value;
      return acc;
    }, {});

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData || "Server error");
      }

      const responseData = await response.json();
      
      dispatch({
        type: SET_STATUS_MESSAGE,
        message: responseData.payload.msg,
      });
      dispatch({
        type: SUBMIT_SUCCESS,
      });
    } catch (error) {
      console.error("Something went wrong", error);
      dispatch({
        type: SET_STATUS_MESSAGE,
        message: "An error occurred. Please try again later.",
      });
      dispatch({ type: SUBMIT_ERROR });
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    const field = formData.find((field) => field.id === id);

    // HANDLE ASYNC VALIDATION
    if (validators[id].constructor.name === "AsyncFunction") {
      (async () => {
        try {
          const isValid = await validators[id](value || null);

          if (!isValid) {
            invalidMessage = field.validations.invalidMessage;
            dispatch({
              type: SUBMIT_ERROR,
            });
          }

          dispatch({
            type: UPDATE,
            field: id,
            value: value,
            isValid: isValid,
            invalidMessage: invalidMessage,
          });
        } catch (error) {
          console.error("Error validating field", id, error);
        }
      })();
      return;
    }

    // HANDLE SYNCHRONOUS VALIDATION
    const isValid = validators[id](value);

    if (!isValid) {
      dispatch({
        type: SUBMIT_ERROR,
      });
      invalidMessage = field.validations.invalidMessage;
    }

    dispatch({
      type: UPDATE,
      field: id,
      value: value,
      isValid: isValid,
      invalidMessage: invalidMessage,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: SUBMIT });

    // Test loading delay...
    const delay = (duration) =>
      new Promise((resolve) => setTimeout(resolve, duration));

    // Empty field check
    const isEmptyField = Object.values(state.formData).some(
      (field) => field.value.trim() === ""
    );

    // Any invalid field check
    const isAnyFieldInvalid = Object.values(state.formData).some(
      (field) => field.isValid === false
    );

    if (isEmptyField) {
      dispatch({
        type: SET_STATUS_MESSAGE,
        message: "Unsuccessful: Please fill in all fields",
      });
      dispatch({ type: SUBMIT_ERROR });
      Object.entries(state.formData).forEach(([fieldId, fieldData]) => {
        if (fieldData.value.trim() === "") {
          const isValid = false;
          dispatch({
            type: UPDATE,
            field: fieldId,
            value: fieldData.value,
            isValid: isValid,
            invalidMessage: "This field is required",
          });
        }
      });
      return;
    }

    if (isAnyFieldInvalid) {
      dispatch({
        type: SET_STATUS_MESSAGE,
        message: "Please correct the errors before submitting.",
      });
      dispatch({ type: SUBMIT_ERROR });
      return;
    }

    delay(1000).then(() => {
      dispatch({ type: SET_STATUS_MESSAGE, message: "Consultation Booked!" });

      // HANDLE POST REQUEST HERE
      handlePOST(state.formData);
    });
  };
  return (
    <>
      {!state.submissionSuccess ? (
        <Box
          component="form"
          sx={{
            "& .MuiTextField-root": { mb: 0.5 },
            "& label.Mui-focused": {
              color: "#ff9800",
            },
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: "#ff9800",
              },
            },
          }}
          noValidate
          autoComplete="on"
          className="booking__form-container"
          onSubmit={handleSubmit}
          action="api/booking"
          method="post"
        >
          <h2 className="booking__form-heading">
            So we know where our fireplace will be going
          </h2>
          {formData.map((field, index) => (
            <TextField
              key={index}
              id={field.id}
              label={field.label}
              variant="outlined"
              required={field.validations?.required}
              placeholder={field.placeholder}
              className="booking__form-input"
              {...{ [field.update]: handleChange }}
              error={!state.formData[field.id].isValid}
              helperText={state.formData[field.id].invalidMessage}
              sx={{
                ...(!state.formData[field.id].isValid && {
                  "& label.Mui-focused": {
                    color: "red",
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "red",
                    },
                  },
                }),
              }}
            />
          ))}
          <Stack alignItems="center" justifyContent={"center"} direction="row">
            <LoadingButton
              variant="contained"
              sx={{
                p: 1.5,
                bgcolor: "orange",
                fontWeight: "600",
                fontFamily: "inherit",
                alignItems: "center",
                "&:hover": { bgcolor: "darkorange" },
              }}
              type="submit"
              endIcon={<EventNote />}
              loading={state.isSubmitting}
              disabled={state.isSubmitting}
            >
              <span>Book Consultation</span>
            </LoadingButton>
          </Stack>
        </Box>
      ) : (
        <div className="booking__form-container">
          <div className="booking__form-message success">
            {state.statusMessage}
          </div>
        </div>
      )}
    </>
  );
};

export default Form;
