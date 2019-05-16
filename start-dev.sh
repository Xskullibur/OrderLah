# Unix Bourne-Again shell script

# SET 'orderlah' database environment

# set Development
export NODE_ENV='dev'

export DB_HOST="localhost"
export DB_USERNAME="orderlah_web_user"
export DB_PASSWORD="mysecurepassword"

# start nodemon
npm run start:dev &

trap "kill -9 $! && echo \"killed $!\" && exit 0" SIGINT SIGQUIT SIGTSTP SIGKILL
while :
do
        sleep 60
done