const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({
    node: 'http://localhost:9200',
    log: 'trace',
});

async function updateParentDocument(indexName, data) {
    try {
        await esClient.update({
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

async function updateChildDocuments(indexName, child, parentId) {
    try {
        await esClient.update({
            index: indexName,
            type: '_doc',
            id: child.objectId,
            body: {
                doc: child,
            },
            routing: parentId,
            refresh: 'wait_for',
        });

        // Update linkedService
        await esClient.update({
            index: indexName,
            type: '_doc',
            id: child.linkedService.objectId,
            body: {
                doc: child.linkedService,
            },
            routing: child.objectId,
            refresh: 'wait_for',
        });

        // Update planserviceCostShares
        await esClient.update({
            index: indexName,
            type: '_doc',
            id: child.planserviceCostShares.objectId,
            body: {
                doc: child.planserviceCostShares,
            },
            routing: child.linkedService.objectId,
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
    //   await updateParentDocument(indexName, data);

    //   //Update child documents in Elasticsearch
    //   if (data.update && data.update.length > 0) {
    //     for (const child of data.update) {
    //       await updateChildDocuments(indexName, child, data.planID);
    //     }
    //   }

    await esClient.index({
        index: indexName,
        type: '_doc',
        id: data.update.objectId,
        body: {
            doc: data.update,
        },
        routing:  data.planID,
        refresh: 'wait_for',
    });

    // console.log(`Document created successfully for ID: ${child.objectId}`)

    console.log('PATCH operation and Elasticsearch update completed successfully.');
}

module.exports = {
    patchAndUpdateElasticsearch,
};
