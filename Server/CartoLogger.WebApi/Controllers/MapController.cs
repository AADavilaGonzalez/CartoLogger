using Microsoft.AspNetCore.Mvc;
using CartoLogger.Domain;
using CartoLogger.Domain.Entities;
using CartoLogger.WebApi.DTO;

namespace CartoLogger.WebApi.Controllers;

[ApiController]
[Route("api/map")]
public class MapController(IUnitOfWork unitOfWork) : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    [HttpPost("create")]
    public async Task<IActionResult> CreateMap(CreateMapRequest req) {

        if(Map.TitleConstraints
              .IsValidTitle(req.Title, out string? titleErr)
        ) {
            return BadRequest(new { error = titleErr } );
        }

        if(Map.DescriptionConstraints
              .IsValidDescription(req.Description, out string? descErr)
        ) {
           return BadRequest(new { error = descErr });
        }
        
        if(req.UserId is int id && !await _unitOfWork.Users.Exists(id))
        {
            return BadRequest(new {error  = "invalid user id"});
        }

        var map = new Map
        {
            UserId = req.UserId,
            Title = req.Title,
            Description = req.Description
        };
        _unitOfWork.Maps.Add(map);
        return Ok();
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ReadMap(
        [FromRoute] int id, [FromQuery] bool features = false
    ) {
        var map = await _unitOfWork.Maps.GetById(id);
        if(map is null) {
            return BadRequest($"map with id {id} does not exist");
        }

        if(features) { await _unitOfWork.Maps.LoadFeatures(map); }

        await _unitOfWork.Maps.LoadFeatures(map);
        return Ok(MapDto.Map(map));
    }

    [HttpPost("update/{id}")]
    public async Task<IActionResult> UpdateMap(
        [FromRoute] int id, [FromBody] UpdateMapRequest req)
    {
        var map = await _unitOfWork.Maps.GetById(id);
        if(map is null)
        {
            return BadRequest(new {error = "invalid map id"});
        }

        if(req.UserId is not null) { map.UserId = req.UserId; }
        if(req.Title is not null) { map.Title = req.Title; }
        if(req.Description is not null) { map.Description = req.Description; }

        await _unitOfWork.SaveChangesAsync();
        return Ok();
    }

    [HttpPost("delete/{id}")]
    public async Task<IActionResult> DeleteMap(int id)
    {
        if(!await _unitOfWork.Users.Exists(id)) {
            return BadRequest(new { error = $"map with id {id} does not exist"});
        }
        await _unitOfWork.Maps.RemoveById(id);
        return Ok();
    }

}
