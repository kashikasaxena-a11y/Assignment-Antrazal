  export const validateForm = (data, rules) => {
  const errors = {};

  for (let field in rules) {
    for (let rule of rules[field]) {
      const error = rule(data[field]);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }

  return errors;
};
