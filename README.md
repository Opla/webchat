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


## Theming

The webchat can be adapted to have a specific theme.<br />
You will need to enter a value for each of the following variables:

Variable name | Concerned part | Type of variable
------------ | ------------- | -------------
**font-family** | The font familly for all the webchat | *CSS **font-family** value<sup>1</sup>*
**messenger-box-header-bg-color** | The background color for the header of the webchat | *CSS **color** value<sup>2</sup>*
**messenger-box-header-text-color** | The text color in the header | *CSS **color** value<sup>2</sup>*
**from-bot-avatar** | The picture used for the bot's avatar | *CSS **background-image** value<sup>3</sup>*
**from-bot-bg-color** | The background color of the bot's message | *CSS **color** value<sup>2</sup>*
**from-bot-text-color** | The text color of the bot's message | *CSS **color** value<sup>2</sup>*
**from-bot-button-bg-color** | The background color for the buttons in the bot's message | *CSS **color** value<sup>2</sup>*
**from-bot-button-border-color** | The border color for the buttons in the bot's message | *CSS **color** value<sup>2</sup>*
**from-bot-button-text-color** | The text color for the buttons in the bot's message | *CSS **color** value<sup>2</sup>*
**display-user-avatar** | An option to display or not the avatar of the user | *Boolean*
**from-user-avatar** | The picture used for the user's avatar | *CSS **background-image** value<sup>3</sup>*
**from-user-bg-color** | The background color of the user's message | *CSS **color** value<sup>2</sup>*
**from-user-text-color** | The text color of the user's message | *CSS **color** value<sup>2</sup>*
**send-message-text-color** | The text color in the message text field | *CSS **color** value<sup>2</sup>*
**send-message-actions-color** | The color of the bar below the text field when focused | *CSS **color** value<sup>2</sup>*
**open-button-background-color** | The color of the button to display the webchat | *CSS **color** value<sup>2</sup>*
**watermark** | The picture used for the watermark | *CSS **background-image** value<sup>3</sup>*

**<sup>1</sup>Font-family**<br />
In addition  of the system fonts, here is the list of some Google web fonts availlable:
- 'Roboto', sans-serif;
- 'Montserrat', sans-serif;
- 'Source Sans Pro', sans-serif;
- 'Work Sans', sans-serif;
- 'Lato', sans-serif;
- 'Open Sans', sans-serif;
- 'Raleway', sans-serif;
- 'Ubuntu', sans-serif;
- 'Oswald', sans-serif;
- 'PT Sans', sans-serif;
- 'Fira Sans', sans-serif;
- 'Merriweather', serif;
- 'Oxygen', sans-serif;
- 'Noto Sans', sans-serif;
- 'Karla', sans-serif;
- 'Lora', serif;
- 'Frank Ruhl Libre', serif;
- 'Playfair Display', serif;
- 'Archivo', sans-serif;
- 'Spectral', serif;
- 'Fjalla One', sans-serif;
- 'Rubik', sans-serif;
- 'Cardo', serif;
- 'Cormorant', serif;

**<sup>2</sup>Color**<br />
The prefered value for colors is a **6 Digit Hex Color** (#000000 for black)

**<sup>3</sup>Background-image**<br />
Specify the path to the picture used in both avatar or watermark: *url("https://bot.opla.ai/images/default-avatar.png"); for example*<br />
You can use **.Jpg**, **.Png** or **.Svg** images.<br />
Please note that for an avatar the minimum expected size is **42px x 42px** *(if it's a bitmap file)* and it's must be a **square image**.

### Some helper images:

![Basic webchat](https://bot.opla.ai/images/webchat-theming_view-basic.jpg)

Some variations : 

![Advanced options](https://bot.opla.ai/images/webchat-theming_view-advanced.jpg)


## Contributing

Please, see the [CONTRIBUTING](CONTRIBUTING.md) file.


## Contributor Code of Conduct

Please note that this project is released with a [Contributor Code of
Conduct](http://contributor-covenant.org/). By participating in this project you
agree to abide by its terms. See [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) file.


## License

opla-webchat is released under the MIT License. See the bundled
[LICENSE](LICENSE) file for details.