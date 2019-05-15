:: Windows bat script

@ECHO OFF

:: SET 'orderlah' database environment

:: set Development
set NODE_ENV=dev

SET DB_HOST=192.168.99.100
SET DB_USERNAME=orderlah_web_user
SET DB_PASSWORD=mysecurepassword

:: start nodemon
start /b "nodemon" npm run start:dev

taskkill /FI "WindowTitle eq nodemon*" /T /F

PAUSE