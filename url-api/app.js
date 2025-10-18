require('dotenv-safe').config();
const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const config = require('./config/config.json');
const path = require('path')


const urlRouter = require('./routes/url');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

let sequelize;

if (env === 'production' && dbConfig.use_env_variable) {
  // For production with JawsDB
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], {
    dialect: dbConfig.dialect,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false
  });
} else {
  // For development and test environments
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port || 3306,
      dialect: dbConfig.dialect,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: env === 'development' ? console.log : false
    }
  );
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/url', urlRouter);

async function startServer() {
    try {
      await sequelize.authenticate();
      console.log('Database connection established successfully.');
      
      // Run migrations in production
      if (env === 'production') {
        console.log('Running database migrations...');
        const { execSync } = require('child_process');
        try {
          execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
          console.log('Database migrations completed successfully.');
        } catch (migrationError) {
          console.error('Migration failed:', migrationError);
          // Don't exit on migration failure - let the app start anyway
          console.log('Continuing with app startup despite migration failure...');
        }
      }
      
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      process.exit(1);
    }
  }
  
  startServer();