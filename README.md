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
✓ per guild prefix configuration  
✓ and of course, adorable shipgirl  

## Current version:
- 0.1.3 (latest) [Release](https://github.com/Weeb-Devs/Laffey/releases/tag/0.1.3) | [Change Log](https://github.com/Weeb-Devs/Laffey/blob/main/readme/changelogs/0.1.3.md) 
- 0.1.2 [Release](https://github.com/Weeb-Devs/Laffey/releases/tag/0.1.2) | [Change Log](https://github.com/Weeb-Devs/Laffey/blob/main/readme/changelogs/0.1.2.md) 
- 0.1.1 [Release](https://github.com/Weeb-Devs/Laffey/releases/tag/0.1.1) | [Change Log](https://github.com/Weeb-Devs/Laffey/blob/main/readme/changelogs/0.1.1.md) 
- 0.1.0 [Release](https://github.com/Weeb-Devs/Laffey/releases/tag/0.1.0) | [Change Log](https://github.com/Weeb-Devs/Laffey/blob/main/readme/changelogs/0.1.0.md) 

## Requirements:
### Lavalink server
You need dev lavalink version to use our filters. You can get it by clicking [Here](https://ci.fredboat.com/viewLog.html?buildId=8767&buildTypeId=Lavalink_Build&tab=artifacts&branch_Lavalink=refs%2Fheads%2Fdev) and then, click on `Lavalink.jar` files [How to setup](https://github.com/Weeb-Devs/Laffey/blob/main/readme/LAVALINK_INSTALLATION.md)  
All required OS and other for lavalink server available [here](https://github.com/freyacodes/Lavalink#requirements)

### Server for the bot to run
- nodejs v14.x.x or higher `because we're using ? method`
- discordjs v12.x.x or higher

### Data
- Discord bot's token `You should know why you need this or you won't go to this repo` [Get or create bot here](https://discord.com/developers/applications) | [How to get token](https://github.com/Weeb-Devs/Laffey/blob/main/readme/CREATE_FIRST_BOT.md)
- Mongodb URI `for prefix and auto resume feature. It won't work if you enter invalid or no URI` [MongoDB](https://account.mongodb.com/account/login)
- Your ID `for eval command. It's dangerous if eval accessible to everyone`
- Spotify client ID `for spotify support` [Click here to get](https://developer.spotify.com/dashboard/login)
- Spotify client Secret `for spotify support` [Click here to get](https://developer.spotify.com/dashboard/login)
- Ksoft API Key `additional, but you can't use lyrics if you didn't provide it` [Click here to get](https://api.ksoft.si/?ref=ksoft.si#get-started)
- Lavalink server
    - Host `url to your lavalink server`
    - Password `your lavalink's password. Default is youshallnotpass`
    - Port `port for your lavalink server. Default is 80`
    - Identifier `Name for your node. Default to its url`
    - Retry amount `retry amount when the node encounted error. Default is 3`
    - Retry delay `delay for each retry. Default is 1000 (1s)`
    - Secure `wether your node use ssl connection. Default is false`   

**Note**  
- Why use ksoft.si API and not other? Because other modules are bad and we have to provide a very specific title which is ksoft.si didn't

## Available music sources:
- youtube`*`
- bandcamp`*`
- soundcloud`*`
- twitch`*`
- vimeo`*`
- http (you can use radio for it)`*`
- spotify
- deezer
<br>  
  **Note:**  
    - `*` is depend on your lavalink's configuration

## Configuration & Starting the bot:
### With config.json
1. First, change `config.json.example` file's name into `config.json`, and fill it
```json
{
  "TOKEN": "Your bot's token",
  "PREFIX": "?",
  "OWNERS": ["Your id, can be more than 1"],
  "MONGODB_URI": "For database",
  "SPOTIFY_CLIENT_ID": "For spotify support",
  "SPOTIFY_CLIENT_SECRET": "For spotify support",
  "KSOFT_API_KEY": "For the lyrics because it's the best so far",
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
  ],
  "AUTO_RESUME_DELAY": 1500,
  "DEBUG": true,
  "LOG_USAGE": false
}
```
2. Go to your console, and type `cd "path to laffey's file"` and install all dependencies by typing `npm i`
3. You're ready to go, use `node .` or `npm start` to start the bot  
<br>  
### With .env
1. Create a `.env` file in the root directory of your project.
2. Copy the text below and paste it in .env file and change the value with required data. **You must use config.json for nodes. So it'll be like this**  
    #### .env file
    ```
    TOKEN=TOKEN_HERE
    PREFIX=?
    OWNERS=123456789,987654321
    MONGODB_URI=mongodb+srv://blabla
    SPOTIFY_CLIENT_ID=123456
    SPOTIFY_CLIENT_SECRET=ABCDEFG
    KSOFT_API_KEY=1234
    AUTO_RESUME_DELAY=2000
    DEBUG=true
    LOG_USAGE=false
    ```
    #### config.json file
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
  
    - `DEBUG` is to see more data when your bot starting and other warning
    - `LOG_USAGE` is to log all command usage by user. Default to false because it'll be annoying
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
    - play `play music from 7 music sources`   
        -aliases: p  
        -example: `?play https://www.youtube.com/playlist?list=PL0jh16Vp3NzVjEjKbZ3pV4f15Jze5EANV`  

     - forceplay `same like play, but this will force the player to play specific song`   
        -aliases: fp  
        -example: `?forceplay https://www.youtube.com/watch?v=dQw4w9WgXcQ`  
    
     - loop `toggle track/queue loop`   
        -aliases: l  
        -example: `?loop`  
    
     - lyrics `Get specific/current playing song's lyrics`   
        -aliases: ly  
        -example: `?lyrics [ song's title ]`  
      
     - volume `Set player's volume. 0-1000`   
        -aliases: v  
        -example: `?volume 1000`  
    
     - nowplaying `see current playing song`  
          -aliases: np    
          -example: `?nowplaying`  
    
   - move `Move song`  
          -aliases: -    
          -example: `?move 2` | `?move 4 3`  
    
    - queue `check all songs inside queue`  
          -aliases: q    
          -example: `?queue`  
    
   - skip `skip the song`  
          -aliases: s    
          -example: `?skip`  
       
  - skipto `skip to specific song`  
          -aliases: st, jump, jumpto    
          -example: `?skipto 3`  
    
  - join `Join a voice channel`  
          -aliases: -    
          -example: `?join`  
    
   - leave `Leave a voice channel`  
          -aliases: stop    
          -example: `?leave`  
    
   - shuffle `Shuffle queue`  
          -aliases: -    
          -example: `?shuffle`  
    
   - clear `Clear the queue`  
          -aliases: -    
          -example: `?clear`  
    
   - bassboost `Set bassboost filter for the player`  
          -aliases: bb    
          -example: `?bassboost [reset | 1 - 2000]`  
    
   - 24h `whether the bot to leave vc when there's no user or not`  
          -aliases: -    
          -example: `?24h`  
    
   - vaporwave `Set vaporwave filter for the player`  
          -aliases: -    
          -example: `?vaporwave`  
    
   - nightcore `Set nightcore filter for the player`  
          -aliases: nc    
          -example: `?nightcore`  
    
   - 8d `Set 8d filter for the player`  
          -aliases: -    
          -example: `?8d`  
    
   - speed `Set speed for the player`  
         -aliases: -    
         -example: `?speed [reset | 0-5]`
    
   - pitch `Set pitch for the player`  
         -aliases: -    
         -example: `?pitch [reset | 0-5]`
    
   - reset `Reset the filters`  
         -aliases: -    
         -example: `?reset`
          
   - filters `Get all filters status`  
         -aliases: -    
         -example: `?filters`
      
   - remove `Remove song from queue`  
          -aliases: -    
          -example: `?remove 3`  
    
   - previous `Play song that played previously`  
          -aliases: pr    
          -example: `?previous`  
    
   - resume `Resume the player`  
          -aliases: r    
          -example: `?resume`  
    
   - pause `Pause the player`  
          -aliases: -    
          -example: `?pause`  


- config
  - prefix `get, set, or reset prefix on guild`  
      -aliases: -    
      -example: `?prefix set !` | `?prefix reset` | `?prefix get` 


- misc
  - ping `get bot's ping`  
      -aliases: -    
      -example: `?ping`  

  - help `Show list of available commands`  
      -aliases: h    
      -example: `?help play` 

  - eval `to evaluate code`  
      -aliases: -    
      -example: `?eval message.channel.send('hello')` 

  - about `Give information about this project`  
      -aliases: -    
      -example: `?about` 

  - stats `Give bot's stats`  
      -aliases: -    
      -example: `?stats adv` 

  - node `Give lavalink's stats`  
      -aliases: -    
      -example: `?node` 

  - invite `Invite your bot to another guild`  
      -aliases: -    
      -example: `?invite` 

## Description & About
Created at: Friday, 2 April 2021  
Published at: Sunday, 11 April 2021  
  [Laffey](https://github.com/Weeb-Devs/Laffey) is [Weeb-Devs](https://github.com/Weeb-Devs) 's first project. Was created by our first member aka owner, Takiyo. He really wants to make his first open source project ever. Because he wants more for coding experience. In this project, he was challenged to make project with less bugs. Hope you enjoy using Laffey!
