import { DataTypes } from "sequelize";

export default (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      // expanding upon this soon to include queries for students to see club requests, pending requests
      // and expand role based access control which utilizes sequelize to give students more permissions/accessibility on the site
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.ENUM('user','admin'), defaultValue: 'user' }, // <--- ADD THIS
    },
    {
      tableName: "users",
      timestamps: false,
    }
  );

  return User;
};
