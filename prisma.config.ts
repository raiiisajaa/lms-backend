import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: 'postgresql://postgres@localhost:5432/lms_db?schema=public',
  },
});
