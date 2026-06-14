const loggerInstance = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

export const createLogger = jest.fn(() => loggerInstance);

export class Logger {
  info = jest.fn();
  error = jest.fn();
  warn = jest.fn();
  debug = jest.fn();
  constructor(_name?: string) {}
}
