import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
  beforeSend(event) {
    // Filter out certain errors if needed
    if (event.exception) {
      const error = event.exception.values?.[0]
      if (error?.value?.includes('Database connection failed')) {
        return null // Don't send certain database errors
      }
    }
    return event
  },
})
