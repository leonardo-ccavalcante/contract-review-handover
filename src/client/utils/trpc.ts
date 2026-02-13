import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server/index';
import superjson from 'superjson';

export const trpc = createTRPCReact<AppRouter>();

export function getTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: 'http://localhost:3000/trpc',
        transformer: superjson,
        headers() {
          return {
            'x-user-id': localStorage.getItem('user_id') || '',
            'x-user-role': localStorage.getItem('user_role') || '',
            'x-user-email': localStorage.getItem('user_email') || '',
          };
        },
      }),
    ],
  });
}
