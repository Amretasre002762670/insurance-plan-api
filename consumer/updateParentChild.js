const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({
    node: 'http://localhost:9200',
    log: 'trace',
});

async function updateParentDocument(indexName, data) {
    try {
        await esClient.index({
            index: indexName,
            id: data.objectId,
            body: {
                doc: data,
            },
            refresh: 'wait_for',
        });

        console.log(`Parent document updated successfully for plan ID: ${data.objectId}`);
    } catch (error) {
        console.error(`Error updating parent document for plan ID '${data.objectId}': ${error}`);
    }
}

// async function updateChildDocuments(indexName, child, parentId) {
//     try {
//         await esClient.index({
//             index: indexName,
//             // type: '_doc',
//             id: child.objectId,
//             body: {
//                 ...child,
//                 plan_join: { name: 'linkedPlanServices', parent: `${parentId}` },
//             },
//             routing: parentId,
//             refresh: 'wait_for',
//         });

//         // Update linkedService
//         await esClient.index({
//             index: indexName,
//             // type: '_doc',
//             id: child.linkedService.objectId,
//             body: {
//                 ...child.linkedService,
//                 plan_join: { name: 'linkedService', parent: `${child.objectId}` },
//             },
//             routing: child.objectId,
//             refresh: 'wait_for',
//         });

//         // Update planserviceCostShares
//         await esClient.index({
//             index: indexName,
//             // type: '_doc',
//             id: child.planserviceCostShares.objectId,
//             body: {
//                 ...child.planserviceCostShares,
//                 plan_join: { name: 'planserviceCostShares', parent: `${child.objectId}` },
//             },
//             routing: child.objectId,
//             refresh: 'wait_for',
//         });

//         console.log(`Child documents updated successfully for linkedPlanServices ID: ${child.objectId}`);
//     } catch (error) {
//         console.error(`Error updating child documents for linkedPlanServices ID '${child.objectId}': ${error}`);
//     }
// }

async function updateChildDocuments(indexName, child, parentId) {
    try {
        // Retrieve the existing document
        const existingDoc = await esClient.get({
            index: indexName,
            id: parentId,
        });

        // Modify the linkedPlanServices array
        if (!existingDoc._source.linkedPlanServices) {
            existingDoc._source.linkedPlanServices = [];
        }
        existingDoc._source.linkedPlanServices.push(child);

        // Update the document with the modified linkedPlanServices array
        // await esClient.index({
        //     index: indexName,
        //     id: parentId,
        //     body: {
        //         ...existingDoc._source,
        //     },
        //     refresh: 'wait_for',
        // });

        // await esClient.index({
        //     index: indexName,
        //     // type: '_doc',
        //     id: child.objectId,
        //     body: {
        //         ...child,
        //         plan_join: { name: 'linkedPlanServices', parent: `${parentId}` },
        //     },
        //     routing: parentId,
        //     refresh: 'wait_for',
        // });

        // // Update linkedService
        // await esClient.index({
        //     index: indexName,
        //     // type: '_doc',
        //     id: child.linkedService.objectId,
        //     body: {
        //         ...child.linkedService,
        //         plan_join: { name: 'linkedService', parent: `${child.objectId}` },
        //     },
        //     routing: child.objectId,
        //     refresh: 'wait_for',
        // });

        // // Update planserviceCostShares
        // await esClient.index({
        //     index: indexName,
        //     // type: '_doc',
        //     id: child.planserviceCostShares.objectId,
        //     body: {
        //         ...child.planserviceCostShares,
        //         plan_join: { name: 'planserviceCostShares', parent: `${child.objectId}` },
        //     },
        //     routing: child.objectId,
        //     refresh: 'wait_for',
        // });

        // Update the document with the modified linkedPlanServices array
        await esClient.index({
            index: indexName,
            id: parentId,
            body: {
                ...existingDoc._source,
            },
            routing: parentId,   
            refresh: 'wait_for',
        });

        await esClient.index({
            index: indexName,
            // type: '_doc',
            id: child.objectId,
            body: {
              ...child,
              plan_join: { name: 'linkedPlanServices', parent: `${parentId}` },
            },
            routing: parentId,
            refresh: 'wait_for',
          });

        // Update linkedService
        // await esClient.index({
        //     index: indexName,
        //     id: child.objectId,
        //     body: {
        //         ...child,
        //         plan_join: { name: 'linkedService', parent: `${parentId}` },
        //     },
        //     routing: parentId,
        //     refresh: 'wait_for',
        // });

        // Now, update the child documents
        // await esClient.index({
        //     index: indexName,
        //     id: child.objectId,
        //     body: {
        //         ...child,
        //         plan_join: { name: 'linkedPlanServices', parent: `${parentId}` },
        //     },
        //     routing: parentId,
        //     refresh: 'wait_for',
        // });

        // Update linkedService
        await esClient.index({
            index: indexName,
            id: child.linkedService.objectId,
            body: {
                ...child.linkedService,
                plan_join: { name: 'linkedService', parent: `${child.objectId}` },
            },
            routing: child.objectId,
            refresh: 'wait_for',
        });

        // Update planserviceCostShares
        await esClient.index({
            index: indexName,
            id: child.planserviceCostShares.objectId,
            body: {
                ...child.planserviceCostShares,
                plan_join: { name: 'planserviceCostShares', parent: `${child.objectId}` },
            },
            routing: child.objectId,
            refresh: 'wait_for',
        });


        console.log(`Child documents updated successfully for linkedPlanServices ID: ${child.objectId}`);
    } catch (error) {
        console.error(`Error updating child documents for linkedPlanServices ID '${child.objectId}': ${error}`);
    }
}


async function patchAndUpdateElasticsearch(data) {
    let indexName = "plan";
    console.log("data inside Patch", data.update);
    //Update child documents in Elasticsearch
    //   if (data.update && data.update.length > 0) {
    //     for (const child of data.update) {
    //       await updateChildDocuments(indexName, child, data.planID);
    //     }
    //   }

    await updateChildDocuments(indexName, data.update, data.planID);

    // await esClient.index({
    //     index: indexName,
    //     type: '_doc',
    //     id: data.update.objectId,
    //     body: {
    //         doc: data.update,
    //     },
    //     routing:  data.planID,
    //     refresh: 'wait_for',
    // });

    // console.log(`Document created successfully for ID: ${child.objectId}`)

    console.log('PATCH operation and Elasticsearch update completed successfully.');
}

module.exports = {
    patchAndUpdateElasticsearch,
};
