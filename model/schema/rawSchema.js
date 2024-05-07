import { DataTypes } from "sequelize";
import { goHashSync } from "../helper.js";

/* 
  Schemas here will automatically be export as connection middleware (check connectToTable.js).
*/

//--------- foreignKeys below ---
// user_id in employee (one-to-one)
const user_id_in_employee = { name: "user_id", type: DataTypes.INTEGER };

// series_id in stock (one-to-many)
const series_id_in_stock = {
  name: "series_id",
  type: DataTypes.INTEGER,
  allowNull: false,
};

// supplier_id in stock (one-to-many)
const supplier_id_in_stock = { name: "supplier_id", type: DataTypes.INTEGER };

// stock_id in stock-color
const stock_id_in_stockColor = { name: "stock_id", type: DataTypes.INTEGER };

// colorname in stock-color
const colorName_id_in_stockColor = {
  name: "color_name_id",
  type: DataTypes.INTEGER,
  allowNull: false,
};
//--------- foreignKeys above ---

//--------- normal Schemas below ---
export const UserSchema = {
  name: "user",
  cols: {
    // -&achor-u
    user_type: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    // -&achor-u
    account: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    // -&achor-u
    email: {
      type: DataTypes.STRING,
    },
    // -&achor-u
    password: {
      type: DataTypes.CHAR(60),
      allowNull: false,
      set(value) {
        this.setDataValue("password", goHashSync(value));
      },
    },
  },
  option: {
    tableName: "user",
  },
  hasOne: {
    targetTable: "Employee",
    option: {
      foreignKey: user_id_in_employee,
      onDelete: "SET NULL",
    },
  },
};

export const EmployeeSchema = {
  name: "employee",
  cols: {
    // -&achor-em
    enable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // -&achor-em
    role: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    // -&achor-em
    code: {
      type: DataTypes.CHAR(8),
      unique: true,
    },
    // -&achor-em
    avatar: {
      type: DataTypes.STRING,
    },
    // -&achor-em
    id_code: {
      type: DataTypes.CHAR(10),
      allowNull: false,
    },
    // -&achor-em
    phone_number: {
      type: DataTypes.CHAR(10),
      allowNull: false,
    },
    // -&achor-em
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // -&achor-em
    password: {
      type: DataTypes.CHAR(60),
      allowNull: false,
    },
  },
  option: {
    tableName: "employee",
  },
  belongsTo: {
    targetTable: "User",
    option: {
      foreignKey: user_id_in_employee,
    },
  },
};

export const SeriesSchema = {
  name: "series",
  cols: {
    // -&achor-sri
    name: {
      type: DataTypes.CHAR(15),
      allowNull: false,
    },
    // -&achor-sri
    enable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // -&achor-sri
    code: {
      type: DataTypes.CHAR(15),
      unique: true,
      allowNull: false,
    },
    // -&achor-sri
    comment: {
      type: DataTypes.TEXT("long"),
    },
  },
  option: {
    tableName: "series",
  },
  hasMany: {
    targetTable: "Stock",
    option: {
      foreignKey: series_id_in_stock,
    },
  },
};

export const StockSchema = {
  name: "stock",
  cols: {
    // -&achor-st
    name: {
      type: DataTypes.CHAR(15),
      allowNull: false,
    },
    // -&achor-st
    enable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // -&achor-st
    code: {
      type: DataTypes.CHAR(15),
      allowNull: false,
    },
    // -&achor-st
    series_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // -&achor-st
    supplier_id: {
      type: DataTypes.INTEGER,
    },
    // -&achor-st
    block: {
      type: DataTypes.ENUM("1", "2", "3", "4", "5"),
    },
    // -&achor-st
    absorption: {
      type: DataTypes.ENUM("1", "2", "3", "4", "5"),
    },
  },
  option: {
    tableName: "stock",
  },
  belongsTo: [
    {
      targetTable: "Series",
      option: {
        foreignKey: series_id_in_stock,
      },
    },
    {
      targetTable: "Supplier",
      option: {
        foreignKey: supplier_id_in_stock,
        onDelete: "SET NULL",
      },
    },
  ],
  belongsToMany: [
    {
      targetTable: "Material",
      option: {
        through: "Stock_Material",
        foreignKey: "stock_id",
        otherKey: "material_id",
      },
    },
    {
      targetTable: "Design",
      option: {
        through: "Stock_Design",
        foreignKey: "stock_id",
        otherKey: "design_id",
      },
    },
    {
      targetTable: "Environment",
      option: {
        through: "Stock_Environment",
        foreignKey: "stock_id",
        otherKey: "environment_id",
      },
    },
    {
      targetTable: "Combination",
      option: {
        through: "Combination_Stock",
        foreignKey: "stock_id",
        otherKey: "combination_id",
      },
    },
  ],
};

