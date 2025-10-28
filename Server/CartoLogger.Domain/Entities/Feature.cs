using System.Text.Json;
using CartoLogger.Domain.Interfaces;

namespace CartoLogger.Domain.Entities;

public enum FeatureType {
    Feature,
    FeatureCollection
}

public class Feature : IEntity
{
    public int Id {get; private set;}
    public required FeatureType Type {get; set;}
    public required string Name {get; set;}
    public required string Description {get; set;}
    public required JsonDocument Geometry {get; set;}

    public int? MapId {get; private set;}
    public Map? Map {get; init;}

    public int? UserId {get; private set;}
    public User? User {get; init;}
}
