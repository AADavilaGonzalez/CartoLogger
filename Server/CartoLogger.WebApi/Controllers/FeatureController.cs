using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CartoLogger.Domain;
using CartoLogger.Domain.Constraints;
using CartoLogger.Domain.Entities;
using CartoLogger.WebApi.DTO;
using CartoLogger.Persistence;

namespace CartoLogger.WebApi.Controllers;

[ApiController]
[Route("api/feature")]
public class FeatureController(IUnitOfWork unitOfWork) : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    /*
    [HttpPost]
    public async Task<ActionResult<FeatureDTO>> CreateFeature([FromBody] CreateFeatureDto createDto)
    {
        Map? map = null;
        if (createDto.MapId.HasValue)
        {
            // 3. Usa 'context' (minúscula), que viene del constructor primario
            map = await context.Maps.FindAsync(createDto.MapId.Value);
            if (map == null)
                return NotFound($"Map with ID {createDto.MapId} not found.");
        }

        User? user = null;
        if (createDto.UserId.HasValue)
        {
            user = await context.Users.FindAsync(createDto.UserId.Value);
            if (user == null)
                return NotFound($"User with ID {createDto.UserId} not found.");
        }

        var feature = new Feature
        {
            Data = createDto.Data,
            Map = map,
            User = user
        };

        context.Features.Add(feature);
        await context.SaveChangesAsync();

        var featureDto = new FeatureDTO
        {
            Id = feature.Id,
            Data = feature.Data
        };
        return CreatedAtAction(nameof(GetFeatureById), new { id = featureDto.Id }, featureDto);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FeatureDTO>>> GetFeatures()
    {
        var features = await context.Features
            .Select(f => new FeatureDTO
            {
                Id = f.Id,
                Data = f.Data
            })
            .ToListAsync();
        
        return Ok(features);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FeatureDTO>> GetFeatureById(int id)
    {
        var featureDto = await context.Features
            .Where(f => f.Id == id)
            .Select(f => new FeatureDTO
            {
                Id = f.Id,
                Data = f.Data
            })
            .FirstOrDefaultAsync();

        if (featureDto == null)
        {
            return NotFound();
        }

        return Ok(featureDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFeature(int id, [FromBody] UpdateFeatureDto updateDto)
    {
        var feature = await context.Features.FindAsync(id);

        if (feature == null)
        {
            return NotFound();
        }

        feature.Data = updateDto.Data;

        try
        {
            await context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!context.Features.Any(e => e.Id == id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFeature(int id)
    {
        var feature = await context.Features.FindAsync(id);
        if (feature == null)
        {
            return NotFound();
        }

        context.Features.Remove(feature);
        await context.SaveChangesAsync();

        return NoContent(); 
    }
    */
}
