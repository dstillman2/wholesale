// @flow
import cryptoJs from 'crypto-js';
import { ENCRYPT_KEY } from '../options';

const validate = {
  isEmail(value) {
    if (typeof value === 'string') {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(value);
    }

    return false;
  },

  isPhoneNumber() {
    return true;
  },

  isStringOfLengthGreaterThan: (minLength: number) => (
    (value: string) => {
      if (typeof value === 'string') {
        return value.length > minLength;
      }

      return false;
    }
  ),

  isStringOfLengthGreaterThanOrEqualTo: (minLength: number) => (
    (value: string) => {
      if (typeof value === 'string') {
        return value.length >= minLength;
      }

      return false;
    }
  ),

  isStringOfLengthLessThan: (minLength: number) => (
    (value: string) => {
      if (typeof value === 'string') {
        return value.length < minLength;
      }

      return false;
    }
  ),

  isStringOfLengthLessThanOrEqualTo: (minLength: number) => (
    (value: string) => {
      if (typeof value === 'string') {
        return value.length <= minLength;
      }

      return false;
    }
  ),

  isNumber(value: number) {
    return typeof value === 'number';
  },

  isInteger(value: number) {
    return Number.isInteger(value);
  },

  isArray(value) {
    return Array.isArray(value);
  },
};

const processData = {
  encrypt(value) {
    if (value) {
      return cryptoJs.AES.encrypt(value, ENCRYPT_KEY).toString();
    }

    return value;
  },

  decrypt(value) {
    if (value) {
      return cryptoJs.AES.decrypt(value, ENCRYPT_KEY).toString(cryptoJs.enc.Utf8);
    }

    return value;
  },

  convertToNumber(value) {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string' && !isNaN(value) && value.length > 0) {
      return Number(value);
    }

    return null;
  },

  convertToBoolean(value) {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      if (value === 0) {
        return false;
      }

      return true;
    }

    if (typeof value === 'string') {
      if (value === '0') {
        return false;
      }

      if (value === 'true') {
        return true;
      }

      if (value === 'false') {
        return false;
      }

      return true;
    }

    return false;
  },

  jsonParse(value) {
    return value ? JSON.parse(value) : '';
  },
};

const validateParameters = params => (key, fields, callback) => {
  let missingFields = [];
  let validationErrors = [];
  let output = {};

  Object.keys(params[key]).forEach((paramsKey) => {
    // check if value is missing. If missing, add the field to missingFields.
    if (params[key].isRequired && typeof fields[paramsKey] === 'undefined') {
      missingFields = [].concat(missingFields, paramsKey);

      return;
    }

    if (!fields[paramsKey]) {
      const defaultValue = params[key][paramsKey].defaultValue;

      if (defaultValue) {
        output = Object.assign({}, output, {
          [paramsKey]: params[key][paramsKey].defaultValue,
        });
      }

      return;
    }

    const preProcess = params[key][paramsKey].preProcess || (value => value);
    const postProcess = params[key][paramsKey].postProcess || (value => value);

    // validate parameter if validation specified
    if (fields[paramsKey] && params[key][paramsKey].validation) {
      const isParameterValidated = (
        params[key][paramsKey].validation(preProcess(fields[paramsKey]))
      );

      if (!isParameterValidated) {
        validationErrors = validationErrors.concat(validationErrors, [{
          name: paramsKey,
          reason: '',
        }]);
      }
    }

    output = Object.assign({}, output, {
      [paramsKey]: postProcess(preProcess(fields[paramsKey])),
    });
  });

  if (missingFields.length || validationErrors.length) {
    callback({
      code: 10010,
      type: 'parameter validation',
      message: 'validation errors',
      missingFields,
      validationErrors,
    });

    return;
  }

  callback(null, output);
};

export { processData, validate, validateParameters };
export default validate;
