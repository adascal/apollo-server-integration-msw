import { ApolloServer, BaseContext, ContextFunction, HeaderMap } from '@apollo/server';
import type { WithRequired } from '@apollo/utils.withrequired';
import { defaultContext as DefaultContext, MockedRequest, MockedResponse, ResponseResolver } from 'msw';

interface Options<Context extends BaseContext> {
  context?: ContextFunction<[MockedRequest, MockedResponse, typeof DefaultContext], Context>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultContext: ContextFunction<[], any> = async () => ({});

function startServerAndCreateMSWHandler(
  server: ApolloServer<BaseContext>,
  options?: Options<BaseContext>,
): ResponseResolver;
function startServerAndCreateMSWHandler<Context extends BaseContext>(
  server: ApolloServer<Context>,
  options: WithRequired<Options<Context>, 'context'>,
): ResponseResolver;
function startServerAndCreateMSWHandler<Context extends BaseContext>(
  server: ApolloServer<Context>,
  options?: Options<Context>,
) {
  server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests();

  const contextFunction = options?.context || defaultContext;

  const handler: ResponseResolver = async (req, createResponse, ctx) =>
    createResponse(async res => {
      const headers = new HeaderMap();

      for (const [key, value] of Object.entries(req.headers.all())) {
        if (typeof value === 'string') {
          headers.set(key, value);
        }
      }

      const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
        context: () => contextFunction(req, res, ctx),
        httpGraphQLRequest: {
          body: req.body,
          headers,
          method: req.method || 'POST',
          search: req.url ? req.url.search || '' : '',
        },
      });

      for (const [key, value] of httpGraphQLResponse.headers) {
        res.headers.set(key, value);
      }

      res.status = httpGraphQLResponse.status || 200;

      if (httpGraphQLResponse.body.kind === 'complete') {
        res.body = httpGraphQLResponse.body.string;
      } else {
        for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
          res.body += chunk;
        }
      }

      res.headers.set('content-length', Buffer.byteLength(res.body, 'utf8').toString());

      return res;
    });

  return handler;
}

export { startServerAndCreateMSWHandler };
