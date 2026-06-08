"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformNamespaceModel = void 0;
const query_builder_1 = require("../query-builder");
const input_types_1 = require("../input-types");
class PlatformNamespaceModel {
    client;
    constructor(client) {
        this.client = client;
    }
    findMany(args) {
        const { document, variables } = (0, query_builder_1.buildFindManyDocument)('PlatformNamespace', 'platformNamespaces', args.select, {
            where: args?.where,
            orderBy: args?.orderBy,
            first: args?.first,
            last: args?.last,
            after: args?.after,
            before: args?.before,
            offset: args?.offset,
        }, 'PlatformNamespaceFilter', 'PlatformNamespaceOrderBy', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'query',
            operationName: 'PlatformNamespace',
            fieldName: 'platformNamespaces',
            document,
            variables,
        });
    }
    findFirst(args) {
        const { document, variables } = (0, query_builder_1.buildFindFirstDocument)('PlatformNamespace', 'platformNamespaces', args.select, {
            where: args?.where,
            orderBy: args?.orderBy,
        }, 'PlatformNamespaceFilter', 'PlatformNamespaceOrderBy', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'query',
            operationName: 'PlatformNamespace',
            fieldName: 'platformNamespace',
            document,
            variables,
            transform: (data) => ({
                platformNamespace: data.platformNamespaces?.nodes?.[0] ?? null,
            }),
        });
    }
    findOne(args) {
        const { document, variables } = (0, query_builder_1.buildFindManyDocument)('PlatformNamespace', 'platformNamespaces', args.select, {
            where: {
                id: {
                    equalTo: args.id,
                },
            },
            first: 1,
        }, 'PlatformNamespaceFilter', 'PlatformNamespaceOrderBy', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'query',
            operationName: 'PlatformNamespace',
            fieldName: 'platformNamespace',
            document,
            variables,
            transform: (data) => ({
                platformNamespace: data.platformNamespaces?.nodes?.[0] ?? null,
            }),
        });
    }
    create(args) {
        const { document, variables } = (0, query_builder_1.buildCreateDocument)('PlatformNamespace', 'createPlatformNamespace', 'platformNamespace', args.select, args.data, 'CreatePlatformNamespaceInput', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'mutation',
            operationName: 'PlatformNamespace',
            fieldName: 'createPlatformNamespace',
            document,
            variables,
        });
    }
    update(args) {
        const { document, variables } = (0, query_builder_1.buildUpdateByPkDocument)('PlatformNamespace', 'updatePlatformNamespace', 'platformNamespace', args.select, args.where.id, args.data, 'UpdatePlatformNamespaceInput', 'id', 'platformNamespacePatch', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'mutation',
            operationName: 'PlatformNamespace',
            fieldName: 'updatePlatformNamespace',
            document,
            variables,
        });
    }
    delete(args) {
        const { document, variables } = (0, query_builder_1.buildDeleteByPkDocument)('PlatformNamespace', 'deletePlatformNamespace', 'platformNamespace', {
            id: args.where.id,
        }, 'DeletePlatformNamespaceInput', args.select, input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'mutation',
            operationName: 'PlatformNamespace',
            fieldName: 'deletePlatformNamespace',
            document,
            variables,
        });
    }
}
exports.PlatformNamespaceModel = PlatformNamespaceModel;
