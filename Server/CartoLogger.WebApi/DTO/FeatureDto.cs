using System.ComponentModel.DataAnnotations;
using CartoLogger.Domain.Entities;

namespace CartoLogger.WebApi.DTO;

public class Properties
{ 
    public required string Name {get; set;}
    public required string Description {get; set;}
}

public class PartialProperties
{
    public string? Name {get; set;}
    public string? Description {get; set;}
}


public class FeatureGeoJson
{
    public required string Type { get; set; }
    public required Properties Properties { get; set; }
    public required string Geometry { get; set; }

    public static string GetStrFromType(FeatureType type)
    {
        return type switch
        {
            FeatureType.Feature => "Feature",
            FeatureType.FeatureCollection => "FeatureCollection",
            _ => throw new ArgumentException("invalid feature type")
        };
    }

    public static FeatureType GetTypeFromStr(string str)
    {
        return str switch
        {
            "Feature" => FeatureType.Feature,
            "FeatureCollection" => FeatureType.FeatureCollection,
            _ => throw new ArgumentException("invalid feature string")
        };
    } 
}

public class PartialFeatureGeoJson
{
    public string? Type {get; set;}
    public PartialProperties? Properties {get; set;}
    public string? Geometry { get; set; }
}


public class CreateFeatureRequest
{
    [Required]
    public required int? UserId {get; set;}
    [Required]
    public required int? MapId {get; set;}
    [Required]
    public required FeatureGeoJson GeoJson {get; set;}

    public static Feature ToFeature(CreateFeatureRequest req)
    {
        return new Feature
        {
            Type = FeatureGeoJson.GetTypeFromStr(req.GeoJson.Type),
            Name = req.GeoJson.Properties.Name,
            Description = req.GeoJson.Properties.Description,
            Geometry = req.GeoJson.Geometry
        };
    }
}


public class UpdateFeatureRequest
{
    public PartialFeatureGeoJson? GeoJson {get; set;}
}


public class FeatureDto
{
    public required int Id {get; set;}
    public required int? UserId { get; set; }
    public required int? MapId { get; set; }
    public required FeatureGeoJson GeoJson { get; set; }

    public static FeatureDto FromFeature(Feature feature)
    {
        return new FeatureDto
        {
            Id = feature.Id,
            UserId = feature.UserId,
            MapId = feature.MapId,
            GeoJson = new FeatureGeoJson {
                Type = FeatureGeoJson.GetStrFromType(feature.Type),
                Properties = new Properties {
                    Name = feature.Name,
                    Description = feature.Description
                },
                Geometry = feature.Geometry
            }     
        };
    }
}
