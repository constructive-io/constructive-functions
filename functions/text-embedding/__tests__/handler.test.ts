import { createMockContext } from '../../../tests/helpers/mock-context';

const mockGenerateEmbedding = jest.fn();

jest.mock('@agentic-kit/ollama', () => {
  return {
    __esModule: true,
    default: class OllamaClient {
      constructor() {}
      async generateEmbedding(text: string, model: string) {
        return mockGenerateEmbedding(text, model);
      }
    },
  };
});

const loadHandler = () => {
  const mod = require('../handler');
  return mod.default ?? mod;
};

describe('text-embedding handler', () => {
  beforeEach(() => {
    mockGenerateEmbedding.mockClear();
    mockGenerateEmbedding.mockResolvedValue([0.1, 0.2, 0.3, 0.4, 0.5]);
  });

  it('should generate embedding for valid text', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];
    mockGenerateEmbedding.mockResolvedValue(mockEmbedding);

    const handler = loadHandler();
    const result = await handler(
      { text: 'Hello world' },
      createMockContext({ env: { OLLAMA_URL: 'http://localhost:11434' } })
    );

    expect(result).toEqual({
      embedding: mockEmbedding,
      dimensions: 5,
      model: 'nomic-embed-text:latest',
    });
  });

  it('should use custom model when provided', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3];
    mockGenerateEmbedding.mockResolvedValue(mockEmbedding);

    const handler = loadHandler();
    const result = await handler(
      { text: 'Test', model: 'mxbai-embed-large' },
      createMockContext()
    );

    expect(result.model).toBe('mxbai-embed-large');
    expect(mockGenerateEmbedding).toHaveBeenCalledWith('Test', 'mxbai-embed-large');
  });

  it('should use EMBEDDING_MODEL env var as default', async () => {
    const mockEmbedding = [0.1, 0.2];
    mockGenerateEmbedding.mockResolvedValue(mockEmbedding);

    const handler = loadHandler();
    const result = await handler(
      { text: 'Test' },
      createMockContext({ env: { EMBEDDING_MODEL: 'all-minilm' } })
    );

    expect(result.model).toBe('all-minilm');
  });

  it('should throw error when text is missing', async () => {
    const handler = loadHandler();
    await expect(
      handler({}, createMockContext())
    ).rejects.toThrow('Missing required param: text');
  });

  it('should throw error when text is not a string', async () => {
    const handler = loadHandler();
    await expect(
      handler({ text: 123 }, createMockContext())
    ).rejects.toThrow('Missing required param: text');
  });

  it('should throw error when text is empty', async () => {
    const handler = loadHandler();
    await expect(
      handler({ text: '' }, createMockContext())
    ).rejects.toThrow('Missing required param: text');
  });

  it('should return mock embedding in DRY_RUN mode', async () => {
    const handler = loadHandler();
    const result = await handler(
      { text: 'Test' },
      createMockContext({ env: { TEXT_EMBEDDING_DRY_RUN: 'true' } })
    );

    expect(result).toEqual({
      embedding: Array(768).fill(0),
      dimensions: 768,
      model: 'dry-run',
    });
    expect(mockGenerateEmbedding).not.toHaveBeenCalled();
  });
});
