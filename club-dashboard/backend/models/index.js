import { Sequelize } from "sequelize";
import UserModel from "./User.js";
import ProposedClubModel from "./ProposedClub.js";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME || "my_app",
  process.env.DB_USER || "appuser",
  process.env.DB_PASSWORD || "password123",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
  }
);

// Initialize models
const User = UserModel(sequelize);
const ProposedClub = ProposedClubModel(sequelize);

// Export them
export { User, ProposedClub };

export default {
  sequelize,
  User,
  ProposedClub,
};
