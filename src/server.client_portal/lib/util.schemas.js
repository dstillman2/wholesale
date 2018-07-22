import _ from 'underscore';
import { snakeToCamelConverter } from './key_format';

const fields = {
  default({ process: process = val => val, defaultValue = null } = {}) {
    return (fieldValue) => {
      if (fieldValue === 'null' || typeof fieldValue === 'undefined') {
        return null;
      }

      if (typeof fieldValue === 'number') {
        return process(fieldValue);
      }

      return process(fieldValue) || defaultValue;
    };
  },

  string({ process: process = val => val, defaultValue = null } = {}) {
    return (fieldValue) => {
      if (typeof fieldValue === 'string' && fieldValue !== 'null') {
        return process(fieldValue);
      } else if (typeof fieldValue === 'number') {
        return process(String(fieldValue));
      }

      return defaultValue;
    };
  },

  number({ process: process = val => val, defaultValue = null } = {}) {
    return (fieldValue) => {
      if (typeof fieldValue === 'number') {
        return process(fieldValue);
      } else if (
        typeof fieldValue === 'string' &&
        !isNaN(fieldValue) && fieldValue.length > 0) {
        return process(Number(fieldValue));
      }

      return defaultValue;
    };
  },

  boolean({ process: process = val => val, defaultValue = null } = {}) {
    return (fieldValue) => {
      if (typeof fieldValue === 'boolean') {
        return process(fieldValue);
      }

      if (typeof fieldValue === 'number') {
        if (fieldValue === 0) {
          return process(false);
        }

        return process(true);
      }

      if (typeof fieldValue === 'string') {
        if (fieldValue === '0') {
          return process(false);
        }

        if (fieldValue === 'true') {
          return process(true);
        }

        if (fieldValue === 'false') {
          return process(false);
        }

        return process(true);
      }

      return defaultValue;
    };
  },
};

const conversion = function conversion(object, totalCount) {
  let fieldTypeConversion; // see fields object
  const output = {};

  if (_.isArray(object)) {
    output.data = [];

    for (let i = 0; i < object.length; i += 1) {
      output.data.push({});
      for (const key in this) {
        fieldTypeConversion = this[key];

        output.data[i][key] = fieldTypeConversion(object[i][key]);
      }
    }
    output.count = output.data.length;

    if (totalCount) {
      output.total_count = totalCount;
      output.totalCount = totalCount;
    }
  } else if (_.isObject(object)) {
    output.count = 1;
    output.data = {};

    for (const key in this) {
      fieldTypeConversion = this[key];

      output.data[key] = fieldTypeConversion(object[key]);
    }
  }

  if (Array.isArray(output.data)) {
    output.data = output.data.map(item => Object.assign({}, item, snakeToCamelConverter(item)));
  }

  return output;
};


function dump(schemas) {
  const obj = {};
  const pd = ClassName => (data, totalCount) => (
    conversion.call(new ClassName(), data, totalCount)
  );

  for (const className in schemas) {
    obj[className] = pd(schemas[className]);
  }

  return obj;
}

export { fields, dump, conversion };
