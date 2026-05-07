# Environment Variables Configuration Guide

### In this guide, i will explain how to configure Laffey using environment variables in Docker.

## Overview

Laffey supports configuring all settings through environment variables. This is the recommended approach for Docker
deployments.

**Priority Order:**

1. Environment variables (highest priority)
2. config.json file
3. Default values (lowest priority)

This means environment variables will always override config.json values if both are set.

---

## Quick Reference: Docker Compose Files

Laffey includes 4 pre-configured docker-compose files. **Choose one to get started:**

| File                              | Database   | Best For                                     |
|-----------------------------------|------------|----------------------------------------------|
| **`docker-compose.env.yml`**      | SQLite     | **Quickest start** - Only edit this one file |
| `docker-compose.yml`              | SQLite     | Using config.json instead                    |
| `docker-compose.postgres.env.yml` | PostgreSQL | Production with env vars                     |
| `docker-compose.postgres.yml`     | PostgreSQL | Production with config.json                  |

**For beginners:** Use `docker-compose.env.yml` - edit it and run `docker-compose -f docker-compose.env.yml up -d`

**For detailed setup info:** See [DOCKER_SETUP.md](DOCKER_SETUP.md)

---

## Setting Up Environment Variables in Docker

### Option 1: Using docker-compose with direct environment section (Recommended)

Edit your `docker-compose.yml` and set all config in the `environment:` section:

```yaml
version: '3.8'

services:
  laffey:
    image: ghcr.io/weeb-devs/laffey:main
    container_name: laffey-bot
    restart: unless-stopped
    volumes:
      - laffey-db:/app/data
    environment:
      NODE_ENV: production
      # Client
      client.token: "YOUR-BOT-TOKEN"
      client.prefix: "!"
      client.id: "YOUR-BOT-ID"
      client.statuses: '["status 1", "status 2"]'
      # Genius
      genius.api_key: "YOUR-GENIUS-KEY"
      # Slash Commands
      slash.register: "true"
      slash.guild_id: ""
      # Owners
      owners: '["USER-ID-1", "USER-ID-2"]'
      # Database
      database.type: sqlite
      database.sqlite.path: /app/data/laffey.db
      # Embed
      embed.colors.default: "#6b92f3"
      embed.colors.success: "#43b581"
      embed.colors.error: "#f87171"
      embed.colors.warning: "#fbbf24"
      embed.footer.text: ""
      embed.footer.icon_url: ""
      # Player
      player.embed_mode: edit
      player.nodes: '[{"name": "Main", "url": "lavalink-host:2333", "auth": "helloworld"}]'

volumes:
  laffey-db:
```

Then start:

```bash
docker-compose up -d
```

### Option 2: Using docker-compose with .env file

Create a `.env` file in the same directory as `docker-compose.yml`:

```env
# Client
CLIENT_TOKEN=YOUR-BOT-TOKEN
CLIENT_PREFIX=!
CLIENT_ID=YOUR-BOT-ID
CLIENT_STATUSES=["status 1", "status 2"]

# Genius
GENIUS_API_KEY=YOUR-GENIUS-KEY

# Slash Commands
SLASH_REGISTER=true
SLASH_GUILD_ID=

# Owners
OWNERS=["USER-ID-1", "USER-ID-2"]

# Database
DATABASE_TYPE=sqlite
DATABASE_SQLITE_PATH=/app/data/laffey.db

# Embed
EMBED_COLORS_DEFAULT=#6b92f3
EMBED_COLORS_SUCCESS=#43b581
EMBED_COLORS_ERROR=#f87171
EMBED_COLORS_WARNING=#fbbf24
EMBED_FOOTER_TEXT=
EMBED_FOOTER_ICON_URL=

# Player
PLAYER_EMBED_MODE=edit
PLAYER_NODES=[{"name": "Main", "url": "lavalink-host:2333", "auth": "helloworld"}]
```

Then reference it in `docker-compose.yml`:

```yaml
version: '3.8'

services:
  laffey:
    image: ghcr.io/weeb-devs/laffey:main
    container_name: laffey-bot
    restart: unless-stopped
    volumes:
      - laffey-db:/app/data
    environment:
      NODE_ENV: production
      client.token: ${CLIENT_TOKEN}
      client.prefix: ${CLIENT_PREFIX}
      client.id: ${CLIENT_ID}
      client.statuses: ${CLIENT_STATUSES}
      genius.api_key: ${GENIUS_API_KEY}
      slash.register: ${SLASH_REGISTER}
      slash.guild_id: ${SLASH_GUILD_ID}
      owners: ${OWNERS}
      database.type: ${DATABASE_TYPE}
      database.sqlite.path: ${DATABASE_SQLITE_PATH}
      embed.colors.default: ${EMBED_COLORS_DEFAULT}
      embed.colors.success: ${EMBED_COLORS_SUCCESS}
      embed.colors.error: ${EMBED_COLORS_ERROR}
      embed.colors.warning: ${EMBED_COLORS_WARNING}
      embed.footer.text: ${EMBED_FOOTER_TEXT}
      embed.footer.icon_url: ${EMBED_FOOTER_ICON_URL}
      player.embed_mode: ${PLAYER_EMBED_MODE}
      player.nodes: ${PLAYER_NODES}

volumes:
  laffey-db:
```

