import { DataTypes } from "sequelize";
import * as Schemas from "./rawSchema.js";

const fixedField = {
  cols: {
    code: {
      type: DataTypes.STRING(100),
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT("long"),
    },
    create_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    create_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    modify_id: {
      type: DataTypes.TEXT,
    },
    modify_name: {
      type: DataTypes.TEXT,
    },
  },
  option: {
    timestamps: true,
    createdAt: "create_time",
    updatedAt: "modify_time",
  },
};

const processedSchemas = Object.entries(Schemas).reduce(
  (dict, [schemaName, schemaContent]) => ({
    ...dict,
    [schemaName]: {
      ...schemaContent,
      cols: {
        ...fixedField.cols,
        ...schemaContent.cols,
      },
      option: {
        ...fixedField.option,
        ...schemaContent.option,
      },
    },
  }),
  {}
);

export default processedSchemas;
