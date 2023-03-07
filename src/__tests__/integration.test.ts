import { ApolloServer, ApolloServerOptions, BaseContext } from '@apollo/server';
import { CreateServerForIntegrationTestsOptions } from '@apollo/server-integration-testsuite';
import { defineIntegrationTestSuiteApolloServerTests } from '@apollo/server-integration-testsuite/dist/apolloServerTests';
import { defineIntegrationTestSuiteHttpServerTests } from '@apollo/server-integration-testsuite/dist/httpServerTests';
import { defineIntegrationTestSuiteHttpSpecTests } from '@apollo/server-integration-testsuite/dist/httpSpecTests';
import { startServerAndCreateMSWHandler } from 'apollo-server-integration-msw/startServerAndCreateMSWHandler';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

describe('mswHandler', () => {
  let httpServer: ReturnType<typeof setupServer> | null = null;
  const startHttpServer = () => {
    httpServer?.listen({ onUnhandledRequest: 'bypass' });
  };
  const stopHttpServer = () => {
    httpServer?.close();
  };

  const createServer = async (
    serverOptions: ApolloServerOptions<BaseContext>,
    testOptions?: CreateServerForIntegrationTestsOptions,
  ) => {
    stopHttpServer();
    const server = new ApolloServer(serverOptions);
    const handler = startServerAndCreateMSWHandler(server, testOptions);

    httpServer = setupServer(rest.all('http://localhost/*', handler));

    startHttpServer();

    return {
      async extraCleanup() {
        stopHttpServer();
      },
      server,
      url: 'http://localhost',
    };
  };

  describe('apolloServerTests and httpServerTests', () => {
    afterEach(stopHttpServer);

    defineIntegrationTestSuiteApolloServerTests(createServer, {
      serverIsStartedInBackground: true,
    });
    defineIntegrationTestSuiteHttpServerTests(createServer, {
      noIncrementalDelivery: true,
      serverIsStartedInBackground: true,
    });
  });

  describe('httpSpecTests', () => {
    defineIntegrationTestSuiteHttpSpecTests(createServer);
  });
});