Start with:

```bash
docker-compose up -d
```

### Option 3: Using docker run with -e flags

```bash
docker run -d \
  --name laffey-bot \
  -e client.token="YOUR-BOT-TOKEN" \
  -e client.id="YOUR-BOT-ID" \
  -e client.prefix="!" \
  -e database.type="sqlite" \
  -e database.sqlite.path="/app/data/laffey.db" \
  -v laffey-db:/app/data \
  ghcr.io/weeb-devs/laffey:main
```

---

## Environment Variable Reference

### Client Configuration

| Variable          | Type   | Default | Example                              |
|-------------------|--------|---------|--------------------------------------|
| `client.token`    | string | -       | `ODI0MjI5NjQ1MTc1MzU3NDgw.GOjNEr...` |
| `client.prefix`   | string | `!`     | `!` or `$` or `>>`                   |
| `client.id`       | string | -       | `824229645175357480`                 |
| `client.statuses` | array  | `[]`    | `["status 1", "status 2"]`           |

**Note:** `client.statuses` must be valid stringified JSON format.

### Genius Lyrics

| Variable         | Type   | Default | Example                       |
|------------------|--------|---------|-------------------------------|
| `genius.api_key` | string | -       | `sBetiXnhXdGmTL9mSQxBadG5...` |

### Slash Commands

| Variable         | Type    | Default | Example           |
|------------------|---------|---------|-------------------|
| `slash.register` | boolean | `false` | `true` or `false` |
| `slash.guild_id` | string  | -       | `123456789`       |

**Note:** `slash.register` should be set to `"true"` or `"false"` as string, it will be converted to boolean.

### Owners

| Variable | Type  | Default | Example                      |
|----------|-------|---------|------------------------------|
| `owners` | array | `[]`    | `["USER-ID-1", "USER-ID-2"]` |

**Note:** Must be valid JSON array format.

### Database Configuration

#### SQLite

| Variable               | Type   | Default       | Example               |
|------------------------|--------|---------------|-----------------------|
| `database.type`        | string | `sqlite`      | `sqlite`              |
| `database.sqlite.path` | string | `./laffey.db` | `/app/data/laffey.db` |

#### PostgreSQL

| Variable                     | Type   | Default     | Example                         |
|------------------------------|--------|-------------|---------------------------------|
| `database.type`              | string | -           | `postgres`                      |
| `database.postgres.host`     | string | `localhost` | `localhost` or `db.example.com` |
| `database.postgres.port`     | number | `5432`      | `5432`                          |
| `database.postgres.user`     | string | -           | `laffey`                        |
| `database.postgres.password` | string | -           | `secure-password`               |
| `database.postgres.database` | string | -           | `laffey`                        |

