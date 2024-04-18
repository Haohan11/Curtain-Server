import { DataTypes } from "sequelize";
import { goHashSync } from "../helper.js";

/* 
  Schemas here will automatically be export as connection middleware (check connectToTable.js).
*/

//--------- foreignKeys below ---
// user_id in employee (one-to-one)
const user_id_foreignKey = { name: "user_id", type: DataTypes.INTEGER };

// series_id in stock (one-to-many)
const series_id_foreignKey = {
  name: "series_id",
  type: DataTypes.INTEGER,
  allowNull: false,
};

// supplier_id in stock (one-to-many)
const supplier_id_foreignKey = { name: "supplier_id", type: DataTypes.INTEGER };
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
      foreignKey: user_id_foreignKey,
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
      foreignKey: user_id_foreignKey,
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
      foreignKey: series_id_foreignKey,
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
    comment: {
      type: DataTypes.TEXT("long"),
    },
  },
  option: {
    tableName: "environment",
  },
};

export const StockSchema = {
  name: "stock",
  cols: {
    // -&achor-pr
    name: {
      type: DataTypes.CHAR(15),
      allowNull: false,
    },
    // -&achor-pr
    enable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // -&achor-pr
    code: {
      type: DataTypes.CHAR(15),
      allowNull: false,
    },
    // -&achor-pr
    series_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // -&achor-pr
    supplier_id: {
      type: DataTypes.INTEGER,
    },
    // -&achor-pr
    main_image: {
      type: DataTypes.STRING(2048),
    },
    // -&achor-pr
    block: {
      type: DataTypes.ENUM("1", "2", "3", "4", "5"),
    },
    // -&achor-pr
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
        foreignKey: series_id_foreignKey,
      },
    },
    {
      targetTable: "Supplier",
      option: {
        foreignKey: supplier_id_foreignKey,
        onDelete: "SET NULL",
      },
    },
  ],
  hasMany: {
    targetTable: "Stock_ColorScheme",
    option: {
      foreignKey: "stock_id",
    }
  },
  belongsToMany: {
    targetTable: "ColorScheme",
    option: {
      through: "Stock_ColorScheme",
      foreignKey: "stock_id",
      otherKey: "color_scheme_id",
    },
  },
};

export const StockImageSchema = {
  name: "stock_image",
  cols: {
    // -&achor-p-img
    name: {
      type: DataTypes.CHAR(15),
      allowNull: false,
    },
    // -&achor-p-img
    stock_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // -&achor-p-img
    path: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
  },
  option: {
    tableName: "stock_image",
  },
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
}

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
    targetTable: "Stock_ColorScheme",
    option: {
      foreignKey: "color_scheme_id",
    }
  },
  belongsToMany: {
    targetTable: "Stock",
    option: {
      through: "Stock_ColorScheme",
      foreignKey: "color_scheme_id",
      otherKey: "stock_id",
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
      foreignKey: supplier_id_foreignKey,
    },
  },
};
//--------- normal Schemas above ---

//--------- junction schema below ---
export const Stock_ColorSchemeSchema = {
  name: "stock_colorScheme",
  cols: {
    stock_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "stock",
        key: "id"
      }
    },
    color_scheme_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "color_scheme",
        key: "id"
      }
    },
  },
  option: {
    tableName: "stock_colorScheme",
  },
  belongsTo: [
    {
      targetTable: "Stock",
      option: {
        foreignKey: { name: "stock_id", type: DataTypes.INTEGER, allowNull: false },
      }
    },
    {
      targetTable: "ColorScheme",
      option: {
        foreignKey: { name: "color_scheme_id", type: DataTypes.INTEGER, allowNull: false },
      }
    },
  ],
};
