# Laffey

#### An adorable lavalink discord music bot that has a lot of features inside it.

![laffey](https://i.imgur.com/P8Hd8LI_d.webp?maxwidth=640&shape=thumb&fidelity=medium)
> © Azur Lane | First Project of [Weeb-Devs](https://www.github.com/Weeb-Devs)

## Features:

✓ High quality  
✓ Support filters  
✓ Auto resume  
✓ Stable  
✓ Suport 8 music sources  
✓ Feature-rich  
✓ Full slash commands  
✓ and of course, adorable shipgirl

## Current version:

- 2.0.0-sd (latest) [Release](https://github.com/Weeb-Devs/Laffey/releases/tag/2.0.0)
  | No change log _yet_
- 1.0.0 **M** [Release](https://github.com/Weeb-Devs/Laffey/releases/tag/1.0.0)
  | [Change Log](https://github.com/Weeb-Devs/Laffey/blob/main/readme/changelogs/1.0.0.md)
- 0.1.5 [Release](https://github.com/Weeb-Devs/Laffey/releases/tag/0.1.5)
  | [Change Log](https://github.com/Weeb-Devs/Laffey/blob/main/readme/changelogs/0.1.5.md)
- 0.1.4 [Release](https://github.com/Weeb-Devs/Laffey/releases/tag/0.1.4)
  | [Change Log](https://github.com/Weeb-Devs/Laffey/blob/main/readme/changelogs/0.1.4.md)
- 0.1.3 [Release](https://github.com/Weeb-Devs/Laffey/releases/tag/0.1.3)
  | [Change Log](https://github.com/Weeb-Devs/Laffey/blob/main/readme/changelogs/0.1.3.md)
- 0.1.2 [Release](https://github.com/Weeb-Devs/Laffey/releases/tag/0.1.2)
  | [Change Log](https://github.com/Weeb-Devs/Laffey/blob/main/readme/changelogs/0.1.2.md)
- 0.1.1 [Release](https://github.com/Weeb-Devs/Laffey/releases/tag/0.1.1)
  | [Change Log](https://github.com/Weeb-Devs/Laffey/blob/main/readme/changelogs/0.1.1.md)
- 0.1.0 [Release](https://github.com/Weeb-Devs/Laffey/releases/tag/0.1.0)
  | [Change Log](https://github.com/Weeb-Devs/Laffey/blob/main/readme/changelogs/0.1.0.md)
  
## Registering your slash commands
Read [this](https://github.com/Weeb-Devs/Laffey/blob/main/readme/REGISTER_SLASH.md) for more information
## Requirements:

### Lavalink server

You need dev lavalink version to use our filters. You can get it by
clicking [Here](https://ci.fredboat.com/viewLog.html?buildId=8767&buildTypeId=Lavalink_Build&tab=artifacts&branch_Lavalink=refs%2Fheads%2Fdev)
and then, click on `Lavalink.jar`
files [How to setup](https://github.com/Weeb-Devs/Laffey/blob/main/readme/LAVALINK_INSTALLATION.md)  
All required OS and other for lavalink server available [here](https://github.com/freyacodes/Lavalink#requirements)

### Server for the bot to run

- ⚠️nodejs v16.9 or newer⚠️
- discordjs v14

### Data

- Discord bot's
  token `You should know why you need this` [Get or create bot here](https://discord.com/developers/applications)
  | [How to get your bot's token](https://github.com/Weeb-Devs/Laffey/blob/main/readme/CREATE_FIRST_BOT.md)
- Mongodb
  URI `for prefix and auto resume feature. It won't work if you enter an invalid URI` [MongoDB](https://account.mongodb.com/account/login)
- Your ID `for eval command. please note that it's dangerous if eval is accessible to everyone`
- Ksoft API
  Key `not required, depends on your chosen lyrics engine` [Click here to get](https://api.ksoft.si/?ref=ksoft.si#get-started)
- Genius API Key `not required, depends on your chosen lyrics engine` [Click here to get](http://genius.com/api-clients)
- Lavalink server
    - Host `url to your lavalink server`
    - Password `your lavalink's password. Defaults to youshallnotpass`
    - Port `port for your lavalink server. Defaults to 80`
    - Identifier `Name for your node. Defaults to it's url`
    - Retry amount `retry amount when the node encountered an error. Defaults to 3`
    - Retry delay `delay for each retry. Defaults to 1000 ms`
    - Secure `wether your node uses an ssl connection. Defaults to false`

## Available music sources:

- youtube`*`
- bandcamp`*`
- soundcloud`*`
- twitch`*`
- vimeo`*`
- http (you can use radio for it)`*`
- spotify`*`
- deezer`*`

  **Note:**
    - `*` depends on your lavalink's configuration

## Configuration & Starting the bot:

### With config.json

1. First, change `config.json.example`'s name into `config.json`, and fill it with the following;

```json
{
  "TOKEN": "Your bot's token",
  "PREFIX": "?",
  "OWNERS": [
    "Your id, can be more than 1"
  ],
  "MONGODB_URI": "For database",
  "KSOFT_API_KEY": "For the lyrics. It depend on your choice",
  "GENIUS_API_KEY": "For the lyrics. It depend on your choice",
  "LYRICS_ENGINE": "There are 3 options. ksoft ; genius ; google . Google doesn't need any API",
  "NODES": [
    {
      "HOST": "Your node's host",
      "PASSWORD": "Your node's password",
      "PORT": 80,
      "IDENTIFIER": "This is node's identifier, it's all up to you",
      "RETRY_AMOUNT": 3,
      "RETRY_DELAY": 1000,
      "SECURE": false
    }
  ],
  "AUTO_RESUME_DELAY": 1500,
  "DEBUG": true,
  "LOG_USAGE": false
}
```

2. Go to your console, and type `cd "path to laffey's file"` and install all dependencies by typing `npm i`
3. You're ready to go, use `node .` or `npm start` to start the bot

### With .env <br/>

1. Create a `.env` file in the root directory of your project.<br/>
2. Copy the text below and paste it in .env file and change the value with required data. ⚠️**NODES in .env must be a
   STRINGIFIED array of node objects, or you can use normal array for nodes in config.json**⚠️<br/>
   #### .env file
    ```
    TOKEN=TOKEN_HERE
    PREFIX=?
    OWNERS=123456789,987654321
    MONGODB_URI=mongodb+srv://blabla
    KSOFT_API_KEY=1234
    GENIUS_API_KEY=1234
    LYRICS_ENGINE=google
    AUTO_RESUME_DELAY=2000
    NODES=[{"HOST":"Your node's host","PASSWORD":"Your node's password","PORT":80,"IDENTIFIER":"This node's identifier, it's up to you","RETRY_AMOUNT":3,"RETRY_DELAY":1000,"SECURE":false}]
    DEBUG=true
    LOG_USAGE=false
    ```  
   #### config.json file (you don't need this if you already provided NODES in .env)
    ```json
    {
      "NODES": [
        {
          "HOST": "Your node's host",
          "PASSWORD": "Your node's password",
          "PORT": 80,
          "IDENTIFIER": "This node's identifier, it's up to you",
          "RETRY_AMOUNT": 3,
          "RETRY_DELAY": 1000,
          "SECURE": false
        }
      ]
    }
    ```
3. Go to your console, and type `cd "path to laffey's file"` and install all dependencies by typing `npm i`
4. You're ready to go, use `node .` or `npm start` to start the bot  
   <br>  
   **Note:**

    - `DEBUG` is to see more info when your bot is starting or when a warning was thrown
    - `LOG_USAGE` is to log all command usage by user. Defaults to false because it'll be annoying
    - `AUTO_RESUME_DELAY` is how many ms do you want to add a delay between guild on auto resume
      <br>
      <br>

## Screenshots

<img align="center" width="60%" src="https://i.imgur.com/i3HM69M.png">   
   <br>
   <br><br>
  <img align="center" width="60%" src="https://takiyo.is-ne.at/l11Dyy.png">

## Commands

- music
    - play `plays a music from 7 different music sources`   
      -example: `/play https://www.youtube.com/playlist?list=PL0jh16Vp3NzVjEjKbZ3pV4f15Jze5EANV`

    - forceplay `same like play, but this will force the player to play a specific song`   
      -example: `/forceplay https://www.youtube.com/watch?v=dQw4w9WgXcQ`

    - loop `toggle track/queue loop`   
      -example: `/loop`

    - lyrics `Get specific/current playing song's lyrics`   
      -example: `/lyrics [ song's title ]`

    - volume `Set player's volume. 0-1000`   
      -example: `/volume 1000`

    - nowplaying `see the song currently playing`  
      -example: `/nowplaying`

    - move `Move song`  
      -example: `/move 2` | `/move 4 3`

    - queue `check all songs inside queue`  
      -example: `/queue`

    - skip `skip the song`  
      -example: `/skip`

    - skipto `skip to a specific song`  
      -example: `/skipto 3`

    - join `Join a voice channel`  
      -example: `/join`

    - leave `Leave a voice channel`  
      -example: `/leave`

    - shuffle `Shuffle queue`  
      -example: `/shuffle`

    - search `search song`  
      -example: `/search never gonna give you up`

    - clear `Clear the queue`  
      -example: `/clear`

    - bassboost `Set bassboost filter for the player`  
      -example: `/bassboost 1 - 200`

    - 24h `whether the bot should leave vc when there's no user or not`  
      -example: `/24h`

    - vaporwave `Set vaporwave filter for the player`  
      -example: `/vaporwave`

    - nightcore `Set nightcore filter for the player`  
      -example: `/nightcore`

    - 8d `Set 8d filter for the player`  
      -example: `/8d`

    - speed `Set speed for the player`  
      -example: `/speed 0-5`

    - pitch `Set pitch for the player`  
      -example: `/pitch 0-5`

    - reset `Reset the filters`  
      -example: `/reset`

    - filters `Get all filters status`  
      -example: `/filters`

    - remove `Remove song from queue`  
      -example: `/remove 3`

    - previous `Play previously played song`  
      -example: `/previous`

    - resume `Resume the player`  
      -example: `/resume`

    - pause `Pause the player`  
      -example: `/pause`


- misc
    - ping `get bot's ping`  
      -example: `/ping`

    - help `Show list of available commands`  
      -example: `/help`

    - eval `to evaluate code`  
      -example: `/eval ctx.channel.send('hello')`

    - invite `Invite your bot to another guild`  
      -example: `/invite`

## Description & About

Created at: Friday, 2 April 2021  
Published at: Sunday, 11 April 2021  
[Laffey](https://github.com/Weeb-Devs/Laffey) is [Weeb-Devs](https://github.com/Weeb-Devs) 's first project. It was created
by our first member aka owner, Takiyo. He really wants to make his first open source project ever. Because he wants more coding experience. In this project, he was challenged to make a project with less bugs. Hope you enjoy using Laffey!
