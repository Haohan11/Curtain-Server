import connectToDatabase from "../model/connectToDatabase.js"
import createSchema from "../model/createSchema.js";

import column from "./data/columns.js";
import AllSchemas from "../model/schema/schema.js";

const { table, name, content } = column;

await (async () => {
    const sequelize = await connectToDatabase();
    createSchema(sequelize, AllSchemas[`${table}Schema`]);

    const querInterface = sequelize.getQueryInterface()

    querInterface.addColumn(AllSchemas[`${table}Schema`].name, name, content)
})()

process.exit();