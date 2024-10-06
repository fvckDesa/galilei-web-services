import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

export const Password = z.object({ password: z.string().min(1) });
export type TPassword = z.infer<typeof Password>;
export const AuthData = Password.and(
  z.object({ remember: z.boolean(), username: z.string().min(1) })
);
export type TAuthData = z.infer<typeof AuthData>;
export const Token = z.string();
export type TToken = z.infer<typeof Token>;
export const User = z.object({ id: z.string().uuid(), username: z.string() });
export type TUser = z.infer<typeof User>;
export const AuthResponse = z.object({
  expires: z.number().int().optional(),
  token: Token,
  user: User,
});
export type TAuthResponse = z.infer<typeof AuthResponse>;
export const ApiError = z.union([
  z.object({ kind: z.literal("BadRequest") }),
  z.object({ kind: z.literal("Validation") }),
  z.object({ kind: z.literal("AlreadyExists") }),
  z.object({ kind: z.literal("NotFound") }),
  z.object({ kind: z.literal("Unauthorized") }),
  z.object({ kind: z.literal("InternalError") }),
]);
export type TApiError = z.infer<typeof ApiError>;
export const ErrorMessage = ApiError.and(z.object({ message: z.string() }));
export type TErrorMessage = z.infer<typeof ErrorMessage>;
export const ProjectSchema = z.object({ name: z.string().min(1) });
export type TProjectSchema = z.infer<typeof ProjectSchema>;
export const PartialProjectSchema = z
  .object({ name: z.string().min(1) })
  .partial();
export type TPartialProjectSchema = z.infer<typeof PartialProjectSchema>;
export const DomainName = z
  .object({
    subdomain: z
      .string()
      .min(1)
      .max(62)
      .regex(/(^[a-zA-Z0-9]$)|(^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]$)/),
  })
  .partial();
export type TDomainName = z.infer<typeof DomainName>;
export const AppServiceSchema = z.object({
  image: z.string().min(1),
  name: z.string().min(1),
  port: z.number().int().gte(1).lte(65535),
  privateDomain: DomainName,
  publicDomain: DomainName,
  replicas: z.number().int().gte(0),
});
export type TAppServiceSchema = z.infer<typeof AppServiceSchema>;
export const PartialAppServiceSchema = z
  .object({
    image: z.string().min(1),
    name: z.string().min(1),
    port: z.number().int().gte(1).lte(65535),
    privateDomain: DomainName,
    publicDomain: DomainName,
    replicas: z.number().int().gte(0),
  })
  .partial();
export type TPartialAppServiceSchema = z.infer<typeof PartialAppServiceSchema>;
export const EnvSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});
export type TEnvSchema = z.infer<typeof EnvSchema>;
export const PartialEnvSchema = z
  .object({ name: z.string().min(1), value: z.string().min(1) })
  .partial();
export type TPartialEnvSchema = z.infer<typeof PartialEnvSchema>;
export const VolumeAppId = z.object({ id: z.string().uuid() }).partial();
export type TVolumeAppId = z.infer<typeof VolumeAppId>;
export const VolumeSchema = z.object({
  app: VolumeAppId,
  capacity: z.number().int().gte(1).lte(5000),
  name: z.string().min(1),
  path: z
    .string()
    .min(1)
    .regex(/^\/([a-zA-Z0-9.\-_\/])*/),
});
export type TVolumeSchema = z.infer<typeof VolumeSchema>;
export const PartialVolumeSchema = z
  .object({
    app: VolumeAppId,
    capacity: z.number().int().gte(1).lte(5000),
    name: z.string().min(1),
    path: z
      .string()
      .min(1)
      .regex(/^\/([a-zA-Z0-9.\-_\/])*/),
  })
  .partial();
