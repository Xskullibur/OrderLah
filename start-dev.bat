:: Windows bat script

@ECHO OFF

:: SET 'orderlah' database environment

:: set Development
set NODE_ENV=dev

SET DB_HOST=localhost
SET DB_USERNAME=orderlah_web_user
SET DB_PASSWORD=mysecurepassword

:: start nodemon
npm run start:dev

PAUSE