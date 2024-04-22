import allValidator from "../model/validate/validator.js";

import {
  goHash,
  getPage,
  not0Falsy2Undefined,
  createUploadImage,
} from "../model/helper.js";

const uploadStockImage = createUploadImage("stock");

/*
  About regularController:

  create "create", "read", "update" method for "get", "post", "put" request api in router.js.

  Using tableName to access model instance ( req.app[tableName] ) which created by connectionMiddleware ( check connectToTable.js ).

  Using tableName to get validator ( check validator.js ).

  Creates a regular controller object for handling database operations.
  @author haohan
  
  @param {Object} options - The options for creating the controller.
  @param {string} options.tableName - The name of the database table.
  @param {array} options.queryAttribute - The attribute to use in queries.

  @returns {Object} A controller object with CRUD methods.
*/

const makeRegularController = ({
  tableName,
  create = {},
  read = {},
  update = {},
}) => {
  const validator = allValidator[`validate${tableName}`];
  return {
    create: async (req, res) => {
      const tableConnection = req.app[tableName];
      const { handleData = (req, data) => data } = create;

      const validatedData = await validator(req.body);
      if (validatedData === false) return res.response(400, "Invalid format.");

      const data = await handleData(req, validatedData);
      if (data === false) return res.response(500);

      try {
        await tableConnection.create(data);
        res.response(200, `Success added ${tableName}`);
      } catch (error) {
        // log sql message with error.original.sqlMessage
        console.log(error);
        res.response(500);
      }
    },
    read: async (req, res) => {
      const tableConnection = req.app[tableName];
      const { queryAttribute = [] } = read;

      try {
        const total = await tableConnection.count();
        const { start, size, begin, totalPages } = getPage({
          total,
          ...req.query,
        });

        const list = await tableConnection.findAll({
          offset: begin,
          limit: size,
          attributes: queryAttribute,
        });

        return res.response(200, {
          start,
          size,
          begin,
          total,
          totalPages,
          list,
        });
      } catch (error) {
        // log sql message with error.original.sqlMessage
        console.log(error);
        res.response(500);
      }
    },
    update: async (req, res) => {
      const tableConnection = req.app[tableName];
      const { handleData = (req, data) => data } = update;

      // get id before check because checkdata will also remove data that is not in validate schema
      const { id } = req.body;
      if (isNaN(parseInt(id))) return res.response(400, "Invalid id.");

      const validatedData = await validator(req.body);
      if (validatedData === false) return res.response(400, "Invalid format.");

      const data = await handleData(req, validatedData);
      if (data === false) return res.response(500);

      try {
        await tableConnection.update(data, {
          where: {
            id,
          },
        });
        res.response(200, `Updated ${tableName} data success.`);
      } catch (error) {
        // log sql message with error.original.sqlMessage
        console.log(error);
        res.response(500);
      }
    },
  };
};

export const SeriesController = makeRegularController({
  tableName: "Series",
  read: {
    queryAttribute: ["id", "enable", "code", "name", "comment"],
  },
});

export const ColorSchemeController = makeRegularController({
  tableName: "ColorScheme",
  read: {
    queryAttribute: ["id", "enable", "name", "comment"],
  },
});

export const ColorNameController = makeRegularController({
  tableName: "ColorName",
  read: {
    queryAttribute: ["id", "enable", "name"],
  },
});

export const DesignController = makeRegularController({
  tableName: "Design",
  read: {
    queryAttribute: ["id", "enable", "name", "comment"],
  },
});

export const MaterialController = makeRegularController({
  tableName: "Material",
  read: {
    queryAttribute: ["id", "enable", "name", "comment"],
  },
});

export const SupplierController = makeRegularController({
  tableName: "Supplier",
  read: {
    queryAttribute: ["id", "enable", "code", "name", "comment"],
  },
});

export const EmployeeController = makeRegularController({
  tableName: "Employee",
  create: {
    async handleData(req, data) {
      const { Employee } = req.app;

      const { password } = data;
      const hashedPassword = await goHash(password);

      const code = await generateCode(Employee);
      if (code === false) return false;

      return { ...data, password: hashedPassword, code };
    },
  },
  read: {
    queryAttribute: [
      "id",
      "enable",
      "role",
      "code",
      "name",
      "id_code",
      "phone_number",
      "email",
    ],
  },
  update: {
    async handleData(req, data) {
      const { password } = data;
      const hashedPassword = await goHash(password);

      return { ...data, password: hashedPassword };
    },
  },
});

const generateCode = async (Employee) => {
  const date = new Date();
  const yearString = (date.getFullYear() - 1911).toString();
  const month = (date.getMonth() + 1).toString();
  const monthString = padding(month, 2);

  const id = await getId(Employee);
  if (id === false) return false;

  const idString = padding(id, 3);

  return yearString + monthString + idString;
};

