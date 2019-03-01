const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "Name must be beween 2 and 30 charactors length";
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name field required";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field required";
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field required";
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be beween 6 and 30 charactors length";
  }

  if (Validator.isEmpty(data.password2)) {
    errors.password2 = "Password2 field required";
  }

  if (!Validator.isLength(data.password2, { min: 6, max: 30 })) {
    errors.password2 = "Password2 must be beween 6 and 30 charactors length";
  }

  if (!Validator.equals(data.password2, data.password)) {
    errors.password2 = "Passwords must match";
  }

  console.log(isEmpty(errors));
  console.log(errors);

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
