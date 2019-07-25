## Server setup
The following need to be installed/configured:

- Redis
- Node.js
- npm
- git
- process manager (e.g. [pm2](https://github.com/Unitech/pm2))
- logging (set up as you wish)
- `local.json` file needs to exist in the `/config` folder and should contain the app credentials.
- Set environment variable NODE_ENV to `production`

## Disable posting to congress members' web forms

If you need to disable the actual sending of email messages to congress members but want to keep the majority of the app visible and functional, just comment out the block of code (marked with multiline comment blocks) starting around line 117 of www/js/controllers/message-form.js and ending at the lone "}" around line 161.

## Additional AHO-specific server notes

This app is running on its own Ubuntu EC2 instance. The app files reside in the /home/ubuntu/dio directory. The app has been registered and launched with the pm2 process manager under the name DIO. Nginx web server is handling incoming HTTP requests and passing them through to the app (which like many node apps runs on port 3000). Reverse proxy has been handled with an nginx config file "dio" in the "sites_available" directory with a symlink "dio" in "sites_enabled" pointing to the actual file.

##  Deployment

*mid-2018: we have been skipping the `npm-run test` and the `curl` steps below*

- Pull latest version from repo. AHO note: we are pulling from the master branch of [our own AHO repo](https://github.com/apartmentsmart/dio).
- `npm install` (installs npm modules)
- `npm run build:prod` (builds static assets)
- `npm run test` (runs tests -- AHO note: this will probably fail since we have changed the codebase - app should still work)
- `pm2 startOrRestart ecosystem.json5 --env production` (restart pm2 process manager in production mode - may have to execute this command via sudo)
- `curl -X PURGE https://democracy.io/static` (purge varnish cache)

# Using pm2's command line tool

AHO deployment: Do not use `pm2 deploy` command below unless the ecosystem.json5 file has been properly configured. The initial version of this file assumes the user wishes to deploy the latest version of the app pulled from the EFF repo. Our version of the app pulls from [our own AHO repo](https://github.com/apartmentsmart/dio). Use the steps in the section above (minus the curl step) to deploy.

The deploy process above is encapsulated in the ecosystem.json5 file, and can be triggered by running:
```
pm2 deploy ecosystem.json5 production (may have to run as sudo)
```

