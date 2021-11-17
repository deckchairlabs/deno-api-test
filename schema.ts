import SchemaBuilder from "https://cdn.skypack.dev/@giraphql/deno@2.17.0/packages/core/mod.ts";

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

export const schema = builder.toSchema({});
