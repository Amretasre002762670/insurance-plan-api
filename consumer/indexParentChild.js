const elasticsearch = require('elasticsearch');

const esClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace',
});

const indexParentDocument = async (indexName, data) => {
  await esClient.index({
    index: indexName,
    id: data.objectId,
    body: {
      ...data,
      plan_join: { name: 'plan' },
    },
    refresh: 'wait_for',
  });
};

const indexPlanCostShares = async (indexName, planCostShares, parentId) => {
  await esClient.index({
    index: indexName,
    // type: '_doc',
    id: planCostShares.objectId,
    body: {
      ...planCostShares,
      plan_join: { name: 'planCostShares', parent: `${parentId}` },
    },
    routing: parentId,
    refresh: 'wait_for',
  });
};

const indexLinkedPlanService = async (indexName, child, parentId) => {
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

  // Index linkedService
  await esClient.index({
    index: indexName,
    // type: '_doc',
    id: child.linkedService.objectId,
    body: {
      ...child.linkedService,
      plan_join: { name: 'linkedService', parent: `${child.objectId}` },
    },
    routing: child.objectId,
    refresh: 'wait_for',
  });

  // Index planserviceCostShares
  await esClient.index({
    index: indexName,
    // type: '_doc',
    id: child.planserviceCostShares.objectId,
    body: {
      ...child.planserviceCostShares,
      plan_join: { name: 'planserviceCostShares', parent: `${child.objectId}` },
    },
    routing: child.linkedService.objectId,
    refresh: 'wait_for',
  });
};

const createIndex = async (data) => {
  try {
    const indexName = 'plan';

    // Create index with mappings
    // await esClient.indices.create({
    //   index: indexName,
    //   body: {
    //     settings: {
    //       index: {
    //         number_of_shards: 1,
    //         number_of_replicas: 1,
    //       },
    //     },
    //     mappings: {
    //       properties: {
    //         _org: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
    //         copay: { type: 'integer' },
    //         creationDate: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
    //         deductible: { type: 'integer' },
    //         linkedPlanServices: {
    //           properties: {
    //             _org: { type: 'text' },
    //             objectId: { type: 'keyword' },
    //             objectType: { type: 'text' },
    //           },
    //         },
    //         linkedService: {
    //           properties: {
    //             _org: { type: 'text' },
    //             name: { type: 'text' },
    //             objectId: { type: 'keyword' },
    //             objectType: { type: 'text' },
    //           },
    //         },
    //         name: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
    //         objectId: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
    //         objectType: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
    //         plan: {
    //           properties: {
    //             _org: { type: 'text' },
    //             creationDate: { type: 'date', format: 'MM-dd-yyyy' },
    //             objectId: { type: 'keyword' },
    //             objectType: { type: 'text' },
    //             planType: { type: 'text' },
    //           },
    //         },
    //         planCostShares: {
    //           properties: {
    //             _org: { type: 'text' },
    //             copay: { type: 'integer' },
    //             deductible: { type: 'integer' },
    //             objectId: { type: 'keyword' },
    //             objectType: { type: 'text' },
    //           },
    //         },
    //         planType: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
    //         join_field: {
    //           type: 'join',
    //           eager_global_ordinals: true,
    //           relations: {
    //             linkedPlanServices: ['linkedService', 'planserviceCostShares'],
    //             plan: ['planCostShares', 'linkedPlanServices'],
    //           },
    //         },
    //         planserviceCostShares: {
    //           properties: {
    //             _org: { type: 'text' },
    //             copay: { type: 'integer' },
    //             deductible: { type: 'integer' },
    //             objectId: { type: 'keyword' },
    //             objectType: { type: 'text' },
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

    await esClient.indices.create({
      index: indexName,
      body: {
        settings: {
          index: {
            number_of_shards: 1,
            number_of_replicas: 1,
          },
        },
        mappings: {
          properties: {
            _org: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
            copay: { type: 'integer' },
            creationDate: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
            deductible: { type: 'integer' },
            plan_join: {
              type: 'join',
              eager_global_ordinals: true,
              relations: {
                // planservice: ['linkedService', 'planserviceCostShares'],
                // plan: ['planCostShares', 'linkedPlanServices'],
                // linkedPlanServices: ["planservice"],
                linkedPlanServices: ['linkedService', 'planserviceCostShares'],
                plan: ['planCostShares', 'linkedPlanServices'],
                // linkedPlanServices: ["planservice"],
              },
            },
            linkedService: {
              properties: {
                _org: { type: 'text' },
                name: { type: 'text' },
                objectId: { type: 'keyword' },
                objectType: { type: 'text' },
              },
            },
            linkedPlanServices: {
              properties: {
                _org: { type: 'text' },
                objectId: { type: 'keyword' },
                objectType: { type: 'text' },
              },
            },
            name: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
            objectId: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
            objectType: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
            plan: {
              properties: {
                _org: { type: 'text' },
                creationDate: { type: 'date', format: 'MM-dd-yyyy' },
                objectId: { type: 'keyword' },
                objectType: { type: 'text' },
                planType: { type: 'text' },
              },
            },
            planCostShares: {
              properties: {
                _org: { type: 'text' },
                copay: { type: 'integer' },
                deductible: { type: 'integer' },
                objectId: { type: 'keyword' },
                objectType: { type: 'text' },
              },
            },
            planType: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
            planserviceCostShares: {
              properties: {
                _org: { type: 'text' },
                copay: { type: 'integer' },
                deductible: { type: 'integer' },
                objectId: { type: 'keyword' },
                objectType: { type: 'text' },
              },
            },
          },
        },
      },
    });
    
    

    await indexParentDocument(indexName, data);

    // Index linkedPlanServices
    if (data.linkedPlanServices && data.linkedPlanServices.length > 0) {
      for (const child of data.linkedPlanServices) {
        await indexLinkedPlanService(indexName, child, data.objectId);
      }
    }

    // Index planCostShares
    if (data.planCostShares) {
      await indexPlanCostShares(indexName, data.planCostShares, data.objectId);
    }

    // Index linkedPlanServices
    // await esClient.index({
    //   index: indexName,
    //   type: '_doc',
    //   id: child.objectId,
    //   body: {
    //     ...child,
    //     join_field: { name: 'linkedPlanServices', parent: 'plan' },
    //   },
    //   routing: data.objectId, // Provide the routing value
    //   refresh: 'wait_for',
    // });

    // // Index linkedService
    // await esClient.index({
    //   index: indexName,
    //   type: '_doc',
    //   id: child.linkedService.objectId,
    //   body: {
    //     ...child.linkedService,
    //     join_field: { name: 'linkedService', parent: 'planservice' },
    //   },
    //   routing: child.objectId, // Provide the routing value
    //   refresh: 'wait_for',
    // });

    // // Index planserviceCostShares
    // await esClient.index({
    //   index: indexName,
    //   type: '_doc',
    //   id: child.planserviceCostShares.objectId,
    //   body: {
    //     ...child.planserviceCostShares,
    //     join_field: { name: 'planserviceCostShares', parent: 'planservice' },
    //   },
    //   routing: child.linkedService.objectId, // Provide the routing value
    //   refresh: 'wait_for',
    // });


    console.log('Index creation and data indexing completed successfully.');
  } catch (error) {
    console.error(`Error creating index and indexing data: ${error}`);
  }
}


