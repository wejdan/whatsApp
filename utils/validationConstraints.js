import {validate} from 'validate.js';

export const validateString = (id, value) => {
  const constraints = {
    presence: {allowEmpty: false},
  };
  if (value !== '') {
    constraints.format = {
      pattern: '[a-z]+',
      flags: 'i',
      message: 'value can only contain letters',
    };
  }
  const result = validate({[id]: value}, {[id]: constraints});
  return result && result[id];
};
export const validateLength = (id, value, minLength, maxLength, allowEmpty) => {
  const constraints = {
    presence: {allowEmpty},
  };
  if (!allowEmpty || value !== '') {
    constraints.length = {};
    if (minLength != null) {
      constraints.length.minimum = minLength;
    }
    if (maxLength != null) {
      constraints.length.maximum = maxLength;
    }
    // constraints.length.message = `needs to have ${maxLength} charachters or less`;
  }
  const result = validate({[id]: value}, {[id]: constraints});
  return result && result[id];
};
export const validateEmail = (id, value) => {
  const constraints = {
    presence: {allowEmpty: false},
  };
  if (value !== '') {
    constraints.email = true;
  }
  const result = validate({[id]: value}, {[id]: constraints});
  return result && result[id];
};
export const validatePassword = (id, value) => {
  const constraints = {
    presence: {allowEmpty: false},
  };
  if (value !== '') {
    constraints.length = {
      minimum: 6,
      message: 'must be at least 6 characters',
    };
  }
  const result = validate({[id]: value}, {[id]: constraints});
  return result && result[id];
};
