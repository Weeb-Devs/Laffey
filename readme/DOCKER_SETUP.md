# Docker Setup Guide

### In this guide, i will explain how to set up and run Laffey using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (recommended)
- A Lavalink server running (see [LAVALINK_INSTALLATION.md](LAVALINK_INSTALLATION.md))

---

## Docker Compose Files

Laffey includes 4 pre-configured docker-compose files for different setups:

| File                              | Database   | Config           | Best For                         |
|-----------------------------------|------------|------------------|----------------------------------|
| **`docker-compose.env.yml`**      | SQLite     | Environment Vars | **Quickest start (recommended)** |
| `docker-compose.yml`              | SQLite     | config.json      | Traditional file-based setup     |
| `docker-compose.postgres.env.yml` | PostgreSQL | Environment Vars | Production with env vars         |
| `docker-compose.postgres.yml`     | PostgreSQL | config.json      | Production with file config      |

---

## Quick Start (Recommended)

### Using docker-compose.env.yml

This is the easiest way to get started. It uses SQLite and environment variables.

1. Open `docker-compose.env.yml` in a text editor
2. Edit these two lines with your bot's information:
   ```yaml
   client.token: "YOUR-BOT-TOKEN-HERE"
   client.id: "YOUR-BOT-ID-HERE"
   ```
3. If you have a Lavalink node, update this line:
   ```yaml
   player.nodes: '[{"name":"Main","url":"localhost:2333","auth":"youshallnotpass"}]'
   ```
4. Start the bot:
   ```bash
   docker-compose -f docker-compose.env.yml up -d
   ```
5. Check the logs:
   ```bash
   docker-compose -f docker-compose.env.yml logs -f laffey
   ```

That's it! The bot is now running.

---

## Setup Details by Configuration

### Option 1: Environment Variables + SQLite (Recommended)

**File:** `docker-compose.env.yml`

Best for quick deployment. Edit environment variables directly in the compose file.

```bash
docker-compose -f docker-compose.env.yml up -d
```

**Advantages:**

- Only need to edit one file
- No need to manage config.json
- Perfect for beginners
- Uses SQLite (no external database needed)

See [CONFIG_GUIDE.env.md](CONFIG_GUIDE.env.md) for all available environment variables

### Option 2: config.json + SQLite

**File:** `docker-compose.yml`

Traditional approach using a config file.

1. Rename `config.json.example` to `config.json`
2. Edit `config.json` with your settings
3. Start:
   ```bash
   docker-compose up -d
   ```

**Advantages:**

- Familiar file-based configuration
- Good for complex setups

See [CONFIG_GUIDE.md](CONFIG_GUIDE.md) for config file documentation

### Option 3: Environment Variables + PostgreSQL

**File:** `docker-compose.postgres.env.yml`

For production deployments with environment variables.

1. Edit the environment variables in the file
2. Update the PostgreSQL password (at least change "secure-password-change-this")
3. Start:
   ```bash
   docker-compose -f docker-compose.postgres.env.yml up -d
   ```

**Advantages:**

- Professional database setup
- Scalable for production
- PostgreSQL included

The PostgreSQL database starts automatically. See [CONFIG_GUIDE.env.md](CONFIG_GUIDE.env.md) for environment variable
details

### Option 4: config.json + PostgreSQL

**File:** `docker-compose.postgres.yml`

For production deployments using config file.

1. Rename `config.json.example` to `config.json`
2. Configure PostgreSQL settings in config.json:
   ```json
   {
     "database": {
       "type": "postgres",
       "postgres": {
         "host": "postgres",
         "port": 5432,
         "user": "laffey",
         "password": "secure-password-change-this",
         "database": "laffey"
       }
     }
   }
   ```
3. Start:
   ```bash
   docker-compose -f docker-compose.postgres.yml up -d
   ```

**Advantages:**

- Professional database setup
- File-based configuration

The PostgreSQL database starts automatically. See [CONFIG_GUIDE.md](CONFIG_GUIDE.md) for config file documentation

---

## Common Commands

### View logs

```bash
docker-compose -f docker-compose.env.yml logs -f laffey
```

### Stop the bot

```bash
docker-compose -f docker-compose.env.yml down
```

### Restart the bot

```bash
docker-compose -f docker-compose.env.yml restart laffey
```

### View database files (SQLite)

```bash
docker-compose -f docker-compose.env.yml exec laffey ls -la /app/data/
```

---

## Important Notes

### Bind Volumes for Database Persistence

**For SQLite:** Database is stored in a Docker volume that persists between restarts.

**For PostgreSQL:** Database is stored in a Docker volume that persists between restarts.

Make sure to never run `docker-compose down -v` as it will delete all your data!

### Lavalink Node Configuration

All docker-compose files have a placeholder for your Lavalink node. Update this line with your Lavalink details:

```yaml
player.nodes: '[{"name":"Main","url":"localhost:2333","auth":"youshallnotpass"}]'
```

If your Lavalink is running locally outside Docker, use `host.docker.internal` instead of `localhost`:

```yaml
player.nodes: '[{"name":"Main","url":"host.docker.internal:2333","auth":"password"}]'
```

---

## Troubleshooting

### Bot exits immediately

- Check logs: `docker-compose -f docker-compose.env.yml logs laffey`
- Make sure you filled in `client.token` and `client.id`
- Verify the Lavalink node URL is correct

### Database connection errors

- Make sure your PostgreSQL is running
- Verify credentials in the compose file match your setup

### Port conflicts

- If port 5432 (PostgreSQL) is in use, change it in the docker-compose file
- If port 2333 (Lavalink) is in use, change your Lavalink configuration

---

### Found something wrong? Feel free to make a pull request or submitting an issue from this guide. Thank you

