// Load environment variables
require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DB_HOST && process.env.DB_HOST !== 'localhost'
      ? `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=no-verify`
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          database: process.env.DB_NAME || 'channel_validator_bot',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || '',
        },
    migrations: {
      directory: './src/database/migrations',
      extension: 'ts',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },

  production: {
    client: 'pg',
    connection: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=no-verify`,
    migrations: {
      directory: './src/database/migrations',
      extension: 'ts',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },

  test: {
    client: 'pg',
    connection: process.env.DB_HOST && process.env.DB_HOST !== 'localhost'
      ? `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=no-verify`
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          database: process.env.DB_NAME || 'channel_validator_bot_test',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || '',
        },
    migrations: {
      directory: './src/database/migrations',
      extension: 'ts',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};
