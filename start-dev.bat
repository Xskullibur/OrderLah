:: Windows bat script

@ECHO OFF

:: Auto login
set AUTO_LOGIN=YES
set LOGIN_AS=john@customer

:: SET 'orderlah' database environment

:: set Development
set NODE_ENV=dev

SET DB_HOST=192.168.99.100
SET DB_USERNAME=orderlah_web_user
SET DB_PASSWORD=mysecurepassword

:: start nodemon
npm run start:dev

PAUSE