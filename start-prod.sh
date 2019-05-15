# Unix Bourne-Again shell script

# SET 'orderlah' database environment

# set Production
export NODE_ENV="prod"

export DB_HOST="192.168.99.100"
export DB_USERNAME="orderlah_web_user"
export DB_PASSWORD="mysecurepassword"

# start nodemon
npm run start

trap "kill -9 $! && echo \"killed $!\" && exit 0" SIGINT SIGQUIT SIGTSTP SIGKILL
while :
do
        sleep 60	
done