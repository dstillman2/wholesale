import { validate } from '../lib/util.validations';

const accounts = {
  email_address: {
    isRequired: true,
    validation: validate.isEmail,
  },

  password: {
    isRequired: true,
    validation: validate.isStringOfLengthGreaterThan(0),
  },

  company: {
    isRequired: true,
    validation: validate.isStringOfLengthGreaterThan(0),
  },

  first_name: {
    isRequired: true,
    validation: validate.isStringOfLengthGreaterThan(0),
  },

  last_name: {
    isRequired: true,
    validation: validate.isStringOfLengthGreaterThan(0),
  },

  address_1: {
    isRequired: true,
    validation: validate.isStringOfLengthGreaterThan(0),
  },

  address_2: {
    isRequired: true,
    validation: validate.isStringOfLengthGreaterThan(0),
  },

  city: {
    isRequired: true,
    validation: validate.isStringOfLengthGreaterThan(0),
  },

  state: {
    isRequired: true,
    validation: validate.isStringOfLengthGreaterThan(0),
  },

  zip_code: {
    isRequired: true,
    validation: validate.isStringOfLengthGreaterThan(0),
  },
};

export default accounts;
