import { DataTypes } from "sequelize";

export default (sequelize) => {
  const User = sequelize.define(
    "User",
    {
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
