namespace CartoLogger.WebApi.DTO
{
    public class FeatureDTO
    {
        public required int Id { get; init; }
        public required string Data { get; set; }
    }

    public class CreateFeatureDto
    {
        public required string Data { get; set; }
        public int? MapId { get; set; }
        public int? UserId { get; set; }
    }

    public class UpdateFeatureDto
    {
        public required string Data { get; set; }
    }
}