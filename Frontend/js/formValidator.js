  /*
*********************************************************************************************************
 *  @File Name     : formValidator.js
 *  @Author        : Kashika Saxena (kashika.saxena@antrazal.com)
 *  @Company       : Antrazal
 *  @Date          : 16-12-2025
 *  @Description   : Complete form validation before submission
 *********************************************************************************************************
*/

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
