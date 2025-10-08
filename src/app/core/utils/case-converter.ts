const IGNORED_TYPES = ['[object Date]', '[object File]', '[object Blob]', '[object FormData]', '[object ArrayBuffer]'];

const SNAKE_REGEX = /^[a-z0-9_]+$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function convertKeyToSnake(key: string): string {
  if (!key) return key;
  if (SNAKE_REGEX.test(key)) return key;
  return key
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1_$2')
    .toLowerCase();
}

function convertKeyToCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}

function transformEntries<T>(value: T, keyTransformer: (key: string) => string, transformValues: (val: unknown) => unknown): T {
  if (!isObject(value)) return value;
  return Object.entries(value).reduce((acc, [key, val]) => {
    acc[keyTransformer(key)] = transformValues(val);
    return acc;
  }, {} as Record<string, unknown>) as T;
}

function transform(value: unknown, keyTransformer: (key: string) => string, visited = new WeakSet<object>()): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => transform(item, keyTransformer, visited));
  }

  if (!isObject(value)) {
    return value;
  }

  if (visited.has(value)) {
    return value;
  }

  const type = Object.prototype.toString.call(value);
  if (IGNORED_TYPES.includes(type)) {
    return value;
  }

  visited.add(value);
  return transformEntries(
    value,
    keyTransformer,
    (val) => transform(val, keyTransformer, visited)
  );
}

export function toSnakeCase<T>(value: T): T {
  return transform(value, convertKeyToSnake) as T;
}

export function toCamelCase<T>(value: T): T {
  return transform(value, convertKeyToCamel) as T;
}
