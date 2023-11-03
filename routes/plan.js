const express = require('express');

const { conditionalGetPlan, postPlan, deletePlan, addLinkedPlan, conditionalAddLinkedPlanService } = require("../controllers/plan")

module.exports = (client) => {

    const router = express.Router();

    // GET
    router.get('/:planType/:objectId', async (req, res) => {
        conditionalGetPlan(req, res, client);
    });

    //POST
    router.post('/:planType/:objectId', async (req, res) => {
        postPlan(req, res, client);
    });

    router.delete('/:planType/:objectId', async (req, res) => {
        deletePlan(req, res, client);
    })

    // router.patch('/:planType/:objectId', async (req, res) => {
    //     addLinkedPlan(req, res, client);
    // })

    router.patch('/:planType/:objectId', async (req, res) => {
        if (req.header("If-Match")) {
            console.log("Inside conditional get")
            conditionalAddLinkedPlanService(req, res, client);
        } else {
            console.log("Inside get")
            addLinkedPlan(req, res, client);
        }
    })

    return router;
}
