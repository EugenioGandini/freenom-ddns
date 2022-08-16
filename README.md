# Freenom DynamicDns

Automated control of DNS A record on freenom.com

## How it works

This node script works with Puppeteer and it executes the same operations that a normal user will do when he/she edits the DNS A record.

For this to work properly it's important to have these information handy before start:
1) freenom credentials (email and password)
2) domain name to control and domain id (the 2nd information can be found in the url when visiting the freenom DNS management page
```
e.g.: https://my.freenom.com/clientarea.php?managedns=${domain}&domainid=${domainID})
```

## Install

The installation process is simple and can be done in 2 ways:
- [standalone nodejs executable](#nodejs-standalone) (on a system with nodejs 16.X preinstalled)
- [docker environment](#docker)

### NodeJs Standalone

Pre-requirements:
- node 16.X installed
- git installed

Clone this project into a working directory:

```
git clone https://github.com/EugenioGandini/freenom-ddns.git
```

Install all packages:
```
npm i
```

Make a .env file like this one:
```
U_EMAIL=freenom_email   // freenom email
U_PWD=freenom_password  // freenom password
DOMAIN=example.com      // domain name
DOMAIN_ID=0123456789    // freenom domain ID
WAIT_MIN=3              // min # second to wait between each operation
WAIT_MAX=6              // max # second to wait between each operation
```

Run the script:
```
node index.js
```

### Docker

Pre-requirements:
- docker engine installed

Clone this project into a working directory:

```
git clone https://github.com/EugenioGandini/freenom-ddns.git
```

Create a volume where the container will store some debug files and configuration:
```
docker volume create freenom_ddns
```

Build the docker image:
```
docker build -t freenom_ddns:1.0 .
```

Create a container and run it:
```
docker run -e U_EMAIL=freenom_email -e U_PWD=freenom_password -e DOMAIN=example.com -e DOMAIN_ID=0123456789 -v freenom_ddns:/app/output --name ddns freenom_ddns:1.0
```

## Periodic check

It's important note that, in order to work, this script need to be run periodically. Usually between 5 to 60 minutes it's a good value.

Depending on which installation method you have choose this can be done using a cron job.
```
*/5 * * * * node index.js
```
or
```
*/5 * * * * docker run ...
```

## Author

[Eugenio Gandini](https://github.com/EugenioGandini)