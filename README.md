# Channel Subscription Validator Bot

A Telegram bot that validates channel subscriptions and delivers protected PDF files to users.

## Features

- **UTM Source Tracking**: Track where users come from with deep links (e.g., `https://t.me/YourBot?start=campaign_name`)
- **Channel Subscription Validation**: Automatically verifies if users are subscribed to your channel
- **Protected PDF Delivery**: Send PDFs that cannot be forwarded or downloaded (protected content)
- **Admin Commands**: Set active PDFs and view statistics
- **Analytics**: Track user growth by UTM source

## Tech Stack

- **NestJS** - Application framework
- **Grammy** - Telegram bot framework
- **Knex** - Database query builder
- **PostgreSQL** - Database

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Configure your environment variables:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHANNEL_USERNAME=@your_channel
DB_HOST=localhost
DB_PORT=5432
DB_NAME=channel_validator_bot
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3000
NODE_ENV=development
PDF_STORAGE_PATH=./storage/pdfs
ADMIN_IDS=123456789,987654321
```

## Getting Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Follow the prompts to create your bot
4. Copy the bot token

## Database Setup

1. Create a PostgreSQL database:

```bash
createdb channel_validator_bot
```

2. Run migrations:

```bash
npm run migration:latest
```

## Running the Bot

Development mode (with auto-reload):
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

## Usage

### For Users

1. **Start the bot**: Send `/start` or use a deep link with UTM source:
   - `https://t.me/YourBot?start=my_campaign`
   - `https://t.me/YourBot?start=instagram`

2. **Subscribe to channel**: Click the "Subscribe to Channel" button

3. **Validate subscription**: Click "Validate Subscription" button

4. **Receive PDF**: If subscribed, the protected PDF will be sent

### For Admins

#### Set Active PDF

1. Send a PDF document to the bot
2. Reply to the document with `/setpdf`
3. The PDF will be saved and set as active

#### View Statistics

Send `/stats` to view:
- Total users
- New users (today, this week)
- UTM source breakdown
- Documents sent
- Current active PDF

## Deep Link Format

Use the following format for tracking sources:

```
https://t.me/YOUR_BOT_USERNAME?start=SOURCE_NAME
```

Examples:
- `https://t.me/YOUR_BOT_USERNAME?start=instagram`
- `https://t.me/YOUR_BOT_USERNAME?start=twitter`
- `https://t.me/YOUR_BOT_USERNAME?start=newsletter`

## Important Notes

### Protected Content

The `protect_content: true` flag prevents:
- Forwarding the message
- Downloading the file (on some clients)
- Taking screenshots (on some clients)

**Limitation**: Users can still take screenshots on most devices. There is no perfect solution to prevent all types of copying.

### Bot Permissions

The bot must be an **administrator** in the channel to check user subscriptions. To add the bot as admin:

1. Go to your channel
2. Click Channel Info → Administrators → Add Administrator
3. Search for your bot and add it

### Channel Username Format

In `.env`, use the `@` symbol for channel usernames:
- `@your_channel` (correct)
- `your_channel` (incorrect)

## Project Structure

```
src/
├── bot/                 # Bot commands and handlers
├── config/              # Configuration
├── database/            # Database service and migrations
├── repositories/        # Data access layer
├── services/            # Business logic
├── entities/            # Type definitions
└── main.ts              # Entry point
```

## Migrations

Create a new migration:
```bash
npm run migration:make migration_name
```

Run latest migrations:
```bash
npm run migration:latest
```

Rollback last migration:
```bash
npm run migration:rollback
```

## License

MIT
