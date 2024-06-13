"use server";

import {
  Login,
  LoginSchema,
  GalaxyData,
  GalaxyDataSchema,
  PlanetData,
  PlanetDataSchema,
  Register,
  RegisterSchema,
  StarData,
  StarDataSchema,
  UpdateStarData,
  UpdateStarDataSchema,
  UpdatePlanetData,
  UpdatePlanetDataSchema,
  StarVariableData,
  StarVariableDataSchema,
} from "./schema";
import { api } from "./api";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError } from "api-client";

export async function login(data: Login) {
  const loginData = LoginSchema.parse(data);

  const { error } = await api.POST("/auth/login", { body: loginData });

  if (error) {
    throw new ApiError(error);
  }

  redirect("/galaxies");
}

export async function register(data: Register) {
  const registerData = RegisterSchema.parse(data);

  const { error } = await api.POST("/auth/register", { body: registerData });

  if (error) {
    throw new ApiError(error);
  }

  redirect("/galaxies");
}

export async function logout() {
  const { error } = await api.DELETE("/auth/logout", {
    method: "DELETE",
  });

  if (error) {
    throw new ApiError(error);
  }

  redirect("/login");
}

export async function newGalaxy(data: GalaxyData) {
  const galaxyData = GalaxyDataSchema.parse(data);

  const { error, data: galaxy } = await api.POST("/galaxies", {
    body: galaxyData,
  });

  if (error) {
    throw new ApiError(error);
  }

  redirect(`/galaxies/${galaxy.id}`);
}

export async function updateGalaxy(galaxy_id: string, data: GalaxyData) {
  const galaxyData = GalaxyDataSchema.parse(data);

  const { error, data: galaxy } = await api.PUT("/galaxies/{galaxy_id}", {
    params: { path: { galaxy_id } },
    body: galaxyData,
  });

  if (error) {
    throw new ApiError(error);
  }

  redirect(`/galaxies/${galaxy.id}`);
}

export async function deleteGalaxy(galaxy_id: string) {
  const { error } = await api.DELETE("/galaxies/{galaxy_id}", {
    params: { path: { galaxy_id } },
  });

  if (error) {
    throw new ApiError(error);
  }

  redirect("/galaxies");
}

export async function newStar(galaxyId: string, data: StarData) {
  const starData = StarDataSchema.parse(data);

  const { public_domain, private_domain, ...rest } = starData;

  const { error, data: star } = await api.POST("/galaxies/{galaxy_id}/stars", {
    params: {
      path: { galaxy_id: galaxyId },
    },
    body: {
      ...rest,
      public_domain: {
        subdomain: public_domain.length === 0 ? null : public_domain,
      },
      private_domain: {
        subdomain: private_domain.length === 0 ? null : private_domain,
      },
    },
  });

  if (error) {
    throw new ApiError(error);
  }

  revalidateTag("galaxy");
  redirect(`/galaxies/${star.galaxy_id}/stars/${star.id}`);
}

export async function updateStar(
  galaxyId: string,
  starId: string,
  data: UpdateStarData
) {
  const starData = UpdateStarDataSchema.parse(data);

  const { public_domain, private_domain, ...rest } = starData;

  const { error } = await api.PUT("/galaxies/{galaxy_id}/stars/{star_id}", {
    params: {
      path: { galaxy_id: galaxyId, star_id: starId },
    },
    body: {
      ...rest,
      public_domain:
        public_domain != undefined
          ? {
              subdomain: public_domain.length === 0 ? null : public_domain,
            }
          : null,
      private_domain:
        private_domain != undefined
          ? {
              subdomain: private_domain.length === 0 ? null : private_domain,
            }
          : null,
    },
  });

  if (error) {
    throw new ApiError(error);
  }

  revalidateTag("galaxy");
}

export async function deleteStar(galaxyId: string, starId: string) {
  const { error } = await api.DELETE("/galaxies/{galaxy_id}/stars/{star_id}", {
    params: {
      path: {
        galaxy_id: galaxyId,
        star_id: starId,
      },
    },
  });

  if (error) {
    throw new ApiError(error);
  }

  revalidateTag("galaxy");
  redirect(`/galaxies/${galaxyId}`);
}

export async function addStarVariable(
  galaxyId: string,
  starId: string,
  data: StarVariableData
) {
  const varData = StarVariableDataSchema.parse(data);

  const { error } = await api.POST(
    "/galaxies/{galaxy_id}/stars/{star_id}/vars",
    {
      params: {
        path: {
          galaxy_id: galaxyId,
          star_id: starId,
        },
      },
      body: varData,
    }
  );

  if (error) {
    throw new ApiError(error);
  }

  revalidateTag("enviroment");
}

export async function deleteStarVariable(
  galaxyId: string,
  starId: string,
  varId: string
) {
  console.log(varId);
  const { error } = await api.DELETE(
    "/galaxies/{galaxy_id}/stars/{star_id}/vars/{variable_id}",
    {
      params: {
        path: { galaxy_id: galaxyId, star_id: starId, variable_id: varId },
      },
    }
  );

  if (error) {
    throw new ApiError(error);
  }

  revalidateTag("enviroment");
}

export async function newPlanet(galaxyId: string, data: PlanetData) {
  const { star_id, ...rest } = PlanetDataSchema.parse(data);

  const { error, data: planet } = await api.POST(
    "/galaxies/{galaxy_id}/planets",
    {
      params: {
        path: { galaxy_id: galaxyId },
      },
      body: { ...rest, star: { id: star_id.length === 0 ? null : star_id } },
    }
  );

  if (error) {
    throw new ApiError(error);
  }

  revalidateTag("galaxy");
  redirect(`/galaxies/${planet.galaxy_id}/planets/${planet.id}`);
}

export async function updatePlanet(
  galaxyId: string,
  planetId: string,
  data: UpdatePlanetData
) {
  const { star_id, ...rest } = UpdatePlanetDataSchema.parse(data);

  const { error } = await api.PUT("/galaxies/{galaxy_id}/planets/{planet_id}", {
    params: {
      path: { galaxy_id: galaxyId, planet_id: planetId },
    },
    body: {
      ...rest,
      star:
        star_id != undefined
          ? { id: star_id.length === 0 ? null : star_id }
          : null,
    },
  });

  if (error) {
    throw new ApiError(error);
  }

  revalidateTag("galaxy");
}

export async function deletePlanet(galaxyId: string, planetId: string) {
  const { error } = await api.DELETE(
    "/galaxies/{galaxy_id}/planets/{planet_id}",
    {
      params: {
        path: {
          galaxy_id: galaxyId,
          planet_id: planetId,
        },
      },
    }
  );

  if (error) {
    throw new ApiError(error);
  }

  revalidateTag("galaxy");
  redirect(`/galaxies/${galaxyId}`);
}
