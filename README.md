# TbdDiscordBot

This is a Discord bot created by Thien Binh Dinh. It is primary for League Of Legends players.

The bot is still in development so no permanent RIOT token was provided.
# Functionality
* The bot will show the info of a player
* Look up the last 5 games of the player

# Usage

## Add this bot to your server:
Follow this link: 
```
https://discord.com/api/oauth2/authorize?client_id=843402889598468136&permissions=0&scope=bot
```

## Run the bot on your own host:
### Run the bot:
```
npm run start
```
### Token
To run the code first you have to install dotenv
``` 
npm install dotenv -s 
```
Then create .env file and enter the token follow this
#### Example
```
BOT_TOKEN=[your Discord bot token here]
RIOT_TOKEN=[your Riot api token here]
```

# User commands
* !find [playername] to show the info of a player with rank, division, level and icon.
* !match [playername] show history of the last 10 games of player.


# Future functionality
* Send message when the user go up or down a division/rank

# Software used
* Nodejs
* Discord.js
* RIOT API

# LICENSE
Copyright (c) 2021 ThienBinhDinh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.