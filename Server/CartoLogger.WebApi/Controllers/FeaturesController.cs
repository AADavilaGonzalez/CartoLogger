using Microsoft.AspNetCore.Mvc;
using CartoLogger.Domain;
using CartoLogger.Domain.Entities;
using CartoLogger.WebApi.DTO;
using System.Text.Json;

namespace CartoLogger.WebApi.Controllers;

[ApiController]
[Route("api/features")]
public class FeaturesController(IUnitOfWork unitOfWork) : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    [HttpPost]
    public async Task<IActionResult> CreateFeature([FromBody] CreateFeatureRequest req )
    {
        if(req.MapId is int mapId && !await _unitOfWork.Maps.Exists(mapId))
        {
            return NotFound($"invalid map id: {mapId}");
        }

        if(req.UserId is int userId && !await _unitOfWork.Features.Exists(userId))
        {
            return NotFound($"invalid user id: {userId}");
        }

        var feature = CreateFeatureRequest.ToFeature(req);

        _unitOfWork.Features.Add(feature);
        await _unitOfWork.SaveChangesAsync();

        var featureDto = FeatureDto.FromFeature(feature);
        return CreatedAtAction(nameof(GetFeatureById), new { id = feature.Id }, featureDto);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetFeatureById([FromRoute] int id)
    {
        Feature? feature = await _unitOfWork.Features.GetById(id);

        if (feature is null)
        {
            return NotFound($"invalid feature id: {id}");
        }

        return Ok(FeatureDto.FromFeature(feature));
    }


    [HttpPut("{id}")]
    public async Task<ActionResult> ReplaceFeature(
        [FromRoute] int id, [FromBody] CreateFeatureRequest req
    ) { 
        Feature? feature = await _unitOfWork.Features.GetById(id);

        if(feature is null)
        {
            return NotFound($"invalid feature id: {id}");
        }
        feature.Type = FeatureGeoJson.GetTypeFromStr(req.GeoJson.Type);
        feature.Name = req.GeoJson.Properties.Name;
        feature.Description = req.GeoJson.Properties.Description;
        feature.Geometry = req.GeoJson.Geometry;

        await _unitOfWork.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateFeature(
        [FromRoute] int id, [FromBody] UpdateFeatureRequest req
    ) {
        Feature? feature = await _unitOfWork.Features.GetById(id);

        if(feature is null)
        {
            return NotFound($"invalid feature id: {id}");
        }
        if(req.GeoJson?.Type is string type)
        {
            feature.Type = FeatureGeoJson.GetTypeFromStr(type);
        }
        if(req.GeoJson?.Properties?.Name is string name)
        {
            feature.Name = name;
        }
        if(req.GeoJson?.Properties?.Description is string description) {
            feature.Description = description;
        }
        if(req.GeoJson?.Geometry is JsonDocument geometry) {
            feature.Geometry = geometry;
        }

        await _unitOfWork.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFeature([FromRoute] int id)
    {
        if(!await _unitOfWork.Features.Exists(id))
        {
            return NotFound($"invalid feature id: {id}");
        }
        await _unitOfWork.Features.RemoveById(id);
        return NoContent();
    }

    [HttpPut("{id}/assing-user/{userId}")]
    public async Task<IActionResult> AssingUser(
        [FromRoute] int id, [FromRoute] int userId
    ) {
        if(!await _unitOfWork.Users.Exists(userId)) {
            return NotFound($"invalid user id: {userId}");
        }
        Feature? feature = await _unitOfWork.Features.GetById(id);
        if(feature is null)
        {
            return NotFound($"invalid map id: {id}");
        }
        feature.UserId = userId;
        await _unitOfWork.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id}/assing-map/{mapId}")]
    public async Task<IActionResult> AssingMap(
        [FromRoute] int id, [FromRoute] int mapId
    ) {
        if(!await _unitOfWork.Maps.Exists(mapId)) {
            return NotFound($"invalid map id: {mapId}");
        }
        Feature? feature = await _unitOfWork.Features.GetById(id);
        if(feature is null)
        {
            return NotFound($"invalid map id: {id}");
        }
        feature.MapId = mapId;
        await _unitOfWork.SaveChangesAsync();
        return NoContent();
    }
}