const getId = async (Employee) => {
  try {
    const row = await Employee.findOne({
      attributes: ["id"],
      order: [["id", "DESC"]],
    });
    return row?.id || 0;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const padding = (num, digits) => {
  let str = num.toString();
  while (str.length < digits) str = "0" + str;
  return str;
};

export const EnvironmentController = makeRegularController({
  tableName: "Environment",
  read: {
    queryAttribute: ["id", "enable", "name", "comment"],
  },
});

export const StockController = {
  create: [
    uploadStockImage.array("colorImages"),
    (req, res, next) => {
      // if (!req.files) return res.response(500);
      // res.response(200, { body: req.body, files: req.files });
      next();
    },
    async (req, res) => {
      const {
        Stock,
        Stock_Material,
        Stock_Design,
        Stock_Environment,
        StockColor,
        ColorName,
        Stock_StockColor,
        StockColor_ColorScheme,
      } = req.app;
      const { validateStock: validator } = allValidator;

      const validatedData = await validator({
        ...req.body,
        series_id: req.body.series,
        supplier_id: not0Falsy2Undefined(req.body.supplier),
      });

      if (validatedData === false) return res.response(400, "Invalid format.");
      // return res.response(200, "Success receive data.", {...req.body, validate: validatedData !== false});

      const { create_name, create_id, modify_name, modify_id } = req.body;
      const author = { create_name, create_id, modify_name, modify_id };

      const result = {
        message: "Success inserted",
        data: {},
      };

      try {
        // loop req.body for color_index and colorScheme_index
        const colorData = Object.entries(req.body)
          .reduce((list, [key, value]) => {
            const [target, _index] = key.split("_");
            const index = parseInt(_index);
            if (
              (target !== "color" && target !== "colorScheme") ||
              isNaN(index)
            )
              return list;

            if (target === "color" && isNaN(parseInt(value))) return list;

            list[index] = {
              ...list[index],
              [target]: value,
            };

            return list;
          }, [])
          .filter(Boolean);

        if (colorData.length * 3 !== req.files.length) return res.response(400);

        const stock = await Stock.create(validatedData);

        // save material design and environment
        false &&
          (await Promise.all(
            Object.entries({
              material: Stock_Material,
              design: Stock_Design,
              environment: Stock_Environment,
            }).map(async ([modelName, Model]) => {
              const insert_data =
                Array.isArray(req.body[modelName]) &&
                req.body[modelName].reduce(
                  (list, id) =>
                    not0Falsy2Undefined(id) === undefined
                      ? list
                      : [
                          ...list,
                          {
                            ...author,
                            stock_id: stock.id,
                            [`${modelName}_id`]: +not0Falsy2Undefined(id),
                          },
                        ],
                  []
                );

              if (!insert_data) return;

              Model.removeAttribute("id");
              await Model.bulkCreate(insert_data);

              result.message += ` "${modelName}",`;
            })
          ));

        // save color data
        await Promise.all(
          colorData.map(async ({ color, colorScheme }, index) => {
            if ((color !== 0 && !color) || !colorScheme)
              return console.warn(
                `Invalid ${!colorScheme ? "colorScheme" : "color"}_${index}.`
              );

            const { name } = await ColorName.findByPk(color);
            if (!name) return;

            const { id: stock_color_id } = await StockColor.create({
              ...author,
              stock_id: stock.id,
              name,
              color_name_id: color,
              stock_image: req.files[index * 3].filename,
              color_image: req.files[index * 3 + 1].filename,
              removal_image: req.files[index * 3 + 2].filename,
            });
            result.message += " stock_color,";

            Stock_StockColor.removeAttribute("id");
            await Stock_StockColor.create({
              ...author,
              stock_id: stock.id,
              stock_color_id,
            });
            result.message += " stock_stockcolor,";

            const insert_data = colorScheme.reduce((list, scheme) => {
              const schemeId = parseInt(scheme);
              return isNaN(schemeId)
                ? list
                : [
                    ...list,
                    {
                      ...author,
                      color_scheme_id: schemeId,
                      stock_color_id,
                    },
                  ];
            }, []);

            StockColor_ColorScheme.removeAttribute("id");
            await StockColor_ColorScheme.bulkCreate(insert_data);
            result.message += " stockcolor_colorscheme,";
          })
        );

        res.response(200, result.message);
      } catch (error) {
        // log sql message with error.original.sqlMessage
        console.log(error);
        res.response(500, `Internal server error and ${result.message}.`);
      }
    },
  ],
  read: async (req, res) => {
    // const tableConnection = req.app[tableName];
    // const { queryAttribute = [] } = read;

    try {
      const total = 0;
      const { start, size, begin, totalPages } = getPage({
        ...req.query,
        total,
      });

      const list = [];

      return res.response(200, {
        start,
        size,
        begin,
        total,
        totalPages,
        list,
      });
    } catch (error) {
      // log sql message with error.original.sqlMessage
      console.log(error);
      res.response(500);
    }
  },
  update: async (req, res) => {},
};
