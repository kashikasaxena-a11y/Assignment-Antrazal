export const required = (fieldName) => {
  return (value) => {
    if (!value) return `${fieldName} is required`;
    return null;
  };
};

export const emailFormat = (fieldName) => {
  return (value) => {
    if (!value) return null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return `${fieldName} is not valid`;
    }
    return null;
  };
};

export const phoneFormat = (fieldName) => {
  return (value) => {
    if (!value) return null;

    const phoneRegex = /^[6-9]\d{9}$/; // India
    if (!phoneRegex.test(value)) {
      return `${fieldName} must be a valid 10-digit number`;
    }
    return null;
  };
};




