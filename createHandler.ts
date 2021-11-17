import {
  envelop,
  useSchema,
  useTiming,
} from "https://cdn.skypack.dev/@envelop/core@1.6.1?dts";

// deno-lint-ignore no-explicit-any
export function createHandler(schema: any) {
  const getEnveloped = envelop({
    plugins: [
      useSchema(schema),
      useTiming(),
    ],
  });

  return async function handler(request: Request): Promise<Response> {
    try {
      const { parse, validate, contextFactory, execute, schema } =
        getEnveloped();

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
}
