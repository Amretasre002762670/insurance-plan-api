const AJV = require('ajv');

const ajv = new AJV();

// Load the schemas
const linkedPlanServiceSchema = require('../schema/linkedPlanServiceSchema.json');

const validateLinkedPlanService = ajv.compile(linkedPlanServiceSchema);

module.exports = {
    validateLinkedPlanService
}