export type TPartialVolumeSchema = z.infer<typeof PartialVolumeSchema>;
export const AppReleaseState = z.enum([
  "Unknown",
  "Failed",
  "Progressing",
  "Released",
]);
export type TAppReleaseState = z.infer<typeof AppReleaseState>;
export const AppService = z.object({
  deleted: z.boolean(),
  id: z.string().uuid(),
  image: z.string(),
  name: z.string(),
  port: z.number().int(),
  privateDomain: z.string().optional(),
  projectId: z.string().uuid(),
  publicDomain: z.string().optional(),
  replicas: z.number().int(),
});
export type TAppService = z.infer<typeof AppService>;
export const AppStatus = z.object({
  available: z.boolean(),
  state: AppReleaseState,
});
export type TAppStatus = z.infer<typeof AppStatus>;
export const EnvVar = z.object({
  appId: z.string().uuid(),
  id: z.string().uuid(),
  name: z.string(),
  value: z.string(),
});
export type TEnvVar = z.infer<typeof EnvVar>;
export const Volume = z.object({
  appId: z.string().uuid().optional(),
  capacity: z.number().int(),
  deleted: z.boolean(),
  id: z.string().uuid(),
  name: z.string(),
  path: z.string(),
  projectId: z.string().uuid(),
});
export type TVolume = z.infer<typeof Volume>;

