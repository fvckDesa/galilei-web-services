import OpenApiSpec from "@gws/openapi/openapi.json";
import { OpenAPIObject } from "openapi3-ts/oas30";
import { generateZodClientFromOpenAPI } from "openapi-zod-client";

try {
  await generateZodClientFromOpenAPI({
    openApiDoc: OpenApiSpec as OpenAPIObject,
    distPath: "./client.ts",
    templatePath: "./bin/template.hbs",
    options: {
      shouldExportAllSchemas: true,
      additionalPropertiesDefaultValue: false,
      withAlias: true,
    },
  });

  console.log("api client successfully generated");
} catch (error) {
  console.error(error);
  process.exit(1);
}
