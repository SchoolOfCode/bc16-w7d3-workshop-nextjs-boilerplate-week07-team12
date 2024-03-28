"use client";
import React, { useCallback, useReducer } from "react";
import "./page.css";

import { formReducer, FORM_ACTIONS } from "./reducers";

const { SUBMITTING, SUBMITTED, SUBMISSION_ERROR, UPDATE_FIELD, TOUCH_FORM } =
  FORM_ACTIONS;

const postForm = (url, body) =>
  fetch(url, {
    body: JSON.stringify(body),
    method: "post",
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
    // TODO: Sanitise the value
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

const initial = {
  fields: {
    fname: { value: "", touched: false, valid: false, validationMessage: "" },
    lname: { value: "", touched: false, valid: false, validationMessage: "" },
    postcode: {
      value: "",
      touched: false,
      valid: false,
      validationMessage: "",
    },
    address: { value: "", touched: false, valid: false, validationMessage: "" },
    phone: { value: "", touched: false, valid: false, validationMessage: "" },
    email: { value: "", touched: false, valid: false, validationMessage: "" },
  },
  form: {
    isSubmitting: false,
    hasSubmitted: false,
  },
};

function Booking() {
  const [state, dispatch] = useReducer(formReducer, initial);

  const values = Object.values(state.fields);
  console.log("state.fields.length", values.length);
  const formIsValid = values.every((fieldState) => {
    console.log(`field is valid: ${fieldState.valid}`);
    console.log(`field is touched: ${fieldState.touched}`);
    return fieldState.valid;
  });

  console.log(state.fields);

  const handleChange = useCallback((e) => {
    const fieldName = e.target.id;

    validate(fieldName, e.target.value).then(({ valid, message }) => {
      dispatch({
        type: UPDATE_FIELD,
        payload: {
          field: fieldName,
          value: e.target.value,
          valid,
          message,
        },
      });
    });
  });

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (formIsValid) {
      dispatch({
        type: SUBMITTING,
      });

      postForm("/api/booking", state.fields)
        .then((result) => {
          dispatch({
            type: SUBMITTED,
            payload: initial,
          });
        })
        .catch((err) => {
          dispatch({
            type: SUBMISSION_ERROR,
            payload: {
              message: err.message,
            },
          });
        });
    } else {
      dispatch({
        type: TOUCH_FORM,
      });
      for (const fieldName in state.fields) {
        const field = state.fields[fieldName];
        validate(fieldName, field.value).then(({ valid, message }) => {
          dispatch({
            type: UPDATE_FIELD,
            payload: {
              field: fieldName,
              value: field.value,
              valid,
              message,
            },
          });
        });
      }
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
            <InputField
              name="fname"
              type="text"
              onBlur={handleChange}
              label="First Name"
              valid={state.fields.fname.valid}
              validationMessage={state.fields.fname.validationMessage}
            />
            <InputField
              name="lname"
              type="text"
              onBlur={handleChange}
              label="Last Name"
              valid={state.fields.lname.valid}
              validationMessage={state.fields.lname.validationMessage}
            />
            <InputField
              name="postcode"
              type="text"
              onBlur={handleChange}
              label="Postcode"
              valid={state.fields.postcode.valid}
              validationMessage={state.fields.postcode.validationMessage}
            />
            <InputField
              name="address"
              type="text"
              onBlur={handleChange}
              label="Address"
              valid={state.fields.address.valid}
              validationMessage={state.fields.address.validationMessage}
            />
            <h2 className="booking__form-heading">
              So we know how to contact you
            </h2>
            <InputField
              name="phone"
              type="text"
              onBlur={handleChange}
              label="Phone Number"
              valid={state.fields.phone.valid}
              validationMessage={state.fields.phone.validationMessage}
            />
            <InputField
              name="email"
              type="email"
              onBlur={handleChange}
              label="Email"
              valid={state.fields.email.valid}
              validationMessage={state.fields.email.validationMessage}
            />
            <SubmitButton
              formIsValid={formIsValid}
              touched={state.form.touched}
            />
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

function SubmitButton({ formIsValid, touched }) {
  return (
    <button
      type="submit"
      className={`booking__form-submit ${
        formIsValid || !touched ? "" : "booking__form-error"
      }`}
    >
      {formIsValid || !touched ? "Book Consultation" : "Please fix the errors"}
    </button>
  );
}

function InputField({ name, type, onBlur, label, valid, validationMessage }) {
  return (
    <div className="input__container">
      <input
        id={name}
        type={type}
        className="booking__form-input"
        placeholder=""
        onBlur={onBlur}
        // required
      />
      <label htmlFor={name} className="booking__form-label">
        {label}
      </label>
      <span className={`booking__input-error ${valid ? "hidden" : ""}`}>
        {validationMessage}
      </span>
    </div>
  );
}

export default Booking;
