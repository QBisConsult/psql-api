# psql-api
RADIP RESTful API for PostgreSQL

INSTALLATION

Requirements:

- OpenSSL should be installed before in order to allow the server to create it's first self-signed SSL certificate.
- Linux you will need to set your computer to accept opening lower ports for NodeJs (80/443 ...) without root access, next code works for Ubuntu

               sudo apt-get install libcap2-bin
               sudo setcap cap_net_bind_service=+ep /usr/local/bin/node


Install from git:
git clone https://github.com/QBisConsult/psql-api.git

Run this inside the new server folder:   

sudo npm install

Run the server with:

node start.js

This server will open two ports, one for administration on HTTPS (443) and another for API requests.

The server can be managed at:  https://server_Ip_or_domain name

It will generate a self-signed SSL certificate at start until you will provide an authorized one.

If OpenSSL can not be found, you will need to provide a SSL certificate otherwise the server will not start.
Put the certificate into "ssl" folder as service.crt and service.key files. The SSL certificate is a PEM encoded crt file.

You can change the server port and protocol (HTTP/HTTPS) for API access from settings page.

Please check the SSL documentation page for more information.

See SETTINGS chapter for this server SSL setup after installation.

FEATURES

Implements all CRUD operations (CREATE, READ, UPDATE, DELETE).
Automatically imports the database structure and create a metadata of your database.Single point access, accept POST/PUT/GET/DELETE http methods and respond with a JSON data object.

Basic operations can be used from the start:

    CREATE - insert records
    READ - read one record by ID
    UPDATE - update one record
    DELETE - delete one record

The servers accepts batch of different commands at once and uses transactions by default.

Inject your code BEFORE and AFTER operations in order to customize access to each action.

Create queries and access them with simple GET commands.

Current version can be set to access data from one PostgreSQL server.

This RESTful API server can be used to offer WEB services for various kind of applications and devices over HTTP/HTTPS protocol like WEB, mobile or IoT applications  that consumes WEB services.



License open source MIT