export const endpoints = makeApi([
  {
    method: "post",
    path: "/auth/login/",
    alias: "login",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AuthData,
      },
    ],
    response: AuthResponse,
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
    alias: "register",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AuthData,
      },
    ],
    response: AuthResponse,
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
    alias: "listProjects",
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
    alias: "createProject",
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
    alias: "getProject",
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
    method: "post",
    path: "/projects/:project_id/",
    alias: "releaseProject",
    requestFormat: "json",
    parameters: [
      {
        name: "project_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
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
    method: "delete",
    path: "/projects/:project_id/",
    alias: "deleteProject",
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
    alias: "updateProject",
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
    path: "/projects/:project_id/apps/",
    alias: "listApps",
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
        deleted: z.boolean(),
        id: z.string().uuid(),
        image: z.string(),
        name: z.string(),
        port: z.number().int(),
        privateDomain: z.string().optional(),
        projectId: z.string().uuid(),
        publicDomain: z.string().optional(),
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
    path: "/projects/:project_id/apps/",
    alias: "createApp",
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
      deleted: z.boolean(),
      id: z.string().uuid(),
      image: z.string(),
      name: z.string(),
      port: z.number().int(),
      privateDomain: z.string().optional(),
      projectId: z.string().uuid(),
      publicDomain: z.string().optional(),
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
    path: "/projects/:project_id/apps/:app_id/",
    alias: "getApp",
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
      deleted: z.boolean(),
      id: z.string().uuid(),
      image: z.string(),
      name: z.string(),
      port: z.number().int(),
      privateDomain: z.string().optional(),
      projectId: z.string().uuid(),
      publicDomain: z.string().optional(),
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
    path: "/projects/:project_id/apps/:app_id/",
    alias: "deleteApp",
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
      deleted: z.boolean(),
      id: z.string().uuid(),
      image: z.string(),
      name: z.string(),
      port: z.number().int(),
      privateDomain: z.string().optional(),
      projectId: z.string().uuid(),
      publicDomain: z.string().optional(),
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
    path: "/projects/:project_id/apps/:app_id/",
    alias: "updateApp",
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
      deleted: z.boolean(),
      id: z.string().uuid(),
      image: z.string(),
      name: z.string(),
      port: z.number().int(),
      privateDomain: z.string().optional(),
      projectId: z.string().uuid(),
      publicDomain: z.string().optional(),
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
    path: "/projects/:project_id/apps/:app_id/envs/",
    alias: "listEnvs",
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
    response: z.array(
      z.object({
        appId: z.string().uuid(),
        id: z.string().uuid(),
        name: z.string(),
        value: z.string(),
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
    path: "/projects/:project_id/apps/:app_id/envs/",
    alias: "createEnv",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: EnvSchema,
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
      appId: z.string().uuid(),
      id: z.string().uuid(),
      name: z.string(),
      value: z.string(),
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
    path: "/projects/:project_id/apps/:app_id/envs/:env_id/",
    alias: "getEnv",
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
      {
        name: "env_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({
      appId: z.string().uuid(),
      id: z.string().uuid(),
      name: z.string(),
      value: z.string(),
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
    path: "/projects/:project_id/apps/:app_id/envs/:env_id/",
    alias: "deleteEnv",
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
      {
        name: "env_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({
      appId: z.string().uuid(),
      id: z.string().uuid(),
      name: z.string(),
      value: z.string(),
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
    path: "/projects/:project_id/apps/:app_id/envs/:env_id/",
    alias: "updateEnv",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PartialEnvSchema,
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
      {
        name: "env_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({
      appId: z.string().uuid(),
      id: z.string().uuid(),
      name: z.string(),
      value: z.string(),
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
    method: "post",
    path: "/projects/:project_id/apps/:app_id/recover/",
    alias: "recoverApp",
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
      deleted: z.boolean(),
      id: z.string().uuid(),
      image: z.string(),
      name: z.string(),
      port: z.number().int(),
      privateDomain: z.string().optional(),
      projectId: z.string().uuid(),
      publicDomain: z.string().optional(),
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
    method: "get",
    path: "/projects/:project_id/apps/:app_id/status/",
    alias: "getAppStatus",
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
    response: z.void(),
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
    method: "get",
    path: "/projects/:project_id/volumes/",
    alias: "listVolumes",
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
        appId: z.string().uuid().optional(),
        capacity: z.number().int(),
        deleted: z.boolean(),
        id: z.string().uuid(),
        name: z.string(),
        path: z.string(),
        projectId: z.string().uuid(),
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
    path: "/projects/:project_id/volumes/",
    alias: "createVolume",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: VolumeSchema,
      },
      {
        name: "project_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({
      appId: z.string().uuid().optional(),
      capacity: z.number().int(),
      deleted: z.boolean(),
      id: z.string().uuid(),
      name: z.string(),
      path: z.string(),
      projectId: z.string().uuid(),
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
    path: "/projects/:project_id/volumes/:volume_id/",
    alias: "getVolume",
    requestFormat: "json",
    parameters: [
      {
        name: "project_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "volume_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({
      appId: z.string().uuid().optional(),
      capacity: z.number().int(),
      deleted: z.boolean(),
      id: z.string().uuid(),
      name: z.string(),
      path: z.string(),
      projectId: z.string().uuid(),
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
    path: "/projects/:project_id/volumes/:volume_id/",
    alias: "deleteVolume",
    requestFormat: "json",
    parameters: [
      {
        name: "project_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "volume_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({
      appId: z.string().uuid().optional(),
      capacity: z.number().int(),
      deleted: z.boolean(),
      id: z.string().uuid(),
      name: z.string(),
      path: z.string(),
      projectId: z.string().uuid(),
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
    path: "/projects/:project_id/volumes/:volume_id/",
    alias: "updateVolume",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PartialVolumeSchema,
      },
      {
        name: "project_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "volume_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({
      appId: z.string().uuid().optional(),
      capacity: z.number().int(),
      deleted: z.boolean(),
      id: z.string().uuid(),
      name: z.string(),
      path: z.string(),
      projectId: z.string().uuid(),
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
    method: "delete",
    path: "/projects/:project_id/volumes/:volume_id/recover/",
    alias: "recoverVolume",
    requestFormat: "json",
    parameters: [
      {
        name: "project_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "volume_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({
      appId: z.string().uuid().optional(),
      capacity: z.number().int(),
      deleted: z.boolean(),
      id: z.string().uuid(),
      name: z.string(),
      path: z.string(),
      projectId: z.string().uuid(),
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
]);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
