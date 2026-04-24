export const mockQuery = jest.fn();
export const mockRelease = jest.fn();
export const mockConnect = jest.fn();

const mockClient = {
  query: mockQuery,
  release: mockRelease,
};

export class Pool {
  connect = jest.fn().mockResolvedValue(mockClient);
}

export class Client {
  connect = mockConnect;
  query = mockQuery;
  end = jest.fn();
}
