import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const login_Body = z
  .object({ password: z.string() })
  .passthrough()
  .and(z.object({ remember: z.boolean(), username: z.string() }).passthrough());
const create_app_Body = z
  .object({
    image: z.string(),
    name: z.string(),
    port: z.number().int(),
    replicas: z.number().int(),
  })
  .passthrough();
const update_app_Body = z
  .object({
    image: z.string(),
    name: z.string(),
    port: z.number().int(),
    replicas: z.number().int(),
  })
  .partial()
  .passthrough();
const ApiError = z.union([
  z.object({ kind: z.literal("BadRequest") }).passthrough(),
  z.object({ kind: z.literal("Validation") }).passthrough(),
  z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
  z.object({ kind: z.literal("NotFound") }).passthrough(),
  z.object({ kind: z.literal("Unauthorized") }).passthrough(),
  z.object({ kind: z.literal("InternalError") }).passthrough(),
]);
const AppServiceSchema = z
  .object({
    image: z.string(),
    name: z.string(),
    port: z.number().int(),
    replicas: z.number().int(),
  })
  .passthrough();
const AuthData = z
  .object({ password: z.string() })
  .passthrough()
  .and(z.object({ remember: z.boolean(), username: z.string() }).passthrough());
const ErrorMessage = z
  .union([
    z.object({ kind: z.literal("BadRequest") }).passthrough(),
    z.object({ kind: z.literal("Validation") }).passthrough(),
    z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
    z.object({ kind: z.literal("NotFound") }).passthrough(),
    z.object({ kind: z.literal("Unauthorized") }).passthrough(),
    z.object({ kind: z.literal("InternalError") }).passthrough(),
  ])
  .and(z.object({ message: z.string() }).passthrough());
const PartialAppServiceSchema = z
  .object({
    image: z.string(),
    name: z.string(),
    port: z.number().int(),
    replicas: z.number().int(),
  })
  .partial()
  .passthrough();
const PartialProjectSchema = z
  .object({ name: z.string() })
  .partial()
  .passthrough();
const Password = z.object({ password: z.string() }).passthrough();
const ProjectSchema = z.object({ name: z.string() }).passthrough();
const Token = z.string();
const User = z
  .object({ id: z.string().uuid(), username: z.string() })
  .passthrough();

export const schemas = {
  login_Body,
  create_app_Body,
  update_app_Body,
  ApiError,
  AppServiceSchema,
  AuthData,
  ErrorMessage,
  PartialAppServiceSchema,
  PartialProjectSchema,
  Password,
  ProjectSchema,
  Token,
  User,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/auth/login/",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: login_Body,
      },
    ],
    response: z
      .object({
        expires: z.string().datetime({ offset: true }).optional(),
        token: z.string(),
        user: z
          .object({ id: z.string().uuid(), username: z.string() })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 401,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
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
        schema: login_Body,
      },
    ],
    response: z
      .object({
        expires: z.string().datetime({ offset: true }).optional(),
        token: z.string(),
        user: z
          .object({ id: z.string().uuid(), username: z.string() })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 401,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 409,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
    ],
  },
  {
    method: "get",
    path: "/projects/",
    requestFormat: "json",
    response: z.array(
      z
        .object({
          id: z.string().uuid(),
          name: z.string(),
          userId: z.string().uuid(),
        })
        .passthrough()
    ),
    errors: [
      {
        status: 401,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
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
        schema: z.object({ name: z.string() }).passthrough(),
      },
    ],
    response: z
      .object({
        id: z.string().uuid(),
        name: z.string(),
        userId: z.string().uuid(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 401,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 409,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
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
    response: z
      .object({
        id: z.string().uuid(),
        name: z.string(),
        userId: z.string().uuid(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 404,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
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
    response: z
      .object({
        id: z.string().uuid(),
        name: z.string(),
        userId: z.string().uuid(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 404,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
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
        schema: z.object({ name: z.string() }).partial().passthrough(),
      },
      {
        name: "project_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        id: z.string().uuid(),
        name: z.string(),
        userId: z.string().uuid(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 401,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 404,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 409,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
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
      z
        .object({
          id: z.string().uuid(),
          image: z.string(),
          name: z.string(),
          port: z.number().int(),
          projectId: z.string().uuid(),
          replicas: z.number().int(),
        })
        .passthrough()
    ),
    errors: [
      {
        status: 401,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 404,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
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
        schema: create_app_Body,
      },
      {
        name: "project_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        id: z.string().uuid(),
        image: z.string(),
        name: z.string(),
        port: z.number().int(),
        projectId: z.string().uuid(),
        replicas: z.number().int(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 401,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 404,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 409,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
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
    response: z
      .object({
        id: z.string().uuid(),
        image: z.string(),
        name: z.string(),
        port: z.number().int(),
        projectId: z.string().uuid(),
        replicas: z.number().int(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 404,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
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
    response: z
      .object({
        id: z.string().uuid(),
        image: z.string(),
        name: z.string(),
        port: z.number().int(),
        projectId: z.string().uuid(),
        replicas: z.number().int(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 404,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
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
        schema: update_app_Body,
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
    response: z
      .object({
        id: z.string().uuid(),
        image: z.string(),
        name: z.string(),
        port: z.number().int(),
        projectId: z.string().uuid(),
        replicas: z.number().int(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 401,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 404,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
      {
        status: 409,
        schema: z
          .union([
            z.object({ kind: z.literal("BadRequest") }).passthrough(),
            z.object({ kind: z.literal("Validation") }).passthrough(),
            z.object({ kind: z.literal("AlreadyExists") }).passthrough(),
            z.object({ kind: z.literal("NotFound") }).passthrough(),
            z.object({ kind: z.literal("Unauthorized") }).passthrough(),
            z.object({ kind: z.literal("InternalError") }).passthrough(),
          ])
          .and(z.object({ message: z.string() }).passthrough()),
      },
    ],
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
