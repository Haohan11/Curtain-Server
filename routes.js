import express from "express";

import { allConnectMiddleware } from "./middleware/connectToTable.js";
import addAuthor from "./middleware/addAuthor.js";

import { toArray } from "./model/helper.js";
import * as AllController from "./controller/controller.js";

const tablesDependencies = {
  Series: {
    tableName: "Series",
    connectMiddlewares: ["Series"],
  },
  ColorName: {
    tableName: "ColorName",
    connectMiddlewares: ["ColorName"],
  },
  ColorScheme: {
    tableName: "ColorScheme",
    connectMiddlewares: ["ColorScheme"],
  },
  Design: {
    tableName: "Design",
    connectMiddlewares: ["Design"],
  },
  Material: {
    tableName: "Material",
    connectMiddlewares: ["Material"],
  },
  Supplier: {
    tableName: "Supplier",
    connectMiddlewares: ["Supplier"],
  },
  Employee: {
    tableName: "Employee",
    connectMiddlewares: ["Employee"],
  },
  Environment: {
    tableName: "Environment",
    connectMiddlewares: ["Environment"],
  },
  Stock: {
    tableName: "Stock",
    connectMiddlewares: [
      "Stock",
      "Stock_Material",
      "Stock_Design",
      "Stock_Environment",
      "StockColor",
      "StockColor_ColorScheme",
      "ColorName",
      "ColorScheme",
    ],
  },
};

const Routers = Object.entries(tablesDependencies).reduce(
  (dict, [table, content]) => {
    const router = express.Router();

    const { tableName, connectMiddlewares } = content;

    connectMiddlewares.forEach((middlewareName) => {
      // Add Sequelize Model instance to req.app
      const connectName = `connect${middlewareName}`;
      const connectMiddleware = allConnectMiddleware[connectName];
      return connectMiddleware === undefined
        ? console.warn(`Cannot find middleware "${connectName}".`)
        : router.use(connectMiddleware);
    });

    const controller = AllController[`${tableName}Controller`];

    router.use(addAuthor);

    router.post("/", ...toArray(controller.create));
    router.get("/", ...toArray(controller.read));
    router.put("/", ...toArray(controller.update));

    dict[`${tableName}Router`] = router;
    return dict;
  },
  {}
);

export { Routers };
