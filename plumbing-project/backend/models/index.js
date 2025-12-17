import { Sequelize } from "sequelize";
import UserModel from "./User.js";
import ProposedClubModel from "./ProposedClub.js";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || "", 
  {
    host: process.env.DB_HOST,
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
