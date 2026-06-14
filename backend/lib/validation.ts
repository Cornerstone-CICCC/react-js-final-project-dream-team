/**
 * Shared validation helpers for auth and other routes.
 * All functions are pure and throw-free — they return error strings or null.
 */

// RFC 5322-compliant basic email check
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

export interface FieldError {
  field: string;
  message: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  identifier: string; // username OR email
  password: string;
}

/**
 * Validate registration fields.
 * Returns an array of field errors (empty = valid).
 */
export function validateRegister(input: RegisterInput): FieldError[] {
  const errors: FieldError[] = [];

  // Username
  const username = input.username?.trim() ?? "";
  if (!username) {
    errors.push({ field: "username", message: "Username is required." });
  } else if (username.length < 3 || username.length > 20) {
    errors.push({ field: "username", message: "Username must be 3–20 characters." });
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push({
      field: "username",
      message: "Username may only contain letters, numbers, and underscores.",
    });
  }

  // Email
  const email = input.email?.trim() ?? "";
  if (!email) {
    errors.push({ field: "email", message: "Email is required." });
  } else if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Please enter a valid email address." });
  }

  // Password — basic length gate; strength is handled by zxcvbn separately
  const password = input.password ?? "";
  if (!password) {
    errors.push({ field: "password", message: "Password is required." });
  } else if (password.length < 8) {
    errors.push({ field: "password", message: "Password must be at least 8 characters." });
  } else if (password.length > 128) {
    errors.push({ field: "password", message: "Password must be under 128 characters." });
  }

  return errors;
}

/**
 * Validate login fields.
 * Returns an array of field errors (empty = valid).
 */
export function validateLogin(input: LoginInput): FieldError[] {
  const errors: FieldError[] = [];

  const identifier = input.identifier?.trim() ?? "";
  if (!identifier) {
    errors.push({ field: "identifier", message: "Username or email is required." });
  }

  if (!input.password) {
    errors.push({ field: "password", message: "Password is required." });
  }

  return errors;
}