// const createIndex = async (data) => {
//   try {
//     // Create index and mappings for 'plan'
//     const indexName = `plan_${data.objectId}`; // Use a fixed index name for better management

//     await esClient.indices.create({
//       index: indexName,
//       body: {
//         mappings: {
//           properties: {
//             join_field: {
//               type: 'join',
//               relations: {
//                 'plan': ['planCostShares', 'linkedPlanServices'],
//                 'linkedPlanServices': ['planservice'],
//                 'planservice': ['linkedService', 'planserviceCostShares']
//               },
//             },
//             name: { type: 'text' },
//             type: { type: 'keyword' },
//             creationDate: { type: 'date', format: 'MM-dd-yyyy' },
//             planType: { type: 'keyword' },
//             _org: { type: 'keyword' },
//           },
//         },
//       },
//     });

//     // Index 'plan'
//     await esClient.index({
//       index: indexName,
//       id: data.objectId,
//       body: {
//         ...data,
//       },
//       refresh: 'wait_for',
//     });

//     // Index 'planCostShares'
//     await esClient.index({
//       index: indexName,
//       type: '_doc',
//       id: data.planCostShares.objectId,
//       routing: data.objectId,
//       body: {
//         ...data.planCostShares,
//         join_field: { name: 'planCostShares', parent: 'plan' },
//       },
//       refresh: 'wait_for',
//     });

//     // Index 'linkedPlanServices'
//     await esClient.index({
//       index: indexName,
//       type: '_doc',
//       // id: data.planCostShares.objectId,
//       routing: data.objectId,
//       body: {
//         ...data.planCostShares,
//         join_field: { name: 'linkedPlanServices', parent: 'plan' },
//       },
//       refresh: 'wait_for',
//     });

//     // Index 'linkedPlanServices'
//     if (data.linkedPlanServices && data.linkedPlanServices.length > 0) {
//       for (const child of data.linkedPlanServices) {
//         // Index 'planservice'
//         await esClient.index({
//           index: indexName,
//           type: '_doc',
//           routing: data.objectId,
//           id: child.objectId,
//           body: {
//             ...child,
//             join_field: { name: 'planservice', parent: 'linkedPlanServices' },
//           },
//           refresh: 'wait_for',
//         });
//         // Index 'linkedService'
//         await esClient.index({
//           index: indexName,
//           type: '_doc',
//           id: child.linkedService.objectId,
//           routing: child.objectId,
//           body: {
//             ...child.linkedService,
//             join_field: { name: 'linkedService', parent: 'planservice' },
//           },
//           refresh: 'wait_for',
//         });

//         // Index 'planserviceCostShares'
//         await esClient.index({
//           index: indexName,
//           type: '_doc',
//           id: child.planserviceCostShares.objectId,
//           routing: child.linkedService.objectId,
//           body: {
//             ...child.planserviceCostShares,
//             join_field: { name: 'planserviceCostShares', parent: 'planservice' },
//           },
//           refresh: 'wait_for',
//         });


//       }
//     }

//     console.log('Index creation and data indexing completed successfully.');
//   } catch (error) {
//     console.error(`Error creating index and indexing data: ${error}`);
//   }
// };

const indexDataWithParentChild = async (data) => {
  console.log("Code has come to indexing");

  console.log("plan id: ", data.objectId);

  await createIndex(data);

};

module.exports = {
  indexDataWithParentChild
}