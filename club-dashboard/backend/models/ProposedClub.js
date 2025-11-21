import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ProposedClub = sequelize.define(
    "ProposedClub",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      club_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      leader_email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "proposed_clubs",
      timestamps: false,
    }
  );

  return ProposedClub;
};
