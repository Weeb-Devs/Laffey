# Configuration Guide

### In this guide, i will explain each configuration option available in Laffey and how to set them up correctly.

## Getting Started

1. Rename `config.json.example` to `config.json` in the root directory of the project.
2. Open `config.json` with your favorite text editor.
3. Follow the sections below to fill in each configuration option.

---

## Client Configuration

The `client` section contains settings related to your Discord bot.

```json
"client": {
  "token": "",
  "prefix": "!",
  "id": "BOT-ID",
  "statuses": [
    "Status 1",
    "Status 2",
    "Status 3"
  ]
}
```

### Fields:

- **token** (required): Your Discord bot token. Get this from
  the [Discord Developer Portal](https://discord.com/developers/applications) under the Bot section. Click `Reset Token`
  and copy it.

- **prefix** (optional): The prefix for text-based commands. Default is `!`. You can change this to any character or
  string you prefer (e.g., `$`, `>>`, `cmd!`). Remove it to disable message commands

- **id** (required): Your bot's application ID (also called User ID). Get this from
  the [Discord Developer Portal](https://discord.com/developers/applications) by copying your bot's ID from the General
  Information section.

- **statuses** (optional): An array of rotating statuses that your bot will display. The bot will cycle through these
  statuses every few seconds. Remove if you want to use the default status.

---

## Genius Configuration

The `genius` section is for integrating lyrics support via Genius API.

```json
"genius": {
  "api_key": "GENIUS-API-KEY"
}
```

### Fields:

- **api_key** (optional): Your Genius API key for fetching song lyrics. Lyrics will continue to work if you don't
  provide
  one

---

## Slash Commands Configuration

The `slash` section controls slash command registration behavior.

```json
"slash": {
  "guild_id": "GUILD-ID",
  "register": true
}
```

### Fields:

- **guild_id** (conditional): The guild (server) ID where you want to register guild-only slash commands. Only needed if
  you plan to register commands to a specific guild. Leave empty for global registration. You can get your guild ID by
  right-clicking on the guild name and selecting `Copy Server ID`.

- **register** (optional): Set to `true` if you want to automatically register slash commands on startup. Set to `true`
  only on the first run, then set to `false`.

---

## Owners Configuration

The `owners` section specifies which users have owner/admin privileges.

```json
"owners": [
  "OWNER-ID-1",
  "OWNER-ID-2"
]
```

### Fields:

- **owners** (optional): An array of Discord user IDs who will have owner privileges (e.g., access to eval commands).
  You can add multiple owner IDs. Get your user ID by right-clicking on your name and selecting `Copy User ID`.

---

## Database Configuration

The `database` section manages how Laffey stores data.

```json
"database": {
  "type": "sqlite",
  "sqlite": {
    "path": "./laffey.db"
  },
  "postgres": {
    "host": "localhost",
    "port": 5432,
    "user": "USER",
    "password": "PASSWORD",
    "database": "DATABASE"
  }
}
```

### Fields:

- **type** (required): The database engine to use. Options are:
    - `sqlite` (default, recommended for testing) - No setup required, uses a local file
    - `postgres` - PostgreSQL database server
    - ~~`mysql` - MySQL/MariaDB database server~~ (soon)

### SQLite Configuration:

- **path**: The file path where the SQLite database will be stored. Default is `./laffey.db`.

### PostgreSQL Configuration:

- **host**: The hostname or IP address of your PostgreSQL server (e.g., `localhost`, `db.example.com`)
- **port**: The port PostgreSQL is running on (default: `5432`)
- **user**: Your PostgreSQL username
- **password**: Your PostgreSQL password
- **database**: The name of the database to use

[//]: # (### MySQL Configuration:)

[//]: # ()

[//]: # (- **host**: The hostname or IP address of your MySQL server)

[//]: # (- **port**: The port MySQL is running on &#40;default: `3306`, but example shows `8334`&#41;)

[//]: # (- **user**: Your MySQL username)

[//]: # (- **password**: Your MySQL password)

[//]: # (- **database**: The name of the database to use)

---

## Embed Configuration

The `embed` section controls the appearance of Discord embeds (rich messages).

```json
"embed": {
  "colors": {
    "default": "#6b92f3",
    "success": "#43b581",
    "error": "#f87171",
    "warning": "#fbbf24"
  },
  "footer": {
    "text": "",
    "icon_url": ""
  }
}
```

### Fields:

- **colors**: Color codes (in hex format) for different embed types:
    - **default**: Used for general messages (default: `#6b92f3` - blue)
    - **success**: Used for successful operations (default: `#43b581` - green)
    - **error**: Used for error messages (default: `#f87171` - red)
    - **warning**: Used for warning messages (default: `#fbbf24` - yellow)

- **footer**:
    - **text**: Custom footer text that appears on embeds. Leave empty for no footer text.
    - **icon_url**: URL to an image that appears in the footer. Leave empty for no footer icon.

---

## Player Configuration

The `player` section configures the music player and Lavalink nodes.

```json
"player": {
  "embed_mode": "edit",
  "default_search": "",
  "nodes": [
    {
      "name": "NAME",
      "url": "HOST:PORT",
      "auth": "AUTH"
    }
  ]
}
```

### Fields:

- **embed_mode** (optional): How the now-playing embed behaves:
    - `edit` (default) – The bot edits the same message as the song changes. Will re-send if the message is deleted.
    - `send` - The bot sends a new message for each song

- **default_search** (optional): The search provider to use when users search for tracks. This depends on your Lavalink setup. Common examples:
    - `dzsearch:` - Use Deezer as search provider (lavasrc)
    - `ytmsearch:` - Use YouTube Music as search provider (lavasrc)
    - Leave empty to use Kazagumo's default provider

- **nodes** (required): An array of Lavalink server nodes. Each node needs:
    - **name**: A friendly name for your node (e.g., `Main Node`, `EU Node`)
    - **url**: The address and port of your Lavalink server (format: `HOST:PORT`, e.g., `localhost:2333` or
      `123.45.67.89:2333`)
    - **auth**: The password you set in your Lavalink server's `application.yml` file

### Note:

You must have at least one Lavalink node configured for the music player to work. For instructions on setting up
Lavalink, see [LAVALINK_INSTALLATION.md](LAVALINK_INSTALLATION.md).

---

## Full Configuration Example

Here's a complete example configuration:

```json
{
  "client": {
    "token": "YOUR-BOT-TOKEN-HERE",
    "prefix": "!",
    "id": "YOUR-BOT-ID-HERE",
    "statuses": [
      "halo everyone!",
      "with discord.js v14",
      "with TypeScript"
    ]
  },
  "genius": {
    "api_key": "YOUR-GENIUS-API-KEY"
  },
  "slash": {
    "guild_id": "",
    "register": true
  },
  "owners": [
    "YOUR-USER-ID"
  ],
  "database": {
    "type": "sqlite",
    "sqlite": {
      "path": "./laffey.db"
    },
    "postgres": {
      "host": "localhost",
      "port": 5432,
      "user": "laffey",
      "password": "secure-password",
      "database": "laffey"
    },
    "mysql": {
      "host": "localhost",
      "port": 3306,
      "user": "laffey",
      "password": "secure-password",
      "database": "laffey"
    }
  },
  "embed": {
    "colors": {
      "default": "#6b92f3",
      "success": "#43b581",
      "error": "#f87171",
      "warning": "#fbbf24"
    },
    "footer": {
      "text": "Powered by Laffey",
      "icon_url": ""
    }
  },
  "player": {
    "embed_mode": "edit",
    "default_search": "",
    "nodes": [
      {
        "name": "Main",
        "url": "localhost:2333",
        "auth": "helloworld"
      }
    ]
  }
}
```

---

## Troubleshooting

### Bot won't start

- Check that your `token` and `id` are correct
- Ensure the `config.json` file is valid JSON (no trailing commas, proper syntax)

### Music player not working

- Verify you have at least one Lavalink node configured
- Check that the node `url` and `auth` are correct
- Make sure the Lavalink server is running and accessible

### Slash commands not appearing

- Set `"register": true` and restart the bot to register commands
- Ensure your bot has the `applications.commands` scope in Discord Developer Portal
- Make sure your bot has permission to create commands in the guilds

### Database connection errors

- Double-check your database credentials (host, port, user, password, database name)
- Ensure your database server is running and accessible
- For SQLite, verify the file path is correct and writable

---

### Found something wrong? Feel free to make a pull request or submitting an issue from this guide. Thank you

