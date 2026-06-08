"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMutationOperations = createMutationOperations;
const query_builder_1 = require("../query-builder");
const input_types_1 = require("../input-types");
function createMutationOperations(client) {
    return {
        provisionBucket: (args, options) => new query_builder_1.QueryBuilder({
            client,
            operation: 'mutation',
            operationName: 'ProvisionBucket',
            fieldName: 'provisionBucket',
            ...(0, query_builder_1.buildCustomDocument)('mutation', 'ProvisionBucket', 'provisionBucket', options.select, args, [
                {
                    name: 'input',
                    type: 'ProvisionBucketInput!',
                },
            ], input_types_1.connectionFieldsMap, 'ProvisionBucketPayload'),
        }),
    };
}
