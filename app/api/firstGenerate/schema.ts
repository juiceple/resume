import { z } from 'zod';

// define a schema for the bulletpoints
export const bulletPointSchema = z.object({
  bulletpoints: z.array(
    z.object({
      firstBulletPoint: z.string().describe('첫번째 영문 resume의 bullet point'),
      secondBulletPoint: z.string().describe('두번째 영문 resume의 bullet point'),
      thirdBulletPoint: z.string().describe('세번째 영문 resume의 bullet point')
    }),
  ),
});

import BulletPoint from '@/components/docs/edit/DocsInsideCompo/BulletPoint';
import { jsonSchema } from 'ai';

// const mySchema = jsonSchema<{
//   bulletPoint: {
//     first: string;
//     second: string;
//     third: string;
//   };
// }>({
//   type: 'object',
//   properties: {
//     BulletPoint: {
//       type: 'object',
//       properties: {
//         first: { type: 'string' },
//         second: {type: 'string'},
//         third: {type: 'string'}
//       },
//       required: ['first', 'second', 'third'],
//     },
//   },
//   required: ['bulletPoint'],
// });