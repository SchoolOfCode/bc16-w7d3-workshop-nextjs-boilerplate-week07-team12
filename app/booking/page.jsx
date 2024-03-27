"use client";
import React, { useCallback, useEffect, useReducer } from "react";
import "./page.css";

const postForm = (url, body) =>
  new Promise((res, rej) => {
    const t = setTimeout(() => {
      console.table(body);
      res({ message: "Success!" });
      clearTimeout(t);
    }, 1000);
  });

const fieldToString = (field) => {
  switch (field) {
    case "fname":
      return "First Name";
    case "lname":
      return "Last Name";
    case "postcode":
      return "Postcode";
    case "address":
      return "Address";
    case "phone":
      return "Phone number";
    case "email":
      return "email";
  }
};

const validators = {
  async fname(value) {
    if (value.length > 20) {
      return {
        valid: false,
        message: "The first name can't be over 20 characters long",
      };
    }
    return {
      valid: true,
    };
  },
  async lname(value) {
    if (value.length > 20) {
      return {
        valid: false,
        message: "The last name can't be over 20 characters long",
      };
    }
    return {
      valid: true,
    };
  },
  async postcode(value) {
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${value}/validate`,
    );
    const { status, result } = await response.json();
    if (result === false) {
      return {
        valid: false,
        message: "The post code must be valid",
      };
    }
    return {
      valid: true,
    };
  },
  async address(value) {
    return {
      valid: true,
    };
  },
  async phone(value) {
    const numWithoutSpaces = value.split(" ").join("");
    if (numWithoutSpaces.length < 11) {
      return {
        valid: false,
        message: "The phone number must be at least 11 digits long",
      };
    }
    if (!/\d+/.test(numWithoutSpaces)) {
      return {
        valid: false,
        message: "The phone number must contain only digits",
      };
    }
    return {
      valid: true,
    };
  },
  async email(value) {
    if (!/\w+\@[a-zA-Z|\d]+\.\w+/.test(value)) {
      return {
        valid: false,
        message: "Please input an valid email address",
      };
    }
    return {
      valid: true,
    };
  },
};

function validate(field, input) {
  const value = input.trim();
  // Universal validation (eg. not empty)

  // Can't be blank
  if (value === "") {
    return Promise.resolve({
      valid: false,
      message: `The ${fieldToString(field)} cannot be blank`,
    });
  }

  // Then pass it to individual validation
  return validators[field](value);
}

// REDUCER

const FORM_ACTIONS = {
  UPDATE: "FORM_UPDATE",
  SUBMISSION_VALIDATE: "FORM_SUBMISSION_VALIDATE",
  SUBMITTING: "FORM_SUBMITTING",
  SUBMITTED: "FORM_SUBMITTED",
  SUBMISSION_ERROR: "FORM_SUBMISSION_ERROR",
};

const initial = {
  fields: {
    fname: { value: "", valid: true, validationMessage: "" },
    lname: { value: "", valid: true, validationMessage: "" },
    postcode: { value: "", valid: true, validationMessage: "" },
    address: { value: "", valid: true, validationMessage: "" },
    phone: { value: "", valid: true, validationMessage: "" },
    email: { value: "", valid: true, validationMessage: "" },
  },
  form: { valid: true, isSubmitting: false, hasSubmitted: false },
};

function dispatchMiddleware(dispatch) {
  return async (action) => {
    switch (action.type) {
      case FORM_ACTIONS.UPDATE: {
        const { field, value } = action.payload;
        const { valid, message } = await validate(field, value);
        dispatch({
          type: action.type,
          payload: { ...action.payload, valid, message },
        });
        break;
      }
      default:
        return dispatch(action);
    }
  };
}

const updateFieldAndValidate = (state, { field, value, valid, message }) => {
  const fields = Object.assign(state.fields, {
    [field]: {
      value,
      valid,
      validationMessage: message,
    },
  });

  return { ...state, fields };
};

const validateForm = (state) => {
  for (const field in state.fields) {
    if (!state.fields[field].valid) {
      state.form.valid = false;
      state.form.isSubmitting = false;
      state.form.hasSubmitted = false;
      return { ...state };
    }
  }
  state.form.valid = true;
  state.form.isSubmitting = false;
  state.form.hasSubmitted = false;
  return { ...state };
};

const showIsSubmitting = (state) => {
  const form = Object.assign(state.form, {
    isSubmitting: true,
    hasSubmitted: false,
  });
  return { ...state, form };
};

const showSubmitted = (state) => {
  const form = Object.assign(state.form, {
    isSubmitting: false,
    hasSubmitted: true,
  });
  return { ...initial, form };
};

const formReducer = (state, action) => {
  switch (action.type) {
    case FORM_ACTIONS.UPDATE:
      return updateFieldAndValidate(state, action.payload);
    case FORM_ACTIONS.SUBMISSION_VALIDATE:
      return validateForm(state);
    case FORM_ACTIONS.SUBMITTING:
      return showIsSubmitting(state);
    case FORM_ACTIONS.SUBMITTED:
      return showSubmitted(state);
    case FORM_ACTIONS.SUBMISSION_ERROR: {
      return state;
    }
    default:
      return state;
  }
};

// COMPONENT

function Booking() {
  const [state, rootDispatch] = useReducer(formReducer, initial);
  const dispatch = dispatchMiddleware(rootDispatch);

  const handleChange = useCallback(async (e) => {
    await dispatch({
      type: FORM_ACTIONS.UPDATE,
      payload: { field: e.target.id, value: e.target.value },
    });

    dispatch({
      type: FORM_ACTIONS.SUBMISSION_VALIDATE,
    });
  });

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const inputs = e.target.querySelectorAll(".booking__form-input");

    // TODO: Maybe think about having a `touched` property in fields state?
    for (const input of inputs) {
      await dispatch({
        type: FORM_ACTIONS.UPDATE,
        payload: { field: input.id, value: input.value },
      });
    }

    await dispatch({
      type: FORM_ACTIONS.SUBMISSION_VALIDATE,
    });

    console.log("state.form.valid:", state.form.valid);

    if (state.form.valid) {
      dispatch({
        type: FORM_ACTIONS.SUBMITTING,
      });

      postForm("/api/booking", state.fields)
        .then((result) => {
          dispatch({
            type: FORM_ACTIONS.SUBMITTED,
            payload: {
              message: result.message,
            },
          });
        })
        .catch((err) => {
          dispatch({
            type: FORM_ACTIONS.SUBMISSION_ERROR,
            payload: {
              message: err.message,
            },
          });
        });
    }
  });

  return (
    <main className="booking__content">
      <section className="booking__banner">Design Booking</section>
      {!state.form.hasSubmitted ? (
        <form
          className="booking__form"
          action="api/booking"
          method="post"
          onSubmit={handleSubmit}
        >
          <ul className="booking__form-container">
            <h2 className="booking__form-heading">
              So we know where our fireplace will be going
            </h2>
            <div className="input__container">
              <input
                id="fname"
                type="text"
                className="booking__form-input"
                placeholder=""
                onBlur={handleChange}
                // required
                // pattern="^[A-Z][a-z]+(?: [A-Z][a-z]+)*$"
                // onInvalid={(e) => {
                //   dispatch({ type: FORM_ACTIONS.VALIDATE, payload: e });
                // }}
              />
              <label htmlFor="fname" className="booking__form-label">
                First Name
              </label>
              <span
                className={`booking__input-error ${
                  state.fields.fname.valid ? "hidden" : ""
                }`}
              >
                {state.fields.fname.validationMessage}
              </span>
            </div>
            <div className="input__container">
              <input
                id="lname"
                type="text"
                className="booking__form-input"
                placeholder=""
                onBlur={handleChange}
                // required
                // pattern="^[A-Z][a-z]+(?: [A-Z][a-z]+)*$"
              />
              <label htmlFor="lname" className="booking__form-label">
                Last Name
              </label>
              <span
                className={`booking__input-error ${
                  state.fields.lname.valid ? "hidden" : ""
                }`}
              >
                {state.fields.lname.validationMessage}
              </span>
            </div>
            <div className="input__container">
              <input
                id="postcode"
                type="text"
                className="booking__form-input"
                placeholder=""
                onBlur={handleChange}
                // required
                // pattern="^([A-Z][A-HJ-Y]?\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0A{2})$"
              />
              <label htmlFor="postcode" className="booking__form-label">
                Postcode
              </label>
              <span
                className={`booking__input-error ${
                  state.fields.postcode.valid ? "hidden" : ""
                }`}
              >
                {state.fields.postcode.validationMessage}
              </span>
            </div>
            <div className="input__container">
              <input
                id="address"
                type="text"
                className="booking__form-input"
                placeholder=""
                onBlur={handleChange}
                // required
                // pattern="(.|\s)*\S(.|\s)*"
              />
              <label htmlFor="address" className="booking__form-label">
                Address
              </label>
              <span
                className={`booking__input-error ${
                  state.fields.address.valid ? "hidden" : ""
                }`}
              >
                {state.fields.address.validationMessage}
              </span>
            </div>
            <h2 className="booking__form-heading">
              So we know how to contact you
            </h2>
            <div className="input__container">
              <input
                id="phone"
                type="text"
                className="booking__form-input"
                placeholder=""
                onBlur={handleChange}
                // required
              />
              <label htmlFor="phone" className="booking__form-label">
                Phone Number
              </label>
              <span
                className={`booking__input-error ${
                  state.fields.phone.valid ? "hidden" : ""
                }`}
              >
                {state.fields.phone.validationMessage}
              </span>
            </div>
            <div className="input__container">
              <input
                id="email"
                type="email"
                className="booking__form-input"
                placeholder=""
                onBlur={handleChange}
                // required
              />
              <label htmlFor="email" className="booking__form-label">
                Email
              </label>
              <span
                className={`booking__input-error ${
                  state.fields.email.valid ? "hidden" : ""
                }`}
              >
                {state.fields.email.validationMessage}
              </span>
            </div>
            {/* <div
            className={`booking__form-validation ${
              state.form.valid ? "hidden" : ""
            }`}
          >
            There were some errors in the inputs. Please check!
          </div> */}
            <button
              disabled={!state.form.valid}
              type="submit"
              className={`booking__form-submit ${
                state.form.valid ? "" : "booking__form-error"
              }`}
            >
              {state.form.valid ? "Book Consultation" : "Please fix the errors"}
            </button>
          </ul>
        </form>
      ) : (
        <div className="booking__form-container">
          <h2 className="booking__form-message">Consultation booked!</h2>
        </div>
      )}
    </main>
  );
}

export default Booking;
