import { validate, processData } from '../lib/util.validations';

const products = {
  name: {
    isRequired: true,
    validation: validate.isStringOfLengthGreaterThan(0),
  },

  categories: {
    isRequired: false,
    validation: validate.isStringOfLengthGreaterThan(0),
  },

  price: {
    isRequired: true,
    validation: validate.isNumber,
    preProcess: processData.convertToNumber,
  },

  lead_time: {
    isRequired: false,
    preProcess: processData.convertToNumber,
  },

  description: {
    isRequired: false,
    validation: validate.isStringOfLengthGreaterThan(0),
  },

  is_active_marketplace: {
    isRequired: true,
    preProcess: processData.convertToBoolean,
  },

  inventory: {
    isRequired: false,
    validation: validate.isNumber,
    defaultValue: null,
    preProcess: processData.convertToNumber,
    postProcess: val => (isNaN(val) ? null : val),
  },

  'image_uploads[]': {
    isRequired: false,
    validation: validate.isArray,
    preProcess: processData.jsonParse,
  },

  'pdf_uploads[]': {
    isRequired: false,
    validation: validate.isArray,
  },
};

export default products;
