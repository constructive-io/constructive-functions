"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformNamespaceEventModel = void 0;
const query_builder_1 = require("../query-builder");
const input_types_1 = require("../input-types");
class PlatformNamespaceEventModel {
    client;
    constructor(client) {
        this.client = client;
    }
    findMany(args) {
        const { document, variables } = (0, query_builder_1.buildFindManyDocument)('PlatformNamespaceEvent', 'platformNamespaceEvents', args.select, {
            where: args?.where,
            orderBy: args?.orderBy,
            first: args?.first,
            last: args?.last,
            after: args?.after,
            before: args?.before,
            offset: args?.offset,
        }, 'PlatformNamespaceEventFilter', 'PlatformNamespaceEventOrderBy', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'query',
            operationName: 'PlatformNamespaceEvent',
            fieldName: 'platformNamespaceEvents',
            document,
            variables,
        });
    }
    findFirst(args) {
        const { document, variables } = (0, query_builder_1.buildFindFirstDocument)('PlatformNamespaceEvent', 'platformNamespaceEvents', args.select, {
            where: args?.where,
            orderBy: args?.orderBy,
        }, 'PlatformNamespaceEventFilter', 'PlatformNamespaceEventOrderBy', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'query',
            operationName: 'PlatformNamespaceEvent',
            fieldName: 'platformNamespaceEvent',
            document,
            variables,
            transform: (data) => ({
                platformNamespaceEvent: data.platformNamespaceEvents?.nodes?.[0] ?? null,
            }),
        });
    }
    findOne(args) {
        const { document, variables } = (0, query_builder_1.buildFindManyDocument)('PlatformNamespaceEvent', 'platformNamespaceEvents', args.select, {
            where: {
                id: {
                    equalTo: args.id,
                },
            },
            first: 1,
        }, 'PlatformNamespaceEventFilter', 'PlatformNamespaceEventOrderBy', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'query',
            operationName: 'PlatformNamespaceEvent',
            fieldName: 'platformNamespaceEvent',
            document,
            variables,
            transform: (data) => ({
                platformNamespaceEvent: data.platformNamespaceEvents?.nodes?.[0] ?? null,
            }),
        });
    }
    create(args) {
        const { document, variables } = (0, query_builder_1.buildCreateDocument)('PlatformNamespaceEvent', 'createPlatformNamespaceEvent', 'platformNamespaceEvent', args.select, args.data, 'CreatePlatformNamespaceEventInput', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'mutation',
            operationName: 'PlatformNamespaceEvent',
            fieldName: 'createPlatformNamespaceEvent',
            document,
            variables,
        });
    }
    update(args) {
        const { document, variables } = (0, query_builder_1.buildUpdateByPkDocument)('PlatformNamespaceEvent', 'updatePlatformNamespaceEvent', 'platformNamespaceEvent', args.select, args.where.id, args.data, 'UpdatePlatformNamespaceEventInput', 'id', 'platformNamespaceEventPatch', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'mutation',
            operationName: 'PlatformNamespaceEvent',
            fieldName: 'updatePlatformNamespaceEvent',
            document,
            variables,
        });
    }
    delete(args) {
        const { document, variables } = (0, query_builder_1.buildDeleteByPkDocument)('PlatformNamespaceEvent', 'deletePlatformNamespaceEvent', 'platformNamespaceEvent', {
            id: args.where.id,
        }, 'DeletePlatformNamespaceEventInput', args.select, input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'mutation',
            operationName: 'PlatformNamespaceEvent',
            fieldName: 'deletePlatformNamespaceEvent',
            document,
            variables,
        });
    }
}
exports.PlatformNamespaceEventModel = PlatformNamespaceEventModel;
