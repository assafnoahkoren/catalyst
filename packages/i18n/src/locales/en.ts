type FlatTranslations = Record<string, string>

export const en = {
  appName: 'Catalyst',
  tagline: 'Full-stack monorepo starter',
  signIn: 'Sign In',
  signUp: 'Register',
  signOut: 'Sign Out',
  email: 'Email',
  password: 'Password',
  name: 'Name',
  emailPlaceholder: 'you@example.com',
  passwordPlaceholder: '••••••••',
  namePlaceholder: 'Your name',
  signingIn: 'Signing in...',
  creatingAccount: 'Creating account...',
  signInTitle: 'Sign In',
  signInDescription: 'Enter your credentials to continue',
  signUpTitle: 'Create Account',
  signUpDescription: 'Fill in your details to get started',
  noAccount: "Don't have an account?",
  hasAccount: 'Already have an account?',
  signInFailed: 'Sign in failed',
  registrationFailed: 'Registration failed',
} as const satisfies FlatTranslations

// Enforces: same keys as en, all values must be strings, no nesting allowed
export type Translations = { [K in keyof typeof en]: string }
