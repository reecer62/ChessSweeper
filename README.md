# ChessSweeper

To run this locally, it has to be hosted on a webserver. I recommend [NGINX](https://nginx.org/en/download.html).

Steps:

1. Install NGINX.
2. Place the contents of the repo in correct location. On Windows, this is `$INSTALL_LOCATION$\html`On Ubuntu, this is `/var/www/html`. Make sure index.html is at this level, not the containing folder.
3. Start NGINX. On Windows, open a command prompt and run `$INSTALL_LOCATION\nginx.exe`. On Ubuntu, run `sudo systemctl start nginx`.
4. Open a web browser and navigate to `localhost`.
