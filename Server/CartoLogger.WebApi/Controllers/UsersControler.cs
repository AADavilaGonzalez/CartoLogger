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
            return BadRequest($"user with id {id} does not exist");
        }

        return Ok(UserDto.FromUser(user, maps));
    }
}
