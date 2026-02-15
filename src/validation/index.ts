import { z } from 'zod';

export const validate = async <T>(schema: z.Schema<T>, data: unknown): Promise<T> => {
  return schema.parseAsync(data);
};
