import allValidator from "../model/validate/validator.js";
import multer from "multer";
import fs from "fs";
import { Op } from "sequelize";

import {
  goHash,
  getPage,
  not0Falsy2Undefined,
  createUploadImage,
  toArray,
  transFilePath,
  filePathAppend,
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
    create: [
      multer().none(),
      async (req, res) => {
        const tableConnection = req.app[tableName];
        const { handleData = (req, data) => data } = create;

        const validatedData = await validator(req.body);
        if (validatedData === false)
          return res.response(400, "Invalid format.");

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
    ],
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
    update: [
      multer().none(),
      async (req, res) => {
        const tableConnection = req.app[tableName];
        const { handleData = (req, data) => data } = update;

        // get id before check because checkdata will also remove data that is not in validate schema
        const { id } = req.body;
        console.log("================", id);
        if (isNaN(parseInt(id))) return res.response(400, "Invalid id.");

        const validatedData = await validator(req.body);
        if (validatedData === false)
          return res.response(400, "Invalid format.");

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
    ],
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
    async (req, res) => {
      const {
        Stock,
        Stock_Material,
        Stock_Design,
        Stock_Environment,
        StockColor,
        ColorName,
        StockColor_ColorScheme,
      } = req.app;

      const { validateStock: validator } = allValidator;

      const validatedData = await validator({
        ...req.body,
        series_id: req.body.series,
        supplier_id: not0Falsy2Undefined(req.body.supplier),
      });

      if (validatedData === false) return res.response(400, "Invalid format.");

      const { create_name, create_id, modify_name, modify_id } = req.body;
      const author = { create_name, create_id, modify_name, modify_id };

      const result = {
        message: "Success inserted",
        data: {},
      };

      try {
        /*  
          req.body may contain color data like: 
          { 
            color_0: id, 
            color_1: id, ...,
            colorScheme_0: [...],  
            colorScheme_1: [...], ..., 
          }
          Loop req.body for wrap color_index and colorScheme_index to 
          object in array like: [{ color: id, colorScheme: []}, ...] 
        */
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
              [target]: target === "color" ? value : toArray(value),
            };

            return list;
          }, [])
          .filter(Boolean);

        if (colorData.length * 3 !== req.files.length) return res.response(400);

        // only color data is validate then we create stock
        const stock = await Stock.create(validatedData);

        // save material, design, environment
        await Promise.all(
          Object.entries({
            material: Stock_Material,
            design: Stock_Design,
            environment: Stock_Environment,
          }).map(async ([modelName, Model]) => {
            const insert_data =
              req.body[modelName] &&
              toArray(req.body[modelName]).reduce(
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
        );

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
              stock_image_name: req.files[index * 3].originalname,
              stock_image: transFilePath(req.files[index * 3].path),
              color_image_name: req.files[index * 3 + 1].originalname,
              color_image: transFilePath(req.files[index * 3 + 1].path),
              removal_image_name: req.files[index * 3 + 2].originalname,
              removal_image: transFilePath(req.files[index * 3 + 2].path),
            });
            result.message += " stock_color,";

            // save colorScheme data
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

            // junction table has no id column
            StockColor_ColorScheme.removeAttribute("id");
            await StockColor_ColorScheme.bulkCreate(insert_data);

            result.message += " stockcolor_colorscheme,";
          })
        );

        res.response(200, result.message, req.body);
      } catch (error) {
        // log sql message with error.original.sqlMessage
        console.log(error);
        res.response(500, `Internal server error and ${result.message}.`);
      }
    },
  ],
  read: async (req, res) => {
    const {
      Stock,
      StockColor,
      StockColor_ColorScheme,
      ColorScheme,
      Series,
      Supplier,
      Material,
      Design,
      Environment,
      Stock_Material,
      Stock_Design,
      Stock_Environment,
    } = req.app;

    try {
      const total = await Stock.count();
      const { start, size, begin, totalPages } = getPage({
        ...req.query,
        total,
      });

      const stockList = await Stock.findAll({
        offset: begin,
        limit: size,
        attributes: [
          "id",
          "enable",
          "code",
          "name",
          "series_id",
          "supplier_id",
          "block",
          "absorption",
          "description",
          "create_time",
        ],
        raw: true,
      });

      const MDEdict = {
        material: [Material, Stock_Material],
        design: [Design, Stock_Design],
        environment: [Environment, Stock_Environment],
      };

      const list = await Promise.all(
        stockList.map(async (stockData) => {
          const { id, series_id, supplier_id, enable } = stockData;
          // option raw will cause sequlize query give 0 or 1
          stockData.enable = !!enable;

          // get material, design, environment data
          await Promise.all(
            Object.entries(MDEdict).map(async ([name, models]) => {
              const idList = await models[1].findAll({
                where: {
                  stock_id: id,
                },
                attributes: [`${name}_id`],
                raw: true,
              });

              stockData[name] = await models[0].findAll({
                where: {
                  id: idList.map((item) => item[`${name}_id`]),
                },
                attributes: ["name", "id", "enable"],
                raw: true,
              });
            })
          );

          stockData.series = await Series.findByPk(series_id);
          stockData.supplier = await Supplier.findByPk(supplier_id);

          const colorList = await StockColor.findAll({
            where: { stock_id: id },
            attributes: [
              "id",
              "name",
              "color_name_id",
              "stock_image",
              "stock_image_name",
              "color_image",
              "color_image_name",
              "removal_image",
              "removal_image_name",
            ],
            raw: true,
          });

          const colorSchemeSet = new Map();
          stockData.colorList = await Promise.all(
            colorList.map(async (colorData) => {
              const { id } = colorData;

              // will give array like: [{color_scheme_id: id}, {color_scheme_id: id}, ...]
              const colorSchemeIdList = await StockColor_ColorScheme.findAll({
                where: {
                  stock_color_id: id,
                },
                attributes: ["color_scheme_id"],
                raw: true,
              });

              colorData.colorSchemeList = await Promise.all(
                colorSchemeIdList.map(async ({ color_scheme_id }) => {
                  const scheme = await ColorScheme.findOne({
                    where: {
                      id: color_scheme_id,
                    },
                    attributes: ["id", "enable", "name"],
                    raw: true,
                  });
                  colorSchemeSet.set(scheme.id, scheme);
                  return scheme;
                })
              );

              return colorData;
            })
          );

          stockData.colorScheme = [...colorSchemeSet.values()];

          return stockData;
        })
      );

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
  update: [
    uploadStockImage.any(),
    (req, res, next) => {
      req.files = req.files.reduce(
        (dict, fileData) => ({
          ...dict,
          [fileData.fieldname]: { ...fileData },
        }),
        {}
      );
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
        StockColor_ColorScheme,
      } = req.app;

      const { validateStock: validator } = allValidator;

      const validatedData = await validator({
        ...req.body,
        series_id: req.body.series,
        supplier_id: not0Falsy2Undefined(JSON.parse(req.body.supplier)),
      });

      if (validatedData === false) return res.response(400, "Invalid format.");

      const { id: stockId } = req.body;
      if (isNaN(parseInt(stockId))) return res.response(400, "Invalid id.");

      const { create_name, create_id, modify_name, modify_id } = req.body;
      const author = { create_name, create_id, modify_name, modify_id };

      const result = { message: "success updated: " };
      try {
        const preserveIds = [];

        req.body.colorList &&
          (await Promise.all(
            toArray(req.body.colorList).map(async (rawData) => {
              const color = JSON.parse(rawData);
              const { id: colorId, color_name_id, colorSchemes } = color;
              const isNewColor = colorId < 0;

              const { name } = await ColorName.findByPk(color_name_id);
              if (!name) {
                const wrongNameError = new Error("Invalid name id.");
                wrongNameError.name = "wrongNameId";
                throw wrongNameError;
              }

              const newData = {
                ...(isNewColor ? {} : { id: colorId }),
                stock_id: stockId,
                color_name_id,
                name,
                ...author,
                ...["stock", "color", "removal"].reduce(
                  (imageDict, name, index) => {
                    if (!req.files[`colorImages_${colorId}_${index}`]) {
                      if (!isNewColor) return imageDict;
                      const loseImageError = new Error(`Lose ${name} image.`);
                      loseImageError.name = "ImageLose";
                      throw loseImageError;
                    }
                    return {
                      ...imageDict,
                      [`${name}_image_name`]:
                        req.files[`colorImages_${colorId}_${index}`]
                          .originalname,
                      [`${name}_image`]: transFilePath(
                        req.files[`colorImages_${colorId}_${index}`].path
                      ),
                    };
                  },
                  {}
                ),
              };

              const stock_color_id = await {
                async true() {
                  const { id } = await StockColor.create(newData);
                  return id;
                },
                async false() {
                  await StockColor.update(newData, { where: { id: colorId } });
                  return colorId;
                },
              }[isNewColor.toString()]();
              preserveIds.push(stock_color_id);

              const insert_data = colorSchemes.reduce((list, scheme) => {
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
              await StockColor_ColorScheme.bulkCreate(insert_data, {
                updateOnDuplicate: Object.keys(author),
              });
              !isNewColor &&
                (await StockColor_ColorScheme.destroy({
                  where: {
                    stock_color_id,
                    color_scheme_id: {
                      [Op.notIn]: colorSchemes,
                    },
                  },
                }));
            })
          ));
        result.message += "color schemes, ";

        // save material, design, environment
        await Promise.all(
          Object.entries({
            material: Stock_Material,
            design: Stock_Design,
            environment: Stock_Environment,
          }).map(async ([modelName, Model]) => {
            const listData = req.body[modelName] ?? [];
            const insert_data = toArray(listData).reduce(
              (list, id) =>
                not0Falsy2Undefined(id) === undefined
                  ? list
                  : [
                      ...list,
                      {
                        ...author,
                        stock_id: stockId,
                        [`${modelName}_id`]: +not0Falsy2Undefined(id),
                      },
                    ],
              []
            );

            Model.removeAttribute("id");
            await Model.bulkCreate(insert_data, {
              updateOnDuplicate: Object.keys(author),
            });

            await Model.destroy({
              where: {
                stock_id: stockId,
                [`${modelName}_id`]: {
                  [Op.notIn]: toArray(listData),
                },
              },
            });
            result.message += `"${modelName}", `;
          })
        );

        await Stock.update(validatedData, {
          where: { id: stockId },
        });
        result.message += "stock, ";

        try {
          const imagePath = await StockColor.findAll({
            where: {
              stock_id: stockId,
              id: {
                [Op.notIn]: preserveIds,
              },
            },
            attributes: ["stock_image", "color_image", "removal_image"],
          });

          await Promise.all(
            imagePath.map(async (item) => {
              ["stock_image", "color_image", "removal_image"].map((name) => {
                const path = filePathAppend(item[name]).replace(/\\/g, "/");
                // fs.access(path);
                fs.unlink(path);
              });
            })
          );
        } catch (error) {
          console.warn(error);
        }

        await StockColor.destroy({
          where: {
            stock_id: stockId,
            id: {
              [Op.notIn]: preserveIds,
            },
          },
        });
        result.message += "stock color.";

        res.response(200, result.message);
      } catch (error) {
        // log sql message with error.original.sqlMessage
        console.log(error);
        if (["ImageLose", "wrongNameId"].includes(error.name))
          return res.response(400, error.message);

        res.response(500, `Internal server error and ${result.message}.`);
      }
    },
  ],
};
