# Unix Bourne-Again shell script

# SET 'orderlah' database environment

# Redis server
export REDIS_PORT="6379"
export REDIS_HOST="127.0.0.1"

# set Production
export NODE_ENV="prod"

export DB_HOST="localhost"
export DB_NAME="orderlah_db"
export DB_USERNAME="orderlah_web_user"
export DB_PASSWORD="mysecurepassword"

export HTTPS="NO"

# start nodemon
npm run start