[//]: # (#### MySQL)

[//]: # ()

[//]: # (| Variable                  | Type   | Default     | Example                         |)

[//]: # (|---------------------------|--------|-------------|---------------------------------|)

[//]: # (| `database.type`           | string | -           | `mysql`                         |)

[//]: # (| `database.mysql.host`     | string | `localhost` | `localhost` or `db.example.com` |)

[//]: # (| `database.mysql.port`     | number | `3306`      | `3306`                          |)

[//]: # (| `database.mysql.user`     | string | -           | `laffey`                        |)

[//]: # (| `database.mysql.password` | string | -           | `secure-password`               |)

[//]: # (| `database.mysql.database` | string | -           | `laffey`                        |)

### Embed Configuration

| Variable                | Type         | Default   | Example                        |
|-------------------------|--------------|-----------|--------------------------------|
| `embed.colors.default`  | string (hex) | `#6b92f3` | `#6b92f3`                      |
| `embed.colors.success`  | string (hex) | `#43b581` | `#43b581`                      |
| `embed.colors.error`    | string (hex) | `#f87171` | `#f87171`                      |
| `embed.colors.warning`  | string (hex) | `#fbbf24` | `#fbbf24`                      |
| `embed.footer.text`     | string       | -         | `Powered by Laffey`            |
| `embed.footer.icon_url` | string       | -         | `https://example.com/icon.png` |

### Player Configuration

| Variable                | Type   | Default   | Example                                                           |
|-------------------------|--------|-----------|-------------------------------------------------------------------|
| `player.embed_mode`     | string | `replace` | `edit` or `replace`                                               |
| `player.default_search` | string | -         | `dzsearch:` or `ytmsearch:`                                       |
| `player.nodes`          | array  | -         | `[{"name": "Main", "url": "localhost:2333", "auth": "password"}]` |

**Note:** `player.nodes` must be valid stringified JSON format with the structure shown above.

**player.default_search** - The search provider to use when users search for tracks. This depends on your Lavalink
setup:

- `dzsearch:` - Use Deezer as search provider (lavasrc)
- `ytmsearch:` - Use YouTube Music as search provider (lavasrc)
- Leave empty to use Lavalink's default provider

---

## Type Conversion Rules

Laffey automatically converts environment variable strings to the correct types:

### Booleans

```
"true" → true
"false" → false
(case-insensitive)
```

### Numbers

```
"5432" → 5432
"3.14" → 3.14
"-1" → -1
```

### Arrays/Objects

Environment variables that should be arrays or objects must be valid JSON:

```
'["item1", "item2"]' → array
'{"key": "value"}' → object
```

### Strings

Everything else is treated as a string.

---

## Examples

### Complete SQLite Setup

```yaml
version: '3.8'

services:
  laffey:
    image: ghcr.io/weeb-devs/laffey:main
    container_name: laffey-bot
    restart: unless-stopped
    volumes:
      - laffey-db:/app/data
    environment:
      NODE_ENV: production
      client.token: "YOUR-BOT-TOKEN"
      client.prefix: "!"
      client.id: "YOUR-BOT-ID"
      client.statuses: '["halo everyone!", "with discord.js v14"]'
      slash.register: "true"
      owners: '["YOUR-USER-ID"]'
      database.type: sqlite
      database.sqlite.path: /app/data/laffey.db
      embed.colors.default: "#6b92f3"
      embed.colors.success: "#43b581"
      embed.colors.error: "#f87171"
      embed.colors.warning: "#fbbf24"
      player.embed_mode: edit
      player.default_search: ""
      player.nodes: '[{"name": "Main", "url": "lavalink-host:2333", "auth": "helloworld"}]'

volumes:
  laffey-db:
```

### Complete PostgreSQL Setup

```yaml
version: '3.8'

services:
  laffey:
    image: ghcr.io/weeb-devs/laffey:main
    container_name: laffey-bot
    restart: unless-stopped
    volumes:
      - laffey-db:/app/data
    environment:
      NODE_ENV: production
      client.token: "YOUR-BOT-TOKEN"
      client.id: "YOUR-BOT-ID"
      database.type: postgres
      database.postgres.host: postgres
      database.postgres.port: "5432"
      database.postgres.user: laffey
      database.postgres.password: secure-password
      database.postgres.database: laffey
      player.nodes: '[{"name": "Main", "url": "lavalink:2333", "auth": "password"}]'

volumes:
  laffey-db:
```

### Using .env File

`.env` file:

```env
CLIENT_TOKEN=YOUR-BOT-TOKEN
CLIENT_ID=YOUR-BOT-ID
DATABASE_TYPE=sqlite
DATABASE_SQLITE_PATH=/app/data/laffey.db
PLAYER_NODES=[{"name":"Main","url":"localhost:2333","auth":"password"}]
```

Reference in `docker-compose.yml`:

```yaml
version: '3.8'

services:
  laffey:
    image: ghcr.io/weeb-devs/laffey:main
    container_name: laffey-bot
    restart: unless-stopped
    volumes:
      - laffey-db:/app/data
    environment:
      NODE_ENV: production
      client.token: ${CLIENT_TOKEN}
      client.id: ${CLIENT_ID}
      database.type: ${DATABASE_TYPE}
      database.sqlite.path: ${DATABASE_SQLITE_PATH}
      player.nodes: ${PLAYER_NODES}

volumes:
  laffey-db:
```

---

## Important Notes

### Type Validation

Laffey validates types on startup. If you provide a value that doesn't match the expected type, it will throw an error
with a clear message:

```
Config key "slash.register" expects boolean but got string: hello
```

Make sure to use the correct format for booleans and numbers (see Type Conversion Rules below).

### Security Best Practices

- **Never commit `.env` files to version control** - Add `.env` to `.gitignore`
- **Use Docker Secrets or cloud provider secrets** in production for sensitive values
- **Rotate tokens regularly** - Change your Discord bot token if compromised
- **Use read-only volumes** where applicable

### JSON Formatting for Arrays/Objects

When setting arrays or objects in environment variables, they must be valid JSON:

```yaml
# Correct
client.statuses: '["status1","status2"]'
owners: '["123456789","987654321"]'
player.nodes: '[{"name":"Main","url":"localhost:2333","auth":"password"}]'

# Incorrect (will fail)
client.statuses: [ status1, status2 ]
owners: [ 123456789, 987654321 ]
player.nodes: [ { name:Main,url:localhost:2333 } ]
```

### Mixing config.json and Environment Variables

It's safe to use both! Environment variables have priority:

```yaml
# Environment variable
client.token: "TOKEN-FROM-ENV"

  # config.json has
  {
    "client": {
      "token": "TOKEN-FROM-FILE"
    }
  }

# Result: TOKEN-FROM-ENV is used
```

---

### Variables not taking effect

- Make sure you're using `docker-compose up -d` or `docker-compose restart`
- Verify changes to `docker-compose.yml` are saved
- Check the logs: `docker-compose logs laffey`

### Syntax error in docker-compose.yml

- Make sure YAML indentation is correct (use spaces, not tabs)
- Ensure string values with special characters are quoted
- Use valid JSON for array/object values

---

### Found something wrong? Feel free to make a pull request or submitting an issue from this guide. Thank you





