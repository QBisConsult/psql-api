# psql-api
RADIP RESTful API for PostgreSQL

Installation

Requirements:

- OpenSSL should be installed before in order to allow the server to create it's first self-signed SSL certificate.
- for Linux you will need to set your computer to accept opening lower ports for NodeJs (80/443 ...) without root access, next code works for Ubuntu

               sudo apt-get install libcap2-bin
               sudo setcap cap_net_bind_service=+ep /usr/local/bin/node

Unzip the server archive.
Run this inside the new server folder:   
sudo npm install

Run the server with:
node start.js
This server will open two ports, one for administration on HTTPS (443) and another for API requests.
The server can be managed at:  https://<server Ip or domain name>
It will generate a self-signed SSL certificate at start until you will provide an authorized one.

If OpenSSL can not be found, you will need to provide a SSL certificate otherwise the server will not start.
Put the certificate into "ssl" folder as service.crt and service.key files. The SSL certificate is a PEM encoded crt file.

You can change the server port and protocol (HTTP/HTTPS) for API access from settings page.

Please check the SSL documentation page for more information.

See SETTINGS chapter for this server SSL setup after installation.

License open source MIT
