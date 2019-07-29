:: Windows bat script

@ECHO OFF


: Redis server
REM SET REDIS_PORT=24679
REM SET REDIS_HOST=ec2-52-215-0-174.eu-west-1.compute.amazonaws.com
REM SET REDIS_PASSWORD=pa76aff90d50e3f88f437112949793703de773528b51be81478babf490af7180d
SET REDIS_PORT=6379
SET REDIS_HOST=192.168.99.100

:: Auto login
set AUTO_LOGIN=NO
set LOGIN_AS=john@customer

:: SET 'orderlah' database environment

:: set Development
set NODE_ENV=dev

SET DB_HOST=192.168.99.100
SET DB_NAME=orderlah_db
SET DB_USERNAME=orderlah_web_user
SET DB_PASSWORD=mysecurepassword

SET HTTPS=YES

:: start nodemon
npm run start:dev

PAUSE