rsync -rav --exclude-from='.gitignore' * ---:~
scp -i --- query-service/ffxiv.db :~/query-service

sudo yum update -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 16
npm install pm2 -g

# ~/query-service
cd ~/query-service
npm install https://github.com/mapbox/node-sqlite3/tarball/master
npm install
pm2 start query-service.js --name query

# ~/web-service
cd ~/web-service
npm install
pm2 start webserve.js

# nginx
sudo amazon-linux-extras install nginx1 -y
sudo cp ffxiv-script.conf /etc/nginx/conf.d
sudo systemctl start nginx.service

# Deploy
scp -r -i --- frontend/build :~/frontend