import { DataTypes } from "sequelize";

const columns = {
  table: "ColorName",
  name: "comment",
  content: {
    type: DataTypes.TEXT("long"),
  },
};

export default columns;
