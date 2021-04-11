# Lavalink Installation
### Here, i will give you tutorial how to set up lavalink server on localhost or VPS. I'll do it on localhost, most of the steps are same for VPS.

## Step by Step
1. Go to [Lavalink's Github](https://github.com/Frederikam/Lavalink) and change the branch into dev
<img align="center" width="80%" height="80%" src="https://takiyo.is-ne.at/GxAzK7.png">   
<br>
2. Scroll down and click highlighted ` the CI server ` text.
<img align="center" width="80%" height="80%" src="https://takiyo.is-ne.at/ABntLg.png">   
<br>
3. If you're asked to login, just search `login by guest` button and click it.
4. Go to lavalink path to see all available branch
<img align="center" width="80%" height="80%" src="https://takiyo.is-ne.at/Ufrbc8.png">   
<br>
5. Click on `refs/heads/dev` in build  
<img align="center" width="80%" height="80%" src="https://takiyo.is-ne.at/pwei28.png">   
<br>
6. Search for the latest build.  
<img align="center" width="80%" height="80%" src="https://takiyo.is-ne.at/yhpgiZ.png">   
<br>
7. Click on artifacts  
<img align="center" width="80%" height="80%" src="https://takiyo.is-ne.at/ujVzw8.png">   
<br>
8. Click on `Lavalink.jar` file and your download will start automatically  
<img align="center" width="80%" height="80%" src="https://takiyo.is-ne.at/1s0H8A.png">   
<br>
9. Now, create folder and insert `Lavalink.jar` inside the folder  
<img align="center" width="80%" height="80%" src="https://takiyo.is-ne.at/6ALMEF.png">   
<br>
10. Create a file with `application.yml` by right click, new, and text document, go here to copy the configuration [application.yml](https://github.com/Frederikam/Lavalink/blob/master/LavalinkServer/application.yml.example), and paste it on `application.yml` that you just created. If you don't have [IDE](https://en.wikipedia.org/wiki/Integrated_development_environment) like Visual Studio Code, you might can't open `application.yml` because no apps support it. You can download the `application.yml.example` that is in the link that i gave you, and then rename it from `application.yml.example` to `application.yml` and it will look like this  
<img align="center" width="80%" height="80%" src="https://takiyo.is-ne.at/WCQNSY.png">   
<br>
11. Now open your file into terminal, by typing `cd "path to lavalink's file with yml"` in command prompt or your lovely CMD, type `java -jar Lavalink.jar` and boom, lavalink is now started on `localhost` with `2333` port and `youshallnotpass` password. If you're using VPS, your lavalink will start in your domain or IP with the same port and password  
<img align="center" width="40%" height="40%" src="https://takiyo.is-ne.at/hxHEsp.png">   
<br>
<img align="center" width="100%" height="100%" src="https://takiyo.is-ne.at/4PprZZ.jpeg">   
<br>
12. Now, your lavalink server started and you can connect your bot to the server with available [Client](https://github.com/Frederikam/Lavalink#client-libraries). Here's the example node data to connect it with [Laffey](https://github.com/Weeb-Devs/Laffey).
```
       nodes: [
            {
                identifier: 'QT Lavalink',
                host: 'localhost',
                password: 'youshallnotpass',
                port: 2333,
                retryDelay: 1000,
                retryAmount: 7,
            },
        ],
```
<img align="center" width="80%" height="80%" src="https://takiyo.is-ne.at/05QoOE.png">  

### Found something wrong? Feel free to make a pull request or submitting an issue from this tutorial. Thank you