// Shared by the server config and the forms, so the browser never accepts a password the server would refuse
export const PASSWORD_RULES = { minLength: 8, maxLength: 128 } as const;

export const NAME_MAX_LENGTH = 60;

export type SignInValues = { email: string; password: string };
export type SignUpValues = SignInValues & { name: string };
export type ProfileValues = { name: string; email: string };
export type PasswordValues = { currentPassword: string; newPassword: string; confirmPassword: string };
export type DeleteAccountValues = { password: string };

export type FieldErrors<Values> = Partial<Record<keyof Values, string>>;

// Deliberately loose: the only reliable check of an address is an email sent to it
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

// Never trimmed: spaces can be part of a password
const readPassword = readText;

const readEmail = (formData: FormData) => readText(formData, "email").trim().toLowerCase();

function validateName(name: string) {
  if (!name) return "Indiquez votre nom.";
  if (name.length > NAME_MAX_LENGTH) return `Le nom ne peut pas dépasser ${NAME_MAX_LENGTH} caractères.`;
}

function validateEmail(email: string) {
  if (!email) return "Indiquez votre adresse e-mail.";
  if (!EMAIL_PATTERN.test(email)) return "Cette adresse e-mail n’est pas valide.";
}

function validateNewPassword(password: string) {
  if (password.length < PASSWORD_RULES.minLength)
    return `Choisissez un mot de passe d’au moins ${PASSWORD_RULES.minLength} caractères.`;
  if (password.length > PASSWORD_RULES.maxLength)
    return `Le mot de passe ne peut pas dépasser ${PASSWORD_RULES.maxLength} caractères.`;
}

const requirePassword = (password: string) => (password ? undefined : "Indiquez votre mot de passe.");

// Returns null once every field is valid, so callers test a single value
function compact<Values>(errors: FieldErrors<Values>) {
  const entries = Object.entries(errors).filter(([, message]) => message);
  return entries.length ? (Object.fromEntries(entries) as FieldErrors<Values>) : null;
}

export function parseSignInForm(formData: FormData) {
  const values: SignInValues = { email: readEmail(formData), password: readPassword(formData, "password") };
  const errors = compact<SignInValues>({
    email: validateEmail(values.email),
    password: requirePassword(values.password),
  });
  return { values, errors };
}

export function parseSignUpForm(formData: FormData) {
  const values: SignUpValues = {
    name: readText(formData, "name").trim(),
    email: readEmail(formData),
    password: readPassword(formData, "password"),
  };
  const errors = compact<SignUpValues>({
    name: validateName(values.name),
    email: validateEmail(values.email),
    password: validateNewPassword(values.password),
  });
  return { values, errors };
}

export function parseProfileForm(formData: FormData) {
  const values: ProfileValues = { name: readText(formData, "name").trim(), email: readEmail(formData) };
  const errors = compact<ProfileValues>({ name: validateName(values.name), email: validateEmail(values.email) });
  return { values, errors };
}

export function parsePasswordForm(formData: FormData) {
  const values: PasswordValues = {
    currentPassword: readPassword(formData, "currentPassword"),
    newPassword: readPassword(formData, "newPassword"),
    confirmPassword: readPassword(formData, "confirmPassword"),
  };
  const errors = compact<PasswordValues>({
    currentPassword: requirePassword(values.currentPassword),
    newPassword:
      validateNewPassword(values.newPassword) ??
      (values.newPassword === values.currentPassword ? "Choisissez un mot de passe différent de l’actuel." : undefined),
    confirmPassword:
      values.confirmPassword === values.newPassword ? undefined : "Les deux mots de passe ne correspondent pas.",
  });
  return { values, errors, revokeOtherSessions: formData.get("revokeOtherSessions") === "on" };
}

export function parseDeleteAccountForm(formData: FormData) {
  const values: DeleteAccountValues = { password: readPassword(formData, "password") };
  return { values, errors: compact<DeleteAccountValues>({ password: requirePassword(values.password) }) };
}

// Better Auth answers in English; its codes are stable, its messages are not
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Adresse e-mail ou mot de passe incorrect.",
  USER_ALREADY_EXISTS: "Un compte existe déjà avec cette adresse e-mail.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Un compte existe déjà avec cette adresse e-mail.",
  INVALID_EMAIL: "Cette adresse e-mail n’est pas valide.",
  INVALID_PASSWORD: "Mot de passe incorrect.",
  PASSWORD_TOO_SHORT: `Choisissez un mot de passe d’au moins ${PASSWORD_RULES.minLength} caractères.`,
  PASSWORD_TOO_LONG: `Le mot de passe ne peut pas dépasser ${PASSWORD_RULES.maxLength} caractères.`,
  CREDENTIAL_ACCOUNT_NOT_FOUND: "Ce compte n’a pas de mot de passe.",
  SESSION_EXPIRED: "Votre session a expiré. Reconnectez-vous pour continuer.",
  TOO_MANY_REQUESTS: "Trop de tentatives. Patientez une minute avant de réessayer.",
};

export function getAuthErrorMessage(error: { code?: string; status?: number }) {
  if (error.status === 429) return AUTH_ERROR_MESSAGES.TOO_MANY_REQUESTS;
  return (error.code && AUTH_ERROR_MESSAGES[error.code]) ?? "Une erreur est survenue. Réessayez dans un instant.";
}
