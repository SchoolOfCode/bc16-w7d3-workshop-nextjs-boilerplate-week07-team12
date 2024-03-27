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

const validators = {
  fname(value) {
    if (value === "") {
      return {
        valid: false,
        message: "The first name cannot be blank",
      };
    }

    return {
      valid: true,
    };
  },
  lname(value) {
    if (value === "") {
      return {
        valid: false,
        message: "The last name cannot be blank",
      };
    }
    return {
      valid: true,
    };
  },
  postcode(value) {
    if (value === "") {
      return {
        valid: false,
        message: "The post code cannot be blank",
      };
    }
    return {
      valid: true,
    };
  },
  address(value) {
    if (value === "") {
      return {
        valid: false,
        message: "The address cannot be blank",
      };
    }
    return {
      valid: true,
    };
  },
  phone(value) {
    if (value === "") {
      return {
        valid: false,
        message: "The phone cannot be blank",
      };
    }
    return {
      valid: true,
    };
  },
  email(value) {
    if (value === "") {
      return {
        valid: false,
        message: "The email cannot be blank",
      };
    }
    return {
      valid: true,
    };
  },
};

function validate(field, value) {
  // Universal validation (eg. not empty)
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

const formReducer = (state, action) => {
  switch (action.type) {
    case FORM_ACTIONS.UPDATE: {
      const { field, value } = action.payload;
      const { valid, message } = validate(field, value);

      const fields = Object.assign(state.fields, {
        [field]: {
          value,
          valid,
          validationMessage: message,
        },
      });

      return { ...state, fields };
    }
    case FORM_ACTIONS.SUBMISSION_VALIDATE: {
      for (const field in state.fields) {
        if (!state.fields[field].valid) {
          const form = {
            valid: false,
            isSubmitting: false,
            hasSubmitted: false,
          };
          return { ...state, form };
        }
      }
      const form = {
        valid: true,
        isSubmitting: false,
        hasSubmitted: false,
      };
      return { ...state, form };
    }
    case FORM_ACTIONS.SUBMITTING: {
      const form = Object.assign(state.form, {
        isSubmitting: true,
        hasSubmitted: false,
      });
      return { ...state, form };
    }
    case FORM_ACTIONS.SUBMITTED: {
      const form = Object.assign(state.form, {
        isSubmitting: false,
        hasSubmitted: true,
      });
      return { ...initial, form };
    }
    case FORM_ACTIONS.SUBMISSION_ERROR: {
      return state;
    }
    default:
      return state;
  }
};

// COMPONENT

function Booking() {
  const [state, dispatch] = useReducer(formReducer, initial);

  const handleChange = useCallback((e) => {
    dispatch({
      type: FORM_ACTIONS.UPDATE,
      payload: { field: e.target.id, value: e.target.value },
    });

    dispatch({
      type: FORM_ACTIONS.SUBMISSION_VALIDATE,
    });
  });

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    const inputs = e.target.querySelectorAll(".booking__form-input");

    // TODO: Maybe think about having a `touched` property in fields state?
    for (const input of inputs) {
      dispatch({
        type: FORM_ACTIONS.UPDATE,
        payload: { field: input.id, value: input.value },
      });
    }

    dispatch({
      type: FORM_ACTIONS.SUBMISSION_VALIDATE,
    });

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
      <form
        className="booking__form"
        action="api/booking"
        method="post"
        onSubmit={handleSubmit}
      >
        <ul className="booking__form-list">
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
    </main>
  );
}

export default Booking;