export const StockColorSchema = {
  name: "stock_color",
  cols: {
    // -&achor-sc
    color_name_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock_image: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
    stock_image_name: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
    color_image: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
    color_image_name: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
    removal_image: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
    removal_image_name: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
  },
  option: {
    tableName: "stock_color",
  },
  belongsTo: [
    {
      targetTable: "ColorName",
      option: {
        foreignKey: colorName_id_in_stockColor,
      },
    },
    {
      targetTable: "Stock",
      option: {
        foreignKey: stock_id_in_stockColor,
      },
    },
  ],
  hasMany: {
    targetTable: "StockColor_ColorScheme",
    option: {
      foreignKey: "stock_color_id",
    },
  },
  belongsToMany: [
    {
      targetTable: "ColorScheme",
      option: {
        through: "StockColor_ColorScheme",
        foreignKey: "stock_color_id",
        otherKey: "color_scheme_id",
      },
    },
  ],
};

export const ColorNameSchema = {
  name: "color_name",
  cols: {
    // -&achor-c
    name: {
      type: DataTypes.CHAR(15),
      allowNull: false,
    },
    // -&achor-c
    enable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  option: {
    tableName: "color_name",
  },
};

export const ColorSchemeSchema = {
  name: "color_scheme",
  cols: {
    // -&achor-cs
    name: {
      type: DataTypes.CHAR(15),
      allowNull: false,
    },
    // -&achor-cs
    enable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // -&achor-cs
    comment: {
      type: DataTypes.TEXT("long"),
    },
  },
  option: {
    tableName: "color_scheme",
  },
  hasMany: {
    targetTable: "StockColor_ColorScheme",
    option: {
      foreignKey: "color_scheme_id",
    },
  },
  belongsToMany: {
    targetTable: "StockColor",
    option: {
      through: "StockColor_ColorScheme",
      foreignKey: "color_scheme_id",
      otherKey: "stock_color_id",
    },
  },
};

export const MaterialSchema = {
  name: "material",
  cols: {
    // -&achor-m
    name: {
      type: DataTypes.CHAR(15),
      allowNull: false,
    },
    // -&achor-m
    enable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // -&achor-m
    comment: {
      type: DataTypes.TEXT("long"),
    },
  },
  option: {
    tableName: "material",
  },
  belongsToMany: {
    targetTable: "Stock",
    option: {
      through: "Stock_Material",
      foreignKey: "material_id",
      otherKey: "stock_id",
    },
  },
};

export const DesignSchema = {
  name: "design",
  cols: {
    // -&achor-ds
    name: {
      type: DataTypes.CHAR(15),
      allowNull: false,
    },
    // -&achor-ds
    enable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // -&achor-ds
    comment: {
      type: DataTypes.TEXT("long"),
    },
  },
  option: {
    tableName: "design",
  },
  belongsToMany: {
    targetTable: "Stock",
    option: {
      through: "Stock_Design",
      foreignKey: "design_id",
      otherKey: "stock_id",
    },
  },
};

export const SupplierSchema = {
  name: "supplier",
  cols: {
    // -&achor-sri
    name: {
      type: DataTypes.CHAR(15),
      allowNull: false,
    },
    // -&achor-sri
    enable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // -&achor-sri
    code: {
      type: DataTypes.CHAR(15),
      unique: true,
      allowNull: false,
    },
    // -&achor-sri
    comment: {
      type: DataTypes.TEXT("long"),
    },
  },
  option: {
    tableName: "supplier",
  },
  hasMany: {
    targetTable: "Stock",
    option: {
      foreignKey: supplier_id_in_stock,
    },
  },
};

export const EnvironmentSchema = {
  name: "environment",
  cols: {
    // -&achor-env
    name: {
      type: DataTypes.CHAR(15),
      allowNull: false,
    },
    // -&achor-env
    enable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // -&achor-env
    env_image_name: {
      type: DataTypes.STRING(2048),
    },
    // -&achor-env
    env_image: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
    // -&achor-env
    mask_image_name: {
      type: DataTypes.STRING(2048),
    },
    // -&achor-env
    mask_image: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
    // -&achor-env
    width: {
      type: DataTypes.STRING(20),
    },
    // -&achor-env
    cropline: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    // -&achor-env
    comment: {
      type: DataTypes.TEXT("long"),
    },
  },
  option: {
    tableName: "environment",
  },
  belongsToMany: {
    targetTable: "Stock",
    option: {
      through: "Stock_Environment",
      foreignKey: "environment_id",
      otherKey: "stock_id",
    },
  },
};

export const CombinationSchema = {
  name: "combination",
  cols: {
    // -&achor-pp
    name: {
      type: DataTypes.CHAR(50),
      allowNull: false,
    },
    // -&achor-pp
    enable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // -&achor-pp
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // -&achor-pp
    environment_id: {
      type: DataTypes.INTEGER,
    },
  },
  option: {
    tableName: "combination",
  },
  belongsToMany: {
    targetTable: "Stock",
    option: {
      through: "Combination_Stock",
      foreignKey: "combination_id",
      otherKey: "stock_id",
    },
  },
};

//--------- normal Schemas above ---

//--------- junction schema below ---
export const StockColor_ColorSchemeSchema = {
  name: "stockColor_colorScheme",
  cols: {
    stock_color_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "stock_color",
        key: "id",
      },
    },
    color_scheme_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "color_scheme",
        key: "id",
      },
    },
  },
  option: {
    tableName: "stockColor_colorScheme",
  },
  belongsTo: [
    {
      targetTable: "StockColor",
      option: {
        foreignKey: {
          name: "stock_color_id",
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
    },
    {
      targetTable: "ColorScheme",
      option: {
        foreignKey: {
          name: "color_scheme_id",
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
    },
  ],
};

export const Stock_MaterialSchema = {
  name: "stock_material",
  cols: {
    stock_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "stock",
        key: "id",
      },
    },
    material_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "material",
        key: "id",
      },
    },
  },
  option: {
    tableName: "stock_material",
  },
  belongsTo: [
    {
      targetTable: "Stock",
      option: {
        foreignKey: {
          name: "stock_id",
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
    },
    {
      targetTable: "Material",
      option: {
        foreignKey: {
          name: "material_id",
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
    },
  ],
};

export const Stock_DesignSchema = {
  name: "stock_design",
  cols: {
    stock_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "stock",
        key: "id",
      },
    },
    design_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "design",
        key: "id",
      },
    },
  },
  option: {
    tableName: "stock_design",
  },
  belongsTo: [
    {
      targetTable: "Stock",
      option: {
        foreignKey: {
          name: "stock_id",
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
    },
    {
      targetTable: "Design",
      option: {
        foreignKey: {
          name: "design_id",
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
    },
  ],
};

export const Stock_EnvironmentSchema = {
  name: "stock_environment",
  cols: {
    stock_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "stock",
        key: "id",
      },
    },
    environment_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "environment",
        key: "id",
      },
    },
  },
  option: {
    tableName: "stock_environment",
  },
  belongsTo: [
    {
      targetTable: "Stock",
      option: {
        foreignKey: {
          name: "stock_id",
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
    },
    {
      targetTable: "Environment",
      option: {
        foreignKey: {
          name: "environment_id",
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
    },
  ],
};

export const Combination_StockSchema = {
  name: "combination_stock",
  cols: {
    combination_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "combination",
        key: "id",
      },
    },
    stock_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "stock",
        key: "id",
      },
    },
  },
  option: {
    tableName: "combination_stock",
  },
  belongsTo: [
    {
      targetTable: "Combination",
      option: {
        foreignKey: {
          name: "combination_id",
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
    },
    {
      targetTable: "Stock",
      option: {
        foreignKey: {
          name: "stock_id",
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
    },
  ],
};

//--------- junction schema above ---
