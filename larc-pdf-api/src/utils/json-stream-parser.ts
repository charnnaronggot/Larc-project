import { AppError } from '../middleware/app-error';

export const parseConcatenatedJsonObjects = (content: string): Array<Record<string, unknown>> => {
  const rows: Array<Record<string, unknown>> = [];
  let index = 0;

  while (index < content.length) {
    while (index < content.length && /\s/.test(content[index])) {
      index += 1;
    }

    if (index >= content.length) {
      break;
    }

    if (content[index] !== '{') {
      throw new AppError('Invalid concatenated JSON format.', 400);
    }

    let depth = 0;
    let inString = false;
    let escape = false;
    const start = index;

    while (index < content.length) {
      const char = content[index];

      if (inString) {
        if (escape) {
          escape = false;
        } else if (char === '\\') {
          escape = true;
        } else if (char === '"') {
          inString = false;
        }
      } else {
        if (char === '"') {
          inString = true;
        } else if (char === '{') {
          depth += 1;
        } else if (char === '}') {
          depth -= 1;
          if (depth === 0) {
            const objText = content.slice(start, index + 1);
            const obj = JSON.parse(objText) as unknown;
            if (!obj || Array.isArray(obj) || typeof obj !== 'object') {
              throw new AppError('Each JSON item must be an object.', 400);
            }
            rows.push(obj as Record<string, unknown>);
            index += 1;
            break;
          }
        }
      }

      index += 1;
    }

    if (depth !== 0) {
      throw new AppError('Unbalanced JSON object in concatenated stream.', 400);
    }
  }

  return rows;
};
