import dotenv from "dotenv";

// Load Environment variables
dotenv.config();

export const AppConfig = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  HOST: "0.0.0.0",
  NODE_ENV: process.env.NODE_ENV || "development",
  MAX_FILE_SIZE_BYTES: 15 * 1024 * 1024, // 15MB safe limit
};
