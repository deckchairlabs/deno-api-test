import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { schema } from "./schema.ts";
import { createHandler } from "./createHandler.ts";

const addr = ":8080";
const handler = createHandler(schema);

console.log(`Server running at: http://localhost:8080/`);

await serve(handler, { addr });
