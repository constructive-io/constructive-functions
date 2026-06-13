import type { FunctionHandler } from '@constructive-io/fn-runtime';

const handler: FunctionHandler<Record<string, any>> = async (params) => {
  const { data, mapping } = params;
  const removeNulls = params.removeNulls ?? true;

  let result = data;

  if (mapping && typeof mapping === 'object') {
    const mapped: Record<string, unknown> = {};
    for (const [oldKey, newKey] of Object.entries(mapping)) {
      if (oldKey in (result as Record<string, unknown>)) {
        mapped[newKey as string] = (result as Record<string, unknown>)[oldKey];
      }
    }
    result = mapped;
  }

  if (removeNulls && typeof result === 'object' && result !== null) {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(result as Record<string, unknown>)) {
      if (v !== null) cleaned[k] = v;
    }
    result = cleaned;
  }

  const count = typeof result === 'object' && result !== null ? Object.keys(result).length : 0;

  return { result, count };
};

export default handler;
