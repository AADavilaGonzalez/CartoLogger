namespace CartoLogger.Domain.Entities;

public class Feature
{
    public int Id {get; init;}
    public required string Data {get; set;}

    public int MapId {get; private set;}
    public required Map Map {get; init;}

    public int UserId {get; private set;}
    public required User User {get; init;}
}
