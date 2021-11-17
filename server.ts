import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import SchemaBuilder from "https://cdn.skypack.dev/@giraphql/deno/packages/core/mod.ts";
import {
  envelop,
  useSchema,
  useTiming,
} from "https://cdn.skypack.dev/@envelop/core@1.6.1?dts";

const builder = new SchemaBuilder({});
const addr = ":8080";

builder.queryType({
  fields: (t) => ({
    hello: t.string({
      args: {
        name: t.arg.string(),
      },
      resolve: (_parent, { name }) => `hello, ${name || "World"}`,
    }),
  }),
});

const schema = builder.toSchema({});

const getEnveloped = envelop({
  plugins: [
    useSchema(schema),
    useTiming(),
  ],
});

const handler = async (request: Request): Promise<Response> => {
  try {
    const { parse, validate, contextFactory, execute, schema } = getEnveloped();

    const { query, variables } = await request.json();
    const document = parse(query);
    const validationErrors = validate(schema, document);

    if (validationErrors.length > 0) {
      return new Response(JSON.stringify({ errors: validationErrors }));
    }

    // Build the context and execute
    const contextValue = await contextFactory();
    const result = await execute({
      document,
      schema,
      variableValues: variables,
      contextValue,
    });

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(null, { status: 500 });
  }
};

await serve(handler, { addr });
