# Unix Bourne-Again shell script

# Redis server
export REDIS_PORT="6379"
export REDIS_HOST="127.0.0.1"

# Auto login
export AUTO_LOGIN="YES"
export LOGIN_AS="john@customer"

# SET 'orderlah' database environment

# set Development
export NODE_ENV='dev'

export DB_HOST="localhost"
export DB_NAME="orderlah_db"
export DB_USERNAME="orderlah_web_user"
export DB_PASSWORD="mysecurepassword"

export HTTPS="NO"

# start nodemon
npm run start:dev &

trap "kill -9 $! && echo \"killed $!\" && exit 0" SIGINT SIGQUIT SIGTSTP SIGKILL
while :
do
        sleep 60
done