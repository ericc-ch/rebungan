import { ZodIssue, ZodSchema } from "zod";

// Define a type for the errors object
type FormErrors<T> = {
  [P in keyof T]?: string[]; // Each field can have an array of error messages or be undefined if no errors
};

export type ValidateResult<T> = {
  errors: FormErrors<T>;
  isValid: boolean;
};

export const validateForm = <T>(
  formData: FormData,
  schema: ZodSchema<T>
): ValidateResult<T> => {
  // Convert FormData to a plain object
  const formObject = Object.fromEntries(formData);

  // Validate the data against the schema
  const result = schema.safeParse(formObject);

  // If there are no errors, return an empty object
  if (result.success) {
    return {
      errors: {},
      isValid: true,
    };
  }

  // Otherwise, process the errors
  const errors: FormErrors<T> = {};
  result.error.issues.forEach((issue: ZodIssue) => {
    const field = issue.path[0] as keyof T;
    if (!errors[field]) {
      errors[field] = [];
    }
    errors[field]!.push(issue.message);
  });

  return { errors, isValid: false };
};

export const createValidationResult = <T>(
  errors: FormErrors<T>
): ValidateResult<T> => {
  if (Object.keys(errors).length > 0) {
    return { errors, isValid: false };
  }
  return { errors: {}, isValid: true };
};
