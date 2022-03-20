# Registering your slash commands
1. Get your bot's application ID, aka User ID by right clicking, copy ID
![image](https://i.imgur.com/NX396C6.gif)
2. Open your command prompt, cd to Laffey's directory, and do `npm i`
3. Rename `config.json.example` into `config.json` and fill `TOKEN` with your bot's token
4. Type `npm run slash:register` to start register process
![image](https://i.imgur.com/NSAyyn5.png)
5. Copy and paste your bot's ID to the first question
![WindowsTerminal_cIDQuABXJp](https://user-images.githubusercontent.com/60313514/159162042-0ff02794-ea07-481b-a824-9aa5a282cf3f.png)
6. Next, you will be asked to choose 1 or 2, choose 1 if you want to register the commands global (all around server your bot in), or guild (to specific guild)
![WindowsTerminal_mRqi32yf2N](https://user-images.githubusercontent.com/60313514/159162096-0ba5be93-5d94-44b9-b946-af6d3c8107af.png)

## Global
6.1 Answer with `1`, and you're done when you get `Refreshed GLOBAL slash command`. Just wait a few minutes for discord to update it all around guilds
![WindowsTerminal_i6Vm5NF3rx](https://user-images.githubusercontent.com/60313514/159162151-edc92e3e-6eb7-4cfa-a059-b9d01a2c932f.png)


## Guild
6.2 Answer with `2`
![WindowsTerminal_1MrZzL0keJ](https://user-images.githubusercontent.com/60313514/159162211-42ddd37f-0cd6-4332-af52-ec9ac8f8f9f6.png)   
6.2.1 You will be prompted to give your guild ID. Copy it by right click, copy ID    
![image](https://i.imgur.com/koXzuZW.gif)    
6.2.2 Paste it, and if you get `Refreshed GUILD slash command`, your slash commands has been registered to the guild instantly.
![WindowsTerminal_Ov1Moj2sJU](https://user-images.githubusercontent.com/60313514/159162391-10a4d0b8-1260-45c9-b688-738afc7d7906.png)


# FAQ
```
Q: Why I got DiscordAPIError[50001]: Missing Access error?
A: You need to re-invite the bot with %20applications.commands added in the scope
```
