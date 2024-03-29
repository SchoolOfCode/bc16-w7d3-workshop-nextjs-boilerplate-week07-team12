// REDUCER FUNCTION
export const FORM_ACTIONS = {
  UPDATE: "FORM_UPDATE_FIELD",
  SET_STATUS_MESSAGE: "FORM_STATUS_MESSAGE",
  SUBMIT: "FORM_SUBMIT_FORM",
  SUBMIT_ERROR: "FORM_SUBMISSION_ERROR",
  SUBMIT_SUCCESS: "FORM_SUBMISSION_SUCCESS",
};

export const reducer = (state, action) => {
  switch (action.type) {
    case FORM_ACTIONS.UPDATE:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: {value: action.value, isValid: action.isValid, invalidMessage: action.invalidMessage},
        },
      };
    case FORM_ACTIONS.SET_STATUS_MESSAGE:
      return {
        ...state,
        statusMessage: action.message,
      };
    case FORM_ACTIONS.SUBMIT:
      return {
        ...state,
        isSubmitting: true,
      };
    case FORM_ACTIONS.SUBMIT_SUCCESS:
      return {
        ...state,
        isSubmitting: false,
        submissionSuccess: true,
      };
    case FORM_ACTIONS.SUBMIT_ERROR:
      return {
        ...state,
        isSubmitting: false,
        submissionSuccess: false,
      };
    default: 
      return state;
  }
};
