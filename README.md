# Opla Webchat
Chat with Opla's Bots in your web page 

## Getting started

### Prerequisites

First of all, make sure you have [Node 8.x](https://nodejs.org/en/download/) and
[Yarn](https://yarnpkg.com/en/docs/install), and PHP installed.

This project requires a backend application to start. At the moment, you have to
install this [backend application](https://github.com/Opla/backend) by yourself.
In the following, we assume this backend application runs locally and is
available at: `127.0.0.1:8081`.

### Installation

1. Install the (dev) dependencies:

    ```
    $ yarn install
    ```

2. Create an application in the backend to get client_id / client_secret:

   ```
   $ curl -X POST \
        http://127.0.0.1:8081/auth/application \
        -H 'Cache-Control: no-cache' \
        -H 'Content-Type: application/json' \
        -d '{"name":"Opla Webchat","grant_type":"password","redirect_uri":"localhost","email":"bob@email.com"}'
   ```

4. Rename server/config-sample.php to server/config.php and edit it by adding client_id and client_secret:

    ```
    define('CLIENT_ID', 'client_id_here');
    define('CLIENT_SECRET', 'client_secret_here');
    ```
  
3. Start the dev environment:

    ```
    $ yarn dev
    ```

This application should be available at: http://127.0.0.1:8085/.
You need to use front to start a webchat, and put this url in front config's botsUrl


## Contributing

Please, see the [CONTRIBUTING](CONTRIBUTING.md) file.


## Contributor Code of Conduct

Please note that this project is released with a [Contributor Code of
Conduct](http://contributor-covenant.org/). By participating in this project you
agree to abide by its terms. See [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) file.


## License

opla-webchat is released under the MIT License. See the bundled
[LICENSE](LICENSE) file for details.