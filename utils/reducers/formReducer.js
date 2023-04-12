export const reducer = (state, action) => {
  const {validationResult, id, value} = action;

  // console.log('validationResult', id, validationResult);
  const inputValidities = {
    ...state.inputValidities,
    [id]: validationResult,
  };
  const inputValues = {
    ...state.inputValues,
    [id]: value,
  };
  let formIsValid = true;
  for (const key in inputValidities) {
    if (inputValidities[key] !== undefined) {
      formIsValid = false;
      break;
    }
  }
  return {inputValues, inputValidities, formIsValid};
};
