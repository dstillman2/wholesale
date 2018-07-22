import { validate, processData } from '../lib/util.validations';

const users = {
  email_address: {
    isRequired: true,
    validation: validate.isEmail,
  },

  phone_number: {
    isRequired: true,
    validation: validate.isPhoneNumber,
    postProcess: processData.encrypt,
  },

  password: {
    isRequired: true,
    validation: validate.isStringOfLengthGreaterThanOrEqualTo(5),
  },

  first_name: {
    isRequired: true,
    validation: validate.isStringOfLengthGreaterThan(0),
    postProcess: processData.encrypt,
  },

  last_name: {
    isRequired: true,
    validation: validate.isStringOfLengthGreaterThan(0),
    postProcess: processData.encrypt,
  },

  address_1: {
    isRequired: false,
    validation: validate.isStringOfLengthGreaterThan(0),
    postProcess: processData.encrypt,
  },

  address_2: {
    isRequired: false,
    validation: validate.isStringOfLengthGreaterThan(0),
    postProcess: processData.encrypt,
  },

  city: {
    isRequired: false,
    validation: validate.isStringOfLengthGreaterThan(0),
    postProcess: processData.encrypt,
  },

  state: {
    isRequired: false,
    validation: validate.isStringOfLengthGreaterThan(0),
    postProcess: processData.encrypt,
  },

  zip_code: {
    isRequired: false,
    validation: validate.isStringOfLengthGreaterThan(0),
    postProcess: processData.encrypt,
  },

  uploads: {
    isRequired: false,
  },
};

export default users;
