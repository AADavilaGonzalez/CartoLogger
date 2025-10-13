/*
    * @module api
    * 
    * This module comunicates with the remote api to fetch application data
    * and defines the data types the app will use across every other module
*/

interface UserDTO {
    id: number;
    name: string;
    email: string;
}

interface MapDTO {
    id: number;
    title: string;
    description: string;
}

interface FeatureDTO {
    id: number;
    description: string;
    geojson: object;
}
