"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformFunctionInvocationModel = void 0;
const query_builder_1 = require("../query-builder");
const input_types_1 = require("../input-types");
class PlatformFunctionInvocationModel {
    client;
    constructor(client) {
        this.client = client;
    }
    findMany(args) {
        const { document, variables } = (0, query_builder_1.buildFindManyDocument)('PlatformFunctionInvocation', 'platformFunctionInvocations', args.select, {
            where: args?.where,
            orderBy: args?.orderBy,
            first: args?.first,
            last: args?.last,
            after: args?.after,
            before: args?.before,
            offset: args?.offset,
        }, 'PlatformFunctionInvocationFilter', 'PlatformFunctionInvocationOrderBy', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'query',
            operationName: 'PlatformFunctionInvocation',
            fieldName: 'platformFunctionInvocations',
            document,
            variables,
        });
    }
    findFirst(args) {
        const { document, variables } = (0, query_builder_1.buildFindFirstDocument)('PlatformFunctionInvocation', 'platformFunctionInvocations', args.select, {
            where: args?.where,
            orderBy: args?.orderBy,
        }, 'PlatformFunctionInvocationFilter', 'PlatformFunctionInvocationOrderBy', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'query',
            operationName: 'PlatformFunctionInvocation',
            fieldName: 'platformFunctionInvocation',
            document,
            variables,
            transform: (data) => ({
                platformFunctionInvocation: data.platformFunctionInvocations?.nodes?.[0] ?? null,
            }),
        });
    }
    findOne(args) {
        const { document, variables } = (0, query_builder_1.buildFindManyDocument)('PlatformFunctionInvocation', 'platformFunctionInvocations', args.select, {
            where: {
                id: {
                    equalTo: args.id,
                },
            },
            first: 1,
        }, 'PlatformFunctionInvocationFilter', 'PlatformFunctionInvocationOrderBy', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'query',
            operationName: 'PlatformFunctionInvocation',
            fieldName: 'platformFunctionInvocation',
            document,
            variables,
            transform: (data) => ({
                platformFunctionInvocation: data.platformFunctionInvocations?.nodes?.[0] ?? null,
            }),
        });
    }
    create(args) {
        const { document, variables } = (0, query_builder_1.buildCreateDocument)('PlatformFunctionInvocation', 'createPlatformFunctionInvocation', 'platformFunctionInvocation', args.select, args.data, 'CreatePlatformFunctionInvocationInput', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'mutation',
            operationName: 'PlatformFunctionInvocation',
            fieldName: 'createPlatformFunctionInvocation',
            document,
            variables,
        });
    }
    update(args) {
        const { document, variables } = (0, query_builder_1.buildUpdateByPkDocument)('PlatformFunctionInvocation', 'updatePlatformFunctionInvocation', 'platformFunctionInvocation', args.select, args.where.id, args.data, 'UpdatePlatformFunctionInvocationInput', 'id', 'platformFunctionInvocationPatch', input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'mutation',
            operationName: 'PlatformFunctionInvocation',
            fieldName: 'updatePlatformFunctionInvocation',
            document,
            variables,
        });
    }
    delete(args) {
        const { document, variables } = (0, query_builder_1.buildDeleteByPkDocument)('PlatformFunctionInvocation', 'deletePlatformFunctionInvocation', 'platformFunctionInvocation', {
            id: args.where.id,
        }, 'DeletePlatformFunctionInvocationInput', args.select, input_types_1.connectionFieldsMap);
        return new query_builder_1.QueryBuilder({
            client: this.client,
            operation: 'mutation',
            operationName: 'PlatformFunctionInvocation',
            fieldName: 'deletePlatformFunctionInvocation',
            document,
            variables,
        });
    }
}
exports.PlatformFunctionInvocationModel = PlatformFunctionInvocationModel;
