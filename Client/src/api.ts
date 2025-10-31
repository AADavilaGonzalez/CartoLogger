import { type LatLng } from "leaflet";

export type UserDto = {
    id: number;
    name: string;
    email: string;
    maps?: MapDto[];
}

export type MapDto = {
    id: number;
    userId: number | null;
    title: string;
    description: string;
    viewCenter: LatLng;
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
        }
        geometry: any;
    };
}

export type UserData = {
   username: string 
}

export async function getUserData(userId: number): Promise<UserData> {
    const response = await fetch(`/api/users/${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const user: UserDto =  await response.json();
    return {
        username: user.name
    }
}

export async function getUserMaps(userId: number): Promise<MapDto[]> {
    const response = await fetch(`/api/users/${userId}/maps`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    return await response.json();
}

export async function getMapFeatures(mapId: number): Promise<FeatureDto[]> {
    const response = await fetch(`/api/users/${mapId}/features`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    return await response.json();
}
