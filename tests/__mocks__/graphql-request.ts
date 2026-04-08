// Mock for graphql-request module
export const mockRequest = jest.fn();

export const GraphQLClient = jest.fn().mockImplementation(() => ({
  request: mockRequest
}));
