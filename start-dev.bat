:: Windows bat script

@ECHO OFF

:: Auto login
set AUTO_LOGIN=NO
set LOGIN_AS=john@customer

:: SET 'orderlah' database environment

:: set Development
set NODE_ENV=dev

SET DB_HOST=localhost
SET DB_USERNAME=orderlah_web_user
SET DB_PASSWORD=mysecurepassword

:: start nodemon
npm run start:dev

PAUSE