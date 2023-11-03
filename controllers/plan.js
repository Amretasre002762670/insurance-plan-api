const objectHash = require('object-hash');

const { validateFullPlan } = require("../validator/planFullValidator.js");
const { validateLinkedPlanService } = require("../validator/linkedPlanServiceValidator.js");


const addLinkedPlanService = async (client, linkedPlanServices, res) => {
    const linkedPlanServiceArr = [];
    if (linkedPlanServices.length > 0) {
        for (let service of linkedPlanServices) {
            let serviceObj = {};
            let service_id = service.objectId;
            if (service.linkedService) {
                const linkedService_id = service.linkedService.objectId;
                serviceObj.linkedService = linkedService_id;
                client.set(`linkedService-${linkedService_id}`, JSON.stringify(service.linkedService))
                    .then(() => {
                        console.log("linkedService added");
                    }).catch((err) => {
                        console.error('Error storing linkedService data in Redis:', err);
                        res.status(500).json({ error: 'Internal Server Error for linkedService' });
                    })
            }
            if (service.planserviceCostShares) {
                const planserviceCostShares_id = service.planserviceCostShares.objectId;
                serviceObj.planserviceCostShares = planserviceCostShares_id;
                client.set(`planserviceCostShares-${planserviceCostShares_id}`, JSON.stringify(service.planserviceCostShares))
                    .then(() => {
                        console.log("planserviceCostShares added");
                    }).catch((err) => {
                        console.error('Error storing planserviceCostShares data in Redis:', err);
                        res.status(500).json({ error: 'Internal Server Error for planserviceCostShares' });
                    })
            }
            serviceObj._org = service._org;
            serviceObj.objectId = service_id;
            serviceObj.objectType = service.objectType;
            // console.log(serviceObj, "service objs");
            linkedPlanServiceArr.push(serviceObj);
        }
    }
    // console.log(linkedPlanServiceArr)

    return linkedPlanServiceArr;
}

// const getPlan = async (req, res, client) => {
//     try {
//         const objectId = req.params.objectId;

//         const plan = await client.get(`plan-${objectId}`);

//         if (!plan) {
//             return res.status(404).json({ message: 'Plan not found' });
//         }

//         const parsedPlan = JSON.parse(plan);

//         const planCostSharesData = await client.get(`planCostShares-${objectId}`);
//         parsedPlan.planCostShares = JSON.parse(planCostSharesData);

//         const linkedPlanServices = await client.get(`linkedPlanServices-${objectId}`);

//         if (!linkedPlanServices) {
//             return res.status(404).json({ message: 'LinkedPlanServices not found' });
//         }

//         const parsedLinkedPlanServices = JSON.parse(linkedPlanServices);
//         // console.log(parsedLinkedPlanServices);
//         if (parsedLinkedPlanServices.length > 0) {
//             for (const service of parsedLinkedPlanServices) {
//                 if (service.linkedService) {
//                     const linkedService = await client.get(`linkedService-${service.linkedService}`);
//                     service.linkedService = JSON.parse(linkedService);
//                 }
//                 if (service.planserviceCostShares) {
//                     const planserviceCostShares = await client.get(`planserviceCostShares-${service.planserviceCostShares}`);
//                     service.planserviceCostShares = JSON.parse(planserviceCostShares);
//                 }
//             }
//             // console.log(parsedLinkedPlanServices, "iniside get plan");
//             parsedPlan.linkedPlanServices = parsedLinkedPlanServices;

//             res.status(200).json({ data: parsedPlan });
//         }

//     } catch (error) {
//         console.error('Error retrieving data from Redis:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }

// }

const deleteLinkedService = async (objectId, client) => {
    // Fetch the linkedPlanServices associated with the plan
    const linkedPlanServicesData = await client.get(`linkedPlanServices-${objectId}`);
    if (linkedPlanServicesData) {
        const linkedPlanServices = JSON.parse(linkedPlanServicesData);

        // Delete each linked service and plan service cost shares
        if (linkedPlanServices.length > 0) {
            for (const service of linkedPlanServices) {
                if (service.linkedService) {
                    const linkedServiceId = service.linkedService;
                    await client.del(`linkedService-${linkedServiceId}`)
                        .then(() => {
                            console.log("Deleted linked service")
                        })
                        .catch((err) => {
                            console.error(err);
                        })
                }
                if (service.planserviceCostShares) {
                    const planServiceCostSharesId = service.planserviceCostShares;
                    await client.del(`planserviceCostShares-${planServiceCostSharesId}`)
                        .then(() => {
                            console.log("Deleted plan service cost shares")
                        })
                        .catch((err) => {
                            console.error(err);
                        })
                }
            }
        }

    }
}

