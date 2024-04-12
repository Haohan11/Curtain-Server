import * as Yup from "yup";
import * as rawValidateSchemas from "./rawValidateSchema.js";

const authorSchema = {
  name: Yup.string().required(),
  create_name: Yup.string().required(),
  create_id: Yup.string().required(),
  modify_name: Yup.string(),
  modify_id: Yup.string(),
};

const validateSchemas = Object.entries(rawValidateSchemas).reduce(
  (dict, [schemaName, schemaContent]) => ({
    ...dict,
    [schemaName]: Yup.object(authorSchema).shape(schemaContent),
  }),
  {}
);

export default validateSchemas;
