import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

export const Password = z.object({ password: z.string().min(1) });
export type Password = z.infer<typeof Password>;
export const AuthData = Password.and(
  z.object({ remember: z.boolean(), username: z.string().min(1) })
);
export type AuthData = z.infer<typeof AuthData>;
export const Token = z.string();
export type Token = z.infer<typeof Token>;
export const User = z.object({ id: z.string().uuid(), username: z.string() });
export type User = z.infer<typeof User>;
export const ApiError = z.union([
  z.object({ kind: z.literal("BadRequest") }),
  z.object({ kind: z.literal("Validation") }),
  z.object({ kind: z.literal("AlreadyExists") }),
  z.object({ kind: z.literal("NotFound") }),
  z.object({ kind: z.literal("Unauthorized") }),
  z.object({ kind: z.literal("InternalError") }),
]);
export type ApiError = z.infer<typeof ApiError>;
export const ErrorMessage = ApiError.and(z.object({ message: z.string() }));
export type ErrorMessage = z.infer<typeof ErrorMessage>;
export const ProjectSchema = z.object({ name: z.string().min(1) });
export type ProjectSchema = z.infer<typeof ProjectSchema>;
export const PartialProjectSchema = z
  .object({ name: z.string().min(1) })
  .partial();
export type PartialProjectSchema = z.infer<typeof PartialProjectSchema>;
export const AppServiceSchema = z.object({
  image: z.string().min(1),
  name: z.string().min(1),
  port: z.number().int().gte(1).lte(65535),
  replicas: z.number().int().gte(0),
});
export type AppServiceSchema = z.infer<typeof AppServiceSchema>;
export const PartialAppServiceSchema = z
  .object({
    image: z.string().min(1),
    name: z.string().min(1),
    port: z.number().int().gte(1).lte(65535),
    replicas: z.number().int().gte(0),
  })
  .partial();
export type PartialAppServiceSchema = z.infer<typeof PartialAppServiceSchema>;

const endpoints = makeApi([
  {
    method: "post",
    path: "/auth/login/",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AuthData,
      },
    ],
    response: z.object({
      expires: z.string().datetime({ offset: true }).optional(),
      token: Token,
      user: User,
    }),
    errors: [
      {
        status: 400,
        schema: ErrorMessage,
      },
      {
        status: 401,
        schema: ErrorMessage,
      },
    ],
  },
  {
    method: "post",
    path: "/auth/register/",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AuthData,
      },
    ],
    response: z.object({
      expires: z.string().datetime({ offset: true }).optional(),
      token: Token,
      user: User,
    }),
    errors: [
      {
        status: 400,
        schema: ErrorMessage,
      },
      {
        status: 401,
        schema: ErrorMessage,
      },
      {
        status: 409,
        schema: ErrorMessage,
      },
    ],
  },
  {
    method: "get",
    path: "/projects/",
    requestFormat: "json",
    response: z.array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        userId: z.string().uuid(),
      })
    ),
    errors: [
      {
        status: 401,
        schema: ErrorMessage,
      },
    ],
  },
  {
    method: "post",
    path: "/projects/",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ name: z.string().min(1) }),
      },
    ],
    response: z.object({
      id: z.string().uuid(),
      name: z.string(),
      userId: z.string().uuid(),
    }),
    errors: [
      {
        status: 400,
        schema: ErrorMessage,
      },
      {
        status: 401,
        schema: ErrorMessage,
      },
      {
        status: 409,
        schema: ErrorMessage,
      },
    ],
  },
  {
    method: "get",
    path: "/projects/:project_id/",
    requestFormat: "json",
    parameters: [
      {
        name: "project_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({
      id: z.string().uuid(),
      name: z.string(),
      userId: z.string().uuid(),
    }),
    errors: [
      {
        status: 401,
        schema: ErrorMessage,
      },
      {
        status: 404,
        schema: ErrorMessage,
      },
    ],
  },
  {
    method: "delete",
    path: "/projects/:project_id/",
    requestFormat: "json",
    parameters: [
      {
        name: "project_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({
      id: z.string().uuid(),
      name: z.string(),
      userId: z.string().uuid(),
    }),
    errors: [
      {
        status: 401,
        schema: ErrorMessage,
      },
      {
        status: 404,
        schema: ErrorMessage,
      },
    ],
  },
  {
    method: "patch",
    path: "/projects/:project_id/",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ name: z.string().min(1) }).partial(),
      },
      {
        name: "project_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({
      id: z.string().uuid(),
      name: z.string(),
      userId: z.string().uuid(),
    }),
    errors: [
      {
        status: 400,
        schema: ErrorMessage,
      },
      {
        status: 401,
        schema: ErrorMessage,
      },
      {
        status: 404,
        schema: ErrorMessage,
      },
      {
        status: 409,
        schema: ErrorMessage,
      },
    ],
  },
  {
    method: "get",
    path: "/projects/:project_id/apps",
    requestFormat: "json",
    parameters: [
      {
        name: "project_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.array(
      z.object({
        id: z.string().uuid(),
        image: z.string(),
        name: z.string(),
        port: z.number().int(),
        projectId: z.string().uuid(),
        replicas: z.number().int(),
      })
    ),
    errors: [
      {
        status: 401,
        schema: ErrorMessage,
      },
      {
        status: 404,
        schema: ErrorMessage,
      },
    ],
  },
  {
    method: "post",
    path: "/projects/:project_id/apps",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AppServiceSchema,
      },
      {
        name: "project_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({
      id: z.string().uuid(),
      image: z.string(),
      name: z.string(),
      port: z.number().int(),
      projectId: z.string().uuid(),
      replicas: z.number().int(),
    }),
    errors: [
      {
        status: 400,
        schema: ErrorMessage,
      },
      {
        status: 401,
        schema: ErrorMessage,
      },
      {
        status: 404,
        schema: ErrorMessage,
      },
      {
        status: 409,
        schema: ErrorMessage,
      },
    ],
  },
  {
    method: "get",
    path: "/projects/:project_id/apps/:app_id",
    requestFormat: "json",
    parameters: [
      {
        name: "project_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "app_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({
      id: z.string().uuid(),
      image: z.string(),
      name: z.string(),
      port: z.number().int(),
      projectId: z.string().uuid(),
      replicas: z.number().int(),
    }),
    errors: [
      {
        status: 401,
        schema: ErrorMessage,
      },
      {
        status: 404,
        schema: ErrorMessage,
      },
    ],
  },
  {
    method: "delete",
    path: "/projects/:project_id/apps/:app_id",
    requestFormat: "json",
    parameters: [
      {
        name: "project_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "app_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({
      id: z.string().uuid(),
      image: z.string(),
      name: z.string(),
      port: z.number().int(),
      projectId: z.string().uuid(),
      replicas: z.number().int(),
    }),
    errors: [
      {
        status: 401,
        schema: ErrorMessage,
      },
      {
        status: 404,
        schema: ErrorMessage,
      },
    ],
  },
  {
    method: "patch",
    path: "/projects/:project_id/apps/:app_id",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PartialAppServiceSchema,
      },
      {
        name: "project_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "app_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({
      id: z.string().uuid(),
      image: z.string(),
      name: z.string(),
      port: z.number().int(),
      projectId: z.string().uuid(),
      replicas: z.number().int(),
    }),
    errors: [
      {
        status: 400,
        schema: ErrorMessage,
      },
      {
        status: 401,
        schema: ErrorMessage,
      },
      {
        status: 404,
        schema: ErrorMessage,
      },
      {
        status: 409,
        schema: ErrorMessage,
      },
    ],
  },
]);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
