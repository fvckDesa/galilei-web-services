import OpenApiSpec from "@gws/openapi/openapi.json";
import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIObject } from "openapi3-ts/oas30";
import { OpenAPI } from "openapi-types";
import { generateZodClientFromOpenAPI } from "openapi-zod-client";

try {
  const spec = (await SwaggerParser.validate(
    OpenApiSpec as OpenAPI.Document
  )) as unknown as OpenAPIObject;

  await generateZodClientFromOpenAPI({
    openApiDoc: spec,
    distPath: "./client.ts",
    options: {
      shouldExportAllSchemas: true,
      shouldExportAllTypes: true,
    },
  });

  console.log("api client successfully generated");
} catch (error) {
  console.error(error);
  process.exit(1);
}
