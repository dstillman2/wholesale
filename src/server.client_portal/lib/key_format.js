/**
 * converts snake-cased keys to camelcase
 * @param {object} obj
 * @returns {object} camelCased keys
 */
function snakeToCamelConverter(obj) {
  const newObj = {};

  Object.keys(obj).forEach((key) => {
    let keyName = '';
    let flag = false;

    key.split('').forEach((letter) => {
      if (letter === '_') {
        flag = true;
      } else if (flag) {
        keyName += letter.toUpperCase();

        flag = false;
      } else {
        keyName += letter;
      }
    });

    newObj[keyName] = obj[key];
  });

  return newObj;
}

function removeUndefinedValuesFromObject(obj) {
  const newObj = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined) {
      newObj[key] = value;
    }
  });

  return newObj;
}

export {
  snakeToCamelConverter,
  removeUndefinedValuesFromObject,
};
