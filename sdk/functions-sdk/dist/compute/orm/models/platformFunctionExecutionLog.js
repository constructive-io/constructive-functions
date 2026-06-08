"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformFunctionExecutionLogModel = void 0;
const query_builder_1 = require("../query-builder");
const input_types_1 = require("../input-types");
class PlatformFunctionExecutionLogModel {
    client;
    constructor(client) {
        this.client = client;
    }
    findMany(args) {
        const { document, variables } = (0, query_builder_1.buildFindManyDocument)('PlatformFunctionExecutionLog', 'platformFunctionExecutionLogs', args.select, {
            where: args?.where,
            orderBy: args?.orderBy,
            first: args?.first,
            last: args?.last,
            after: args?.after,
            before: args?.before,
            offset: args?.offset,
        }, 'PlatformFunctionExecutionLogFilter', 'PlatformFunctionExecutionLogOrderBy', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'query',
            operationName: 'PlatformFunctionExecutionLog',
            fieldName: 'platformFunctionExecutionLogs',
            document,
            variables,
        });
    }
    findFirst(args) {
        const { document, variables } = (0, query_builder_1.buildFindFirstDocument)('PlatformFunctionExecutionLog', 'platformFunctionExecutionLogs', args.select, {
            where: args?.where,
            orderBy: args?.orderBy,
        }, 'PlatformFunctionExecutionLogFilter', 'PlatformFunctionExecutionLogOrderBy', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'query',
            operationName: 'PlatformFunctionExecutionLog',
            fieldName: 'platformFunctionExecutionLog',
            document,
            variables,
            transform: (data) => ({
                platformFunctionExecutionLog: data.platformFunctionExecutionLogs?.nodes?.[0] ?? null,
            }),
        });
    }
    findOne(args) {
        const { document, variables } = (0, query_builder_1.buildFindManyDocument)('PlatformFunctionExecutionLog', 'platformFunctionExecutionLogs', args.select, {
            where: {
                id: {
                    equalTo: args.id,
                },
            },
            first: 1,
        }, 'PlatformFunctionExecutionLogFilter', 'PlatformFunctionExecutionLogOrderBy', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'query',
            operationName: 'PlatformFunctionExecutionLog',
            fieldName: 'platformFunctionExecutionLog',
            document,
            variables,
            transform: (data) => ({
                platformFunctionExecutionLog: data.platformFunctionExecutionLogs?.nodes?.[0] ?? null,
            }),
        });
    }
    create(args) {
        const { document, variables } = (0, query_builder_1.buildCreateDocument)('PlatformFunctionExecutionLog', 'createPlatformFunctionExecutionLog', 'platformFunctionExecutionLog', args.select, args.data, 'CreatePlatformFunctionExecutionLogInput', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'mutation',
            operationName: 'PlatformFunctionExecutionLog',
            fieldName: 'createPlatformFunctionExecutionLog',
            document,
            variables,
        });
    }
    update(args) {
        const { document, variables } = (0, query_builder_1.buildUpdateByPkDocument)('PlatformFunctionExecutionLog', 'updatePlatformFunctionExecutionLog', 'platformFunctionExecutionLog', args.select, args.where.id, args.data, 'UpdatePlatformFunctionExecutionLogInput', 'id', 'platformFunctionExecutionLogPatch', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'mutation',
            operationName: 'PlatformFunctionExecutionLog',
            fieldName: 'updatePlatformFunctionExecutionLog',
            document,
            variables,
        });
    }
    delete(args) {
        const { document, variables } = (0, query_builder_1.buildDeleteByPkDocument)('PlatformFunctionExecutionLog', 'deletePlatformFunctionExecutionLog', 'platformFunctionExecutionLog', {
            id: args.where.id,
        }, 'DeletePlatformFunctionExecutionLogInput', args.select, input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'mutation',
            operationName: 'PlatformFunctionExecutionLog',
            fieldName: 'deletePlatformFunctionExecutionLog',
            document,
            variables,
        });
    }
}
exports.PlatformFunctionExecutionLogModel = PlatformFunctionExecutionLogModel;
