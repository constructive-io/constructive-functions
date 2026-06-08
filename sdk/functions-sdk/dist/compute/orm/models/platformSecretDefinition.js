"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformSecretDefinitionModel = void 0;
const query_builder_1 = require("../query-builder");
const input_types_1 = require("../input-types");
class PlatformSecretDefinitionModel {
    client;
    constructor(client) {
        this.client = client;
    }
    findMany(args) {
        const { document, variables } = (0, query_builder_1.buildFindManyDocument)('PlatformSecretDefinition', 'platformSecretDefinitions', args.select, {
            where: args?.where,
            orderBy: args?.orderBy,
            first: args?.first,
            last: args?.last,
            after: args?.after,
            before: args?.before,
            offset: args?.offset,
        }, 'PlatformSecretDefinitionFilter', 'PlatformSecretDefinitionOrderBy', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'query',
            operationName: 'PlatformSecretDefinition',
            fieldName: 'platformSecretDefinitions',
            document,
            variables,
        });
    }
    findFirst(args) {
        const { document, variables } = (0, query_builder_1.buildFindFirstDocument)('PlatformSecretDefinition', 'platformSecretDefinitions', args.select, {
            where: args?.where,
            orderBy: args?.orderBy,
        }, 'PlatformSecretDefinitionFilter', 'PlatformSecretDefinitionOrderBy', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'query',
            operationName: 'PlatformSecretDefinition',
            fieldName: 'platformSecretDefinition',
            document,
            variables,
            transform: (data) => ({
                platformSecretDefinition: data.platformSecretDefinitions?.nodes?.[0] ?? null,
            }),
        });
    }
    findOne(args) {
        const { document, variables } = (0, query_builder_1.buildFindManyDocument)('PlatformSecretDefinition', 'platformSecretDefinitions', args.select, {
            where: {
                id: {
                    equalTo: args.id,
                },
            },
            first: 1,
        }, 'PlatformSecretDefinitionFilter', 'PlatformSecretDefinitionOrderBy', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'query',
            operationName: 'PlatformSecretDefinition',
            fieldName: 'platformSecretDefinition',
            document,
            variables,
            transform: (data) => ({
                platformSecretDefinition: data.platformSecretDefinitions?.nodes?.[0] ?? null,
            }),
        });
    }
    create(args) {
        const { document, variables } = (0, query_builder_1.buildCreateDocument)('PlatformSecretDefinition', 'createPlatformSecretDefinition', 'platformSecretDefinition', args.select, args.data, 'CreatePlatformSecretDefinitionInput', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'mutation',
            operationName: 'PlatformSecretDefinition',
            fieldName: 'createPlatformSecretDefinition',
            document,
            variables,
        });
    }
    update(args) {
        const { document, variables } = (0, query_builder_1.buildUpdateByPkDocument)('PlatformSecretDefinition', 'updatePlatformSecretDefinition', 'platformSecretDefinition', args.select, args.where.id, args.data, 'UpdatePlatformSecretDefinitionInput', 'id', 'platformSecretDefinitionPatch', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'mutation',
            operationName: 'PlatformSecretDefinition',
            fieldName: 'updatePlatformSecretDefinition',
            document,
            variables,
        });
    }
    delete(args) {
        const { document, variables } = (0, query_builder_1.buildDeleteByPkDocument)('PlatformSecretDefinition', 'deletePlatformSecretDefinition', 'platformSecretDefinition', {
            id: args.where.id,
        }, 'DeletePlatformSecretDefinitionInput', args.select, input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'mutation',
            operationName: 'PlatformSecretDefinition',
            fieldName: 'deletePlatformSecretDefinition',
            document,
            variables,
        });
    }
}
exports.PlatformSecretDefinitionModel = PlatformSecretDefinitionModel;
