"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformFunctionDefinitionModel = void 0;
const query_builder_1 = require("../query-builder");
const input_types_1 = require("../input-types");
class PlatformFunctionDefinitionModel {
    client;
    constructor(client) {
        this.client = client;
    }
    findMany(args) {
        const { document, variables } = (0, query_builder_1.buildFindManyDocument)('PlatformFunctionDefinition', 'platformFunctionDefinitions', args.select, {
            where: args?.where,
            orderBy: args?.orderBy,
            first: args?.first,
            last: args?.last,
            after: args?.after,
            before: args?.before,
            offset: args?.offset,
        }, 'PlatformFunctionDefinitionFilter', 'PlatformFunctionDefinitionOrderBy', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'query',
            operationName: 'PlatformFunctionDefinition',
            fieldName: 'platformFunctionDefinitions',
            document,
            variables,
        });
    }
    findFirst(args) {
        const { document, variables } = (0, query_builder_1.buildFindFirstDocument)('PlatformFunctionDefinition', 'platformFunctionDefinitions', args.select, {
            where: args?.where,
            orderBy: args?.orderBy,
        }, 'PlatformFunctionDefinitionFilter', 'PlatformFunctionDefinitionOrderBy', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'query',
            operationName: 'PlatformFunctionDefinition',
            fieldName: 'platformFunctionDefinition',
            document,
            variables,
            transform: (data) => ({
                platformFunctionDefinition: data.platformFunctionDefinitions?.nodes?.[0] ?? null,
            }),
        });
    }
    findOne(args) {
        const { document, variables } = (0, query_builder_1.buildFindManyDocument)('PlatformFunctionDefinition', 'platformFunctionDefinitions', args.select, {
            where: {
                id: {
                    equalTo: args.id,
                },
            },
            first: 1,
        }, 'PlatformFunctionDefinitionFilter', 'PlatformFunctionDefinitionOrderBy', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'query',
            operationName: 'PlatformFunctionDefinition',
            fieldName: 'platformFunctionDefinition',
            document,
            variables,
            transform: (data) => ({
                platformFunctionDefinition: data.platformFunctionDefinitions?.nodes?.[0] ?? null,
            }),
        });
    }
    create(args) {
        const { document, variables } = (0, query_builder_1.buildCreateDocument)('PlatformFunctionDefinition', 'createPlatformFunctionDefinition', 'platformFunctionDefinition', args.select, args.data, 'CreatePlatformFunctionDefinitionInput', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'mutation',
            operationName: 'PlatformFunctionDefinition',
            fieldName: 'createPlatformFunctionDefinition',
            document,
            variables,
        });
    }
    update(args) {
        const { document, variables } = (0, query_builder_1.buildUpdateByPkDocument)('PlatformFunctionDefinition', 'updatePlatformFunctionDefinition', 'platformFunctionDefinition', args.select, args.where.id, args.data, 'UpdatePlatformFunctionDefinitionInput', 'id', 'platformFunctionDefinitionPatch', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'mutation',
            operationName: 'PlatformFunctionDefinition',
            fieldName: 'updatePlatformFunctionDefinition',
            document,
            variables,
        });
    }
    delete(args) {
        const { document, variables } = (0, query_builder_1.buildDeleteByPkDocument)('PlatformFunctionDefinition', 'deletePlatformFunctionDefinition', 'platformFunctionDefinition', {
            id: args.where.id,
        }, 'DeletePlatformFunctionDefinitionInput', args.select, input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'mutation',
            operationName: 'PlatformFunctionDefinition',
            fieldName: 'deletePlatformFunctionDefinition',
            document,
            variables,
        });
    }
}
exports.PlatformFunctionDefinitionModel = PlatformFunctionDefinitionModel;
