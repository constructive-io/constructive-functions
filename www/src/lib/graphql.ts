import { compute, api, objects } from '@constructive-functions/constructive-functions-hooks';

export function configureGraphQL() {
  compute.configure({ endpoint: '/graphql/compute' });
  api.configure({ endpoint: '/graphql/api' });
  objects.configure({ endpoint: '/graphql/objects' });
}
