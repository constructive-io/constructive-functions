export const parseEnvBoolean = (
  value: string | undefined
): boolean | undefined => {
  if (value === undefined || value === '') return undefined;
  const lower = value.toLowerCase();
  if (['true', '1', 'yes'].includes(lower)) return true;
  if (['false', '0', 'no'].includes(lower)) return false;
  return undefined;
};

export const parseEnvNumber = (
  value: string | undefined
): number | undefined => {
  if (value === undefined || value === '') return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};
