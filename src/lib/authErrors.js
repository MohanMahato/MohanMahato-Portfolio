// Turns technical Supabase auth errors into short, friendly messages.
// The same message is used for "wrong email" and "wrong password" so nobody can
// find out which emails exist (this is called preventing user enumeration).
export function friendlyAuthMessage(error) {
  const text = `${error?.code ?? ''} ${error?.message ?? ''}`.toLowerCase()

  if (text.includes('invalid_credentials') || text.includes('invalid login credentials')) {
    return 'Incorrect email or password.'
  }
  if (text.includes('email_not_confirmed') || text.includes('email not confirmed')) {
    return 'This account is not confirmed yet. Confirm the user in the Supabase dashboard (Authentication, Users).'
  }
  if (error?.status === 429 || text.includes('rate limit') || text.includes('too many')) {
    return 'Too many attempts. Please wait a few minutes and try again.'
  }
  if (text.includes('failed to fetch') || text.includes('network') || text.includes('retryable')) {
    return 'Cannot reach the server. Check your internet connection and try again.'
  }
  if (text.includes('not-configured')) {
    return 'The website is not connected to Supabase yet. Check your .env file.'
  }
  return 'Something went wrong. Please try again.'
}
