cd ./connectclient
start /wait call ng build --prod

cd ..
start call npm run electron