const conditionalGetPlan = async (req, res, client) => {
    const ifNoneMatch = req.header('If-None-Match');
    try {
        const objectId = req.params.objectId;

        const plan = await client.get(`plan-${objectId}`);

        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        const parsedPlan = JSON.parse(plan);

        const planCostSharesData = await client.get(`planCostShares-${objectId}`);
        parsedPlan.planCostShares = JSON.parse(planCostSharesData);

        const linkedPlanServices = await client.get(`linkedPlanServices-${objectId}`);

        if (!linkedPlanServices) {
            return res.status(404).json({ message: 'LinkedPlanServices not found' });
        }

        const parsedLinkedPlanServices = JSON.parse(linkedPlanServices);
        if (parsedLinkedPlanServices.length > 0) {
            for (const service of parsedLinkedPlanServices) {
                if (service.linkedService) {
                    const linkedService = await client.get(`linkedService-${service.linkedService}`);
                    service.linkedService = JSON.parse(linkedService);
                }
                if (service.planserviceCostShares) {
                    const planserviceCostShares = await client.get(`planserviceCostShares-${service.planserviceCostShares}`);
                    service.planserviceCostShares = JSON.parse(planserviceCostShares);
                }
            }
            // console.log(parsedLinkedPlanServices, "iniside get plan");
            parsedPlan.linkedPlanServices = parsedLinkedPlanServices;

            // console.log(ifNoneMatch === undefined, "if there is no ifNoneMatch header")
            if (ifNoneMatch && ifNoneMatch === objectHash(parsedPlan)) {
                return res.status(304).send({
                    status: "Not matched",
                    message: "No changes made for the given plan id"
                });
            } else if (ifNoneMatch && ifNoneMatch != objectHash(parsedPlan)) {
                return res.status(200).json({ data: parsedPlan });
            } else if (ifNoneMatch === undefined) {
                return res.status(200).json({ data: parsedPlan });
            } else {
                return res.status(500).json({ error: 'Error in retriving plan' });
            }

        }

    } catch (error) {
        console.error('Error retrieving data from Redis:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }



}

const postPlan = async (req, res, client) => {
    try {

        req.body.objectId = req.params.objectId;
        req.body.planType = req.params.planType;
        const planCostShares = req.body.planCostShares;
        const linkedPlanServices = req.body.linkedPlanServices;

        const isPlanValid = validateFullPlan(req.body);


        if (!isPlanValid) {
            res.status(400).json({
                status: 'Bad Request',
                message: 'The body does not match the plan schema definition'
            })
        }
        else {
            const plan_id = req.body.objectId;
            const planCostShares_id = req.body.planCostShares.objectId;
            // const linkedPlanServices_id = req.body.linkedPlanServices.objectId;
            const etag = objectHash(req.body);
            let plan = req.body;

            client.set(`planCostShares-${plan_id}`, JSON.stringify(planCostShares))
                .then(async () => {
                    plan.planCostShares = `planCostShares-${planCostShares_id}`;
                    const linkedPlanServicesArr = await addLinkedPlanService(client, linkedPlanServices, res);
                    client.set(`linkedPlanServices-${plan_id}`, JSON.stringify(linkedPlanServicesArr))
                        .then(() => {
                            plan.linkedPlanServices = linkedPlanServicesArr;
                            // console.log(plan, "plan");
                            client.set(`plan-${plan_id}`, JSON.stringify(plan))
                                .then(() => {
                                    // res.setHeader("Etag", objectHash(plan));
                                    console.log('Data stored in Redis successfully');
                                    // const etag = objectHash(JSON.stringify(plan));
                                    console.log('etag', etag);
                                    res.set('ETag', etag);
                                    res.status(201).json({
                                        message: 'Plan created successfully'
                                    });
                                })
                                .catch(() => {
                                    console.error('Error storing plan data in Redis:', planErr);
                                    res.status(500).json({ error: 'Internal Server Error for the final plan' });
                                })
                        })
                        .catch(() => {
                            console.error('Error storing linkedPlanServices data in Redis:', linkedPlanServicesErr);
                            res.status(500).json({ error: 'Internal Server Error for linkedPlanServices' });
                        })

                })
                .catch((err) => {
                    console.error('Error storing planCostShares data in Redis:', err);
                    res.status(500).json({ error: 'Internal Server Error for planCostShares' });
                })
        }

    } catch (err) {
        res.status(500).json({
            message: "error",
            error: err
        })
    }

}

const deletePlan = async (req, res, client) => {
    try {
        const objectId = req.params.objectId;

        const planExists = await client.exists(`plan-${objectId}`);

        if (!planExists) {
            return res.status(404).json({
                message: `Plan with id ${objectId} does not exist`
            });
        }
        deleteLinkedService(objectId, client);

        await client.del(`plan-${objectId}`);
        await client.del(`planCostShares-${objectId}`);
        await client.del(`linkedPlanServices-${objectId}`);

        res.status(204).json({
            message: `Plan with id ${objectId} deleted successfully`
        });
    } catch (err) {
        console.error('Error deleting data from Redis:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const addLinkedPlan = async (req, res, client) => {
    try {
        const plan_id = req.params.objectId;
        const newLinkedPlanService = req.body;

        const isLinkedPlanServiceValid = validateLinkedPlanService(newLinkedPlanService);

        if (!isLinkedPlanServiceValid) {
            res.status(400).json({
                status: 'Bad Request',
                message: 'The body does not match the plan schema definition'
            })
        } else {
            const addLinkedPlanService = {};

            // Retrieve the existing plan from Redis
            const existingPlan = await client.get(`plan-${plan_id}`);
            if (!existingPlan) {
                console.log("inside error")
                return res.status(404).json({
                    status: 'Not Found',
                    message: 'Plan not found in Redis',
                });
            } else {
                // Parse the existing plan
                let plan = JSON.parse(existingPlan);

                // Handle linkedService update or addition
                if (newLinkedPlanService.linkedService) {
                    const linkedService = newLinkedPlanService.linkedService;
                    addLinkedPlanService.linkedService = linkedService.objectId;
                    // Update or add linkedService to Redis
                    client.set(`linkedService-${linkedService.objectId}`, JSON.stringify(linkedService))
                        .then(() => {
                            console.log("linkedService added/updated in Redis");
                        })
                        .catch((err) => {
                            console.error('Error storing linkedService data in Redis:', err);
                            return res.status(500).json({ error: 'Internal Server Error for linkedService' });
                        });
                }

                // Handle planserviceCostShares update or addition
                if (newLinkedPlanService.planserviceCostShares) {
                    const planserviceCostShares = newLinkedPlanService.planserviceCostShares;
                    addLinkedPlanService.planserviceCostShares = planserviceCostShares.objectId;

                    // Update or add planserviceCostShares to Redis
                    client.set(`planserviceCostShares-${planserviceCostShares.objectId}`, JSON.stringify(planserviceCostShares))
                        .then(() => {
                            console.log("planserviceCostShares added/updated in Redis");
                        })
                        .catch((err) => {
                            console.error('Error storing planserviceCostShares data in Redis:', err);
                            return res.status(500).json({ error: 'Internal Server Error for planserviceCostShares' });
                        });
                }

                addLinkedPlanService._org = newLinkedPlanService._org;
                addLinkedPlanService.objectId = newLinkedPlanService.objectId;
                addLinkedPlanService.objectType = newLinkedPlanService.objectType;

                const existLinkedPlanService = await client.get(`linkedPlanServices-${plan.objectId}`);

                if (existLinkedPlanService) {
                    // console.log("\n");
                    let parsedLinkedPlanServiceArr = JSON.parse(existLinkedPlanService);
                    parsedLinkedPlanServiceArr.push(addLinkedPlanService);
                    // console.log(parsedLinkedPlanServiceArr, "existLinkedPlanService");
                    client.set(`linkedPlanServices-${plan.objectId}`, JSON.stringify(parsedLinkedPlanServiceArr))
                        .then(() => {
                            console.log("planserviceCostShares added/updated in Redis");
                            plan.linkedPlanServices = parsedLinkedPlanServiceArr;
                            console.log(plan, "plan");
                            client.set(`plan-${plan.objectId}`, JSON.stringify(plan))
                                .then(() => {
                                    console.log('Data stored in Redis successfully');
                                    return res.status(200).json({
                                        message: 'Updated plan with new LinkedPlanService'
                                    });
                                })
                                .catch(() => {
                                    console.error('Error storing plan data in Redis:', planErr);
                                    return res.status(500).json({ error: 'Internal Server Error when adding linkedPlanService' });
                                })
                        })
                        .catch((err) => {
                            console.error('Error storing planserviceCostShares data in Redis:', err);
                            return res.status(500).json({ error: 'Internal Server Error for planserviceCostShares' });
                        });

                }
            }
        }





    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Error in Patch call',
        });
    }
}

const conditionalAddLinkedPlanService = async (req, res, client) => {
    const ifMatch = req.header('If-Match');
    try {
        const plan_id = req.params.objectId;
        const newLinkedPlanService = req.body;

        const isLinkedPlanServiceValid = validateLinkedPlanService(newLinkedPlanService);

        if (!isLinkedPlanServiceValid) {
            res.status(400).json({
                status: 'Bad Request',
                message: 'The body does not match the plan schema definition'
            })
        } else {
            const addLinkedPlanService = {};

            // Retrieve the existing plan from Redis
            const existingPlan = await client.get(`plan-${plan_id}`);
            if (!existingPlan) {
                console.log("inside error")
                return res.status(404).json({
                    status: 'Not Found',
                    message: 'Plan not found in Redis',
                });
            } else {
                // Parse the existing plan
                let plan = JSON.parse(existingPlan);

                const planCostSharesData = await client.get(`planCostShares-${plan_id}`);
                plan.planCostShares = JSON.parse(planCostSharesData);

                const linkedPlanServices = await client.get(`linkedPlanServices-${plan_id}`);
                const parsedLinkedPlanServices = JSON.parse(linkedPlanServices);
                const existingLinkedPlanServices = JSON.parse(linkedPlanServices);;

                if (parsedLinkedPlanServices.length > 0) {
                    for (const service of parsedLinkedPlanServices) {
                        if (service.linkedService) {
                            const linkedService = await client.get(`linkedService-${service.linkedService}`);
                            service.linkedService = JSON.parse(linkedService);
                        }
                        if (service.planserviceCostShares) {
                            const planserviceCostShares = await client.get(`planserviceCostShares-${service.planserviceCostShares}`);
                            service.planserviceCostShares = JSON.parse(planserviceCostShares);
                        }
                    }
                    // console.log(parsedLinkedPlanServices, "iniside get plan");
                    plan.linkedPlanServices = parsedLinkedPlanServices;
                    console.log(ifMatch, objectHash(plan), " Checking if etag matches");
                    if (ifMatch && ifMatch != objectHash(plan)) {
                        return res.status(412).send({
                            status: "Precondition Failed.",
                            message: "Plan has been modified"
                        });
                    } else {
                        parsedLinkedPlanServices.push(newLinkedPlanService);
                        // existingPlan.linkedPlanServices = parsedLinkedPlanServices;
                        plan.linkedPlanServices = parsedLinkedPlanServices;
                        console.log(plan, " updated plan");
                        // console.log(existingPlan, " updated existing plan");
                        const etag = objectHash(plan)
                        console.log(parsedLinkedPlanServices, "Added linked plan service to actual object");
                        // Handle linkedService update or addition
                        if (newLinkedPlanService.linkedService) {
                            const linkedService = newLinkedPlanService.linkedService;
                            addLinkedPlanService.linkedService = linkedService.objectId;
                            // Update or add linkedService to Redis
                            client.set(`linkedService-${linkedService.objectId}`, JSON.stringify(linkedService))
                                .then(() => {
                                    console.log("linkedService added/updated in Redis");
                                })
                                .catch((err) => {
                                    console.error('Error storing linkedService data in Redis:', err);
                                    return res.status(500).json({ error: 'Internal Server Error for linkedService' });
                                });
                        }

                        // Handle planserviceCostShares update or addition
                        if (newLinkedPlanService.planserviceCostShares) {
                            const planserviceCostShares = newLinkedPlanService.planserviceCostShares;
                            addLinkedPlanService.planserviceCostShares = planserviceCostShares.objectId;

                            // Update or add planserviceCostShares to Redis
                            client.set(`planserviceCostShares-${planserviceCostShares.objectId}`, JSON.stringify(planserviceCostShares))
                                .then(() => {
                                    console.log("planserviceCostShares added/updated in Redis");
                                })
                                .catch((err) => {
                                    console.error('Error storing planserviceCostShares data in Redis:', err);
                                    return res.status(500).json({ error: 'Internal Server Error for planserviceCostShares' });
                                });
                        }
                        addLinkedPlanService._org = newLinkedPlanService._org;
                        addLinkedPlanService.objectId = newLinkedPlanService.objectId;
                        addLinkedPlanService.objectType = newLinkedPlanService.objectType;
                        existingLinkedPlanServices.push(addLinkedPlanService);
                        console.log(existingLinkedPlanServices, "exiting linked plan service");
                        client.set(`linkedPlanServices-${plan.objectId}`, JSON.stringify(existingLinkedPlanServices))
                            .then(() => {
                                console.log("planserviceCostShares added/updated in Redis");
                                plan.linkedPlanServices = existingLinkedPlanServices;
                                client.set(`plan-${plan.objectId}`, JSON.stringify(plan))
                                    .then(() => {
                                        console.log('Data stored in Redis successfully');
                                        res.set("ETag", etag)
                                        return res.status(200).json({
                                            message: 'Updated plan with new LinkedPlanService'
                                        });
                                    })
                                    .catch(() => {
                                        console.error('Error storing plan data in Redis:', planErr);
                                        return res.status(500).json({ error: 'Internal Server Error when adding linkedPlanService' });
                                    })
                            })
                            .catch((err) => {
                                console.error('Error storing planserviceCostShares data in Redis:', err);
                                return res.status(500).json({ error: 'Internal Server Error for planserviceCostShares' });
                            });

                    }
                }


            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Error in Patch call',
        });
    }
}

module.exports = {
    // getPlan,
    conditionalGetPlan,
    postPlan,
    deletePlan,
    addLinkedPlan,
    conditionalAddLinkedPlanService,
    // updatePlan
}