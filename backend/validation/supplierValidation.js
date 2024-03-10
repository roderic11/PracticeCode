const isEmpty = require("./isEmpty");
const validator = require("validator");

module.exports = function ValidateSupplier(data) {
  let errors = {};
  data.ItemName = !isEmpty(data.ItemName) ? data.ItemName : "";
  data.supplier = !isEmpty(data.supplier) ? data.supplier : "";
  data.unitCost = !isEmpty(data.unitCost) ? data.unitCost : "";
 
  if (validator.isEmpty(data.ItemName)) {
    errors.ItemName = "Format ItemName required";
  }
  if (validator.isEmpty(data.ItemName)) {
    errors.ItemName = "Required ItemName";
  }
  if (validator.isEmpty(data.supplier)) {
    errors.supplier = "Required supplier";
  }
  if (validator.isEmpty(data.unitCost)) {
    errors.unitCost = "Required unitCost";
  }
  

  return {
      errors,
      isValid: isEmpty(errors)
  }
};
