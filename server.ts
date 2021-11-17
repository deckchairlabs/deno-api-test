import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import SchemaBuilder from "https://cdn.skypack.dev/@giraphql/core?dts";
import {
  envelop,
  useSchema,
  useTiming,
} from "https://cdn.skypack.dev/@envelop/core@1.6.1?dts";

const builder = new SchemaBuilder({});

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
  if (request.method === "GET") {
    const { default: playground } = await import(
      "https://gist.githubusercontent.com/hayes/5c99f7b4f71234452036fd88e142a825/raw/655245a052b10c2912a803c8a6d537096b73c10b/playground.ts"
    );

    return new Response(playground({ endpoint: "http://localhost:8000" }), {
      headers: {
        "content-type": "text/html",
      },
    });
  }

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

console.log("Server running at http://localhost:8000");

await serve(handler);
