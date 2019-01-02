To run locally, create a file in the root project directory called "variables.env"
You'll need to supply these fields to avoid CORS issues:
FRONTEND_URL
BASE_URL

Used in generating jwt tokens:
APP_SECRET

In order to send password reset emails using Mailgun, provide these fields:
MAIL_HOST
MAIL_PORT
MAIL_USER
MAIL_PASS

Restricting user creation without using ecaptcha can be implemented by providing test users with a login code:
SIGNUP_SECRET