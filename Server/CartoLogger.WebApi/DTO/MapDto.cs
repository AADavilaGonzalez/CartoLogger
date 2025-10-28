using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

using CartoLogger.Domain.Entities;

namespace CartoLogger.WebApi.DTO;

public class CreateMapRequest
{
    [Required]
    public required int UserId { get; set; }
    [Required]
    public required string Title { get; set; }
    [Required]
    public required string Description { get; set; }
}

public class UpdateMapRequest
{
    [Required]
    public int? UserId { get; set; }
    [Required]
    public string? Title { get; set; }
    [Required]
    public string? Description {get; set;}
}

public class MapDto {
    public required int Id { get; set; }
    public required int? UserId { get; set; }
    public required string Title { get; set; }
    public required string Description {get; set;}

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public IEnumerable<FeatureDto>? Features {get; set;}

    public static MapDto Map(Map map, bool features = false)
    {
        return new MapDto {
            Id = map.Id,
            UserId = map.UserId,
            Title = map.Title,
            Description =  map.Description,
            Features = features ? map.Features.Select(FeatureDto.Map) : null
        };
    }
}

