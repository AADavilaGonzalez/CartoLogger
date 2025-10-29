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

    [HttpPost]
    public async Task<ActionResult<FeatureDto>> CreateFeature([FromBody] CreateFeatureDto createDto)
    {
        Map? map = null;
        if (createDto.MapId.HasValue)
        {
            map = await _unitOfWork.Maps.GetById(createDto.MapId.Value);
            if (map == null)
                return NotFound($"Mapa con ID {createDto.MapId} no encontrado.");
        }

        User? user = null;
        if (createDto.UserId.HasValue)
        {
            user = await _unitOfWork.Users.GetById(createDto.UserId.Value);
            if (user == null)
                return NotFound($"Usuario con ID {createDto.UserId} no encontrado.");
        }

        var feature = new Feature
        {
            Type = createDto.Type,
            Name = createDto.Name,
            Description = createDto.Description,
            Geometry = createDto.Geometry,
            Map = map,
            User = user
        };

        _unitOfWork.Features.Add(feature);
        await _unitOfWork.SaveChangesAsync();

        var featureDto = FeatureDto.Map(feature);

        return CreatedAtAction(nameof(GetFeatureById), new { id = feature.Id }, featureDto);
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<FeatureDto>> GetFeatureById(int id)
    {
        var feature = await _unitOfWork.Features.GetById(id);

        if (feature is null)
        {
            return NotFound(new { message = $"Feature con ID {id} no encontrada." });
        }

        var dto = FeatureDto.Map(feature);
        return Ok(dto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<FeatureDto>> UpdateFeature(int id, [FromBody] CreateFeatureDto updateDto)
    {
        var featureToUpdate = await _unitOfWork.Features.GetById(id); // cite: uploaded:aadavilagonzalez/cartologger/CartoLogger-4ac715a786fd34c7b99432bfe37c200a076bf564/Server/CartoLogger.Domain/Interfaces/IRepository.cs

        if (featureToUpdate is null)
        {
            return NotFound(new { message = $"Feature con ID {id} no encontrada para actualizar." }); // Retorna 404
        }


        if (updateDto.Name != null) featureToUpdate.Name = updateDto.Name;
        if (updateDto.Description != null) featureToUpdate.Description = updateDto.Description;
        if (updateDto.Geometry != null) featureToUpdate.Geometry = updateDto.Geometry;

        try
        {
            await _unitOfWork.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {

            var exists = await _unitOfWork.Features.Exists(id);
            if (!exists) return NotFound();
            else throw;
        }


        return NoContent(); // Retorna 204 No Content indicando éxito
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFeature(int id)
    {
        var featureToDelete = await _unitOfWork.Features.GetById(id);

        if (featureToDelete is null)
        {
            return NotFound(new { message = $"Feature con ID {id} no encontrada para eliminar." }); // Retorna 404
        }

        _unitOfWork.Features.Remove(featureToDelete);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }
}