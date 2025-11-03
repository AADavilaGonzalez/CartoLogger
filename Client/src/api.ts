import type { View } from "@/types";


export type UserDto = {
    id: number;
    name: string;
    email: string;
    maps?: MapDto[];
    favoriteMaps?: MapDto[];
}

export type MapDto = {
    id: number;
    userId: number | null;
    title: string;
    description: string;
    view: View, 
    features?: FeatureDto[];
}

export type FeatureDto = {
    id: number;
    userId: number | null;
    mapId: number | null;
    geojson: {
        type: "Feature" | "FeatureCollection";
        properties: {
            name: string;
            description: string;
        };
        geometry: any;
    };
}

export type UserData = {
   username: string 
}

async function handleRequest<T>(
    responseSupplier: () => Promise<Response>,
): Promise<T> {

  const response = await responseSupplier();

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      typeof data === "object"
        ? data?.title || data?.message || JSON.stringify(data)
        : String(data ?? "Unknown error");

    const error = new Error(message);
    (error as any).status = response.status;
    (error as any).details = data;
    throw error;
  }

  return data as T;
    
}

export async function getUserData(
    userId: number
): Promise<UserData> {
    const userDto: UserDto = await handleRequest(() =>
        fetch(`/api/users/${userId}`, {
            method: "GET"
        })
    );
    return {username: userDto.name}
}

export async function getUserMaps(
    userId: number
): Promise<MapDto[]> {
    return handleRequest(() =>
        fetch(`/api/users/${userId}/maps`, {
            method: "GET"
        })
    );
}

export async function getUserFavoriteMaps(
    userId: number
): Promise<MapDto[]> {
    return handleRequest(() =>
        fetch(`/api/users/${userId}/favorite-maps`, {
            method: "GET"
        })
    );
}

export async function getMapFeatures(
    mapId: number
): Promise<FeatureDto[]> {
    return handleRequest(() =>
        fetch(`/api/maps/${mapId}/features`, {
            method: "GET"
        })
    );
}

type MapCreateRequest = {
    userId: number | null;
    title: string;
    description: string;
    view?: View;
}

export async function createMapResorce(
    req: MapCreateRequest
): Promise<MapDto> {
    return handleRequest(() =>
        fetch("/api/maps/", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req)
        }) 
    );
}

type UpdateMapRequest = {
    title?: string;
    description?: string;
    view?: Partial<View>;
};

export async function updateMapResource(
    mapId: number, req: UpdateMapRequest
): Promise<void> {
    return handleRequest(() =>
        fetch(`/api/maps/${mapId}`, {
            method: "PATCH",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req)
        }) 
    );
}

export async function deleteMapResource(
    mapId: number
): Promise<void> {
    return handleRequest(() =>
        fetch(`/api/maps/${mapId}`, {
            method: "DELETE",
        })
    );
}

export async function addMapToFavorites(
    userId: number, mapId: number
): Promise<void> {
    return handleRequest(() =>
        fetch(`/api/users/${userId}/add-map-to-favorites/${mapId}`, {
            method: "POST"
        })
    );
}

export async function removeMapFromFavorites(
    userId: number, mapId: number
): Promise<void> {
    return handleRequest(() =>
        fetch(`/api/users/${userId}/remove-map-from-favorites/${mapId}`, {
            method: "DELETE"
        })
    );
}

type CreateFeatureRequest = {
    userId: number | null;
    mapId: number | null;
    geojson: {
        type: "Feature" | "FeatureCollection";
        properties: {
            name: string;
            description: string;
        };
        geometry: any;
    };
}

export async function createFeatureResource(
    req: CreateFeatureRequest
): Promise<FeatureDto> {
    return handleRequest(() => 
        fetch(`/api/features/`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req)
        })
    ); 
}

type UpdateFeatureRequest = {
    geojson?: {
        type?: "Feature" | "FeatureCollection";
        properties?: {
            name?: string;
            description?: string;
        };
        geometry?: any;
    };
}

export async function updateFeatureResource(
    featureId: number,
    req: UpdateFeatureRequest
): Promise<void> {
    return handleRequest(() => 
        fetch(`/api/features/${featureId}`, {
            method: "PATCH",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req)
        })
    ); 
}

export async function deleteFeatureResource(
    featureId: number
): Promise<void> {
    return handleRequest(() =>
        fetch(`/api/features/${featureId}`, {
            method: "DELETE"
        })
    );
}
