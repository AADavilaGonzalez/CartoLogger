using System.Text.Json;

using CartoLogger.Domain.Entities;

namespace CartoLogger.WebApi.DTO;

public class Properties
{ 
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
}

public class FeatureGeoJson
{
    public required string Type { get; set; }
    public required Properties Properties { get; set; }
    public required JsonDocument Geometry { get; set; }

    public static string GetTypeString(FeatureType type)
    {
        return type switch  {
            FeatureType.Feature => "Feature",
            FeatureType.FeatureCollection => "FeatureCollection",
            _ => throw new ArgumentException("invalid feature type")
        };
    }
}

public class FeatureDto
{
    public required int? MapId { get; set; }
    public required FeatureGeoJson GeoJson { get; set; }

    public static FeatureDto Map(Feature feature)
    {
        return new FeatureDto
        {
            MapId = feature.MapId,
            GeoJson = new FeatureGeoJson {
                Type = FeatureGeoJson.GetTypeString(feature.Type),
                Properties = new Properties {
                    Id = feature.Id,
                    Name = feature.Name,
                    Description = feature.Description
                },
                Geometry = feature.Geometry
            }     
        };
    }
}

public class CreateFeatureDto
{
    public required string Data { get; set; }
    public int? MapId { get; set; }
    public int? UserId { get; set; }
}



