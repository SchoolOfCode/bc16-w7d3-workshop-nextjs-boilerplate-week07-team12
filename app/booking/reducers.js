// ACTIONS

export const FORM_ACTIONS = {
  SUBMITTING: "FORM_SUBMITTING",
  SUBMITTED: "FORM_SUBMITTED",
  SUBMISSION_ERROR: "FORM_SUBMISSION_ERROR",
  UPDATE_FIELD: "FORM_UPDATE_FIELD",
  TOUCH_FORM: "FORM_TOUCH",
};

// REDUCERS

const showIsSubmitting = (state) => {
  const form = Object.assign(state.form, {
    isSubmitting: true,
    hasSubmitted: false,
  });
  return { ...state, form };
};

const showSubmitted = (state, payload) => {
  const form = Object.assign(state.form, {
    isSubmitting: false,
    hasSubmitted: true,
  });
  return { ...payload, form };
};

const updateField = (state, { field, value, valid, message }) => {
  const updatedField = Object.assign(state.fields[field], {
    value,
    touched: true,
    valid,
    validationMessage: message,
  });
  return {
    form: state.form,
    fields: { ...state.fields, [field]: updatedField },
  };
};

const touchForm = (state) => {
  const updatedForm = Object.assign(state.form, { touched: true });
  for (const fieldName in state.fields) {
    state.fields[fieldName].touched = true;
  }
  return { form: { ...updatedForm }, fields: { ...state.fields } };
};

export const formReducer = (state, action) => {
  switch (action.type) {
    case FORM_ACTIONS.SUBMITTING:
      return showIsSubmitting(state);
    case FORM_ACTIONS.SUBMITTED:
      return showSubmitted(state, action.payload);
    case FORM_ACTIONS.SUBMISSION_ERROR: {
      return state;
    }
    case FORM_ACTIONS.UPDATE_FIELD:
      return updateField(state, action.payload);

    case FORM_ACTIONS.TOUCH_FORM:
      return touchForm(state);
    default:
      return state;
  }
};
