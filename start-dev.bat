@ECHO OFF

:: SET 'orderlah' database environment

SET DB_HOST=192.168.99.100
SET DB_USERNAME=orderlah_web_user
SET DB_PASSWORD=mysecurepassword

:: start nodemon
npm run start:dev


PAUSE