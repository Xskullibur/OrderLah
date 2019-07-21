:: Windows bat script

@ECHO OFF

:: SET 'orderlah' database environment

:: set Production
set NODE_ENV=prod

SET DB_HOST=192.168.99.100
SET DB_NAME=orderlah_db
SET DB_USERNAME=orderlah_web_user
SET DB_PASSWORD=mysecurepassword

SET HTTPS=NO

:: start nodemon
npm run start


PAUSE