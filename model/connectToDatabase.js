import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import { getCurrentTime } from "./helper.js";

const logger = (msg) => console.log(`${getCurrentTime()} ${msg}`);

const connectToDataBase = async () => {
  try {
    dotenv.config();
    const { DB_NAME, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;

    const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
      host: DB_HOST,
      port: DB_PORT,
      dialect: "mysql",
      logging: logger,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      }
    });

    await sequelize.authenticate();
    // console.log('Connection has been established successfully.');
    return sequelize;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return false;
  }
};

export default connectToDataBase;
