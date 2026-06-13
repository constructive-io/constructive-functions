import type { FunctionHandler } from '@constructive-io/fn-runtime';

const handler: FunctionHandler<Record<string, any>> = async (params) => {
  const template: string = params.template ?? '';
  const variables = (params.variables ?? {}) as Record<string, unknown>;
  const strict: boolean = params.strict ?? false;
  const fallback: string = params.fallback ?? '';

  const missingVars: string[] = [];

  const text = template.replace(/\{\{(\w+)\}\}/g, (_match: string, key: string) => {
    if (key in variables) {
      return String(variables[key]);
    }
    missingVars.push(key);
    if (strict) {
      throw new Error(`Missing template variable: {{${key}}}`);
    }
    return fallback;
  });

  return { text, missingVars };
};

export default handler;
