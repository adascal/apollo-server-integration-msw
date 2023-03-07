# apollo-server-integration-msw

An Apollo Server integration for use with Mock Service Worker

## Working example

https://codesandbox.io/s/apollo-server-integration-msw-l44psn

## Getting started

First create a mock definition file at for example `src/handler.ts`.

Next create an Apollo Server instance and pass it to `startServerAndCreateMSWHandler`:

```js
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateMSWHandler } from 'apollo-server-integration-msw';
import { gql } from 'graphql-tag';

const resolvers = {
  Query: {
    hello: () => 'world',
  },
};

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const server = new ApolloServer({
  resolvers,
  typeDefs,
});

export default startServerAndCreateMSWHandler(server);
```

You may also pass a context function to `startServerAndCreateMSWHandler` as such:

```js
export default startServerAndCreateMSWHandler(server, {
  context: async (req, res, ctx) => ({ req, res, ctx, user: await getLoggedInUser(req) }),
});
```

The MSW `req`, `res` and `ctx` objects are passed along to the context function.

Use created handler for MSW

```js
import { setupWorker, rest } from 'msw';
import apolloMSWHandler from './handler';

const worker = setupWorker(rest.post('/api/graphql', apolloMSWHandler));

// Register the Service Worker and enable the mocking
worker.start();
```
