:: Windows bat script

@ECHO OFF

:: SET 'orderlah' database environment

:: set Development
set NODE_ENV=dev

SET DB_HOST=192.168.99.100
SET DB_USERNAME=orderlah_web_user
SET DB_PASSWORD=mysecurepassword

:: run mocha test
npm test


PAUSE