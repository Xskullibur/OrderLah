:: Windows bat script

@ECHO OFF


: Redis server
SET REDIS_PORT=6379
SET REDIS_HOST=192.168.99.100

:: Auto login
set AUTO_LOGIN=NO
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