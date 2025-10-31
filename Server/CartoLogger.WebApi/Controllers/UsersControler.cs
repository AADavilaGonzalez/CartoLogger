using Microsoft.AspNetCore.Mvc;
using CartoLogger.Domain;
using CartoLogger.Domain.Entities;
using CartoLogger.WebApi.DTO;

namespace CartoLogger.WebApi.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController(IUnitOfWork unitOfWork) : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(
        [FromRoute] int id, [FromQuery] bool maps = false)
    {
        User? user =  await _unitOfWork.Users.GetById(id);
        if(user is null)
        {
            return NotFound($"invalid user id: {id}");
        }

        return Ok(UserDto.FromUser(user, maps));
    }

    [HttpGet("{id}/maps")]
    public async Task<IActionResult> GetUserMaps([FromRoute] int id)
    {
        if(!await _unitOfWork.Users.Exists(id))
        {
            return NotFound($"invalid user id: {id}");
        }
        return Ok(await _unitOfWork.Users.GetMapsById(id));
    }
}
