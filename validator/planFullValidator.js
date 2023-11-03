const AJV = require('ajv');

const ajv = new AJV();

// Load the schemas
const planFullSchema = require('../schema/planFullSchema.json');

const validateFullPlan = ajv.compile(planFullSchema);

module.exports = {
    validateFullPlan
}
