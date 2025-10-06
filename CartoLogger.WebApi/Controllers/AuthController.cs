using Microsoft.AspNetCore.Mvc;
using CartoLogger.Domain;
using CartoLogger.Domain.Constraints;
using CartoLogger.Domain.Entities;
using CartoLogger.WebApi.DTO;
using CartoLogger.WebApi.DTO.Http;

namespace CartoLogger.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IUnitOfWork unitOfWork) : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        Task<User?> task;
        if (EmailConstaints.IsValidEmail(req.Identity, out string? emailErr))
        {
            task = _unitOfWork.Users.GetByEmail(req.Identity);
        }
        else
        {
            task = _unitOfWork.Users.GetByName(req.Identity);
        }

        User? user = await task;
        if (user is null)
        {
            return Unauthorized(new
            {
                error = emailErr is null ? "invalid credentials" : emailErr
            });
        }

        if (PasswordConstraints.HashPassword(req.Password) != user.PasswordHash)
        {
            return Unauthorized(new
            {
                error = "invalid credentials"
            });
        }


        await _unitOfWork.Users.LoadMaps(user);
#pragma warning disable IDE0305
        return Ok(new LoginResponse
        {
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name
            },
            Maps = user.Maps.Select(m =>
                new MapDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description
                }
            ).ToArray()
        });
#pragma warning restore IDE0305
    }

    [HttpPost("signup")]
    public async Task<IActionResult> SignUp([FromBody] SignUpRequest req)
    {

        if (!EmailConstaints.IsValidEmail(req.Email, out string? emailErr))
        {
            return BadRequest(new { error = emailErr ?? "Formato de correo inválido" });
        }


        if (!PasswordConstraints.IsValidPassword(req.Password, out string? passErr))
        {
            return BadRequest(new { error = passErr ?? "Formato de password inválido" });
        }

        var userByName = await _unitOfWork.Users.GetByName(req.Username);
        if (userByName != null)
        {
            return Conflict(new { error = "Nombre de usuario ya está en uso" });
        }


        var userByEmail = await _unitOfWork.Users.GetByEmail(req.Email);
        if (userByEmail != null)
        {
            return Conflict(new { error = "Correo ya registrado" });
        }

        string passwordHash = PasswordConstraints.HashPassword(req.Password);


        var user = new User
        {
            Name = req.Username,
            Email = req.Email,
            PasswordHash = passwordHash
        };

        _unitOfWork.Users.Add(user);
        await _unitOfWork.SaveChangesAsync();


        return Ok(new UserDto
        {
            Id = user.Id,
            Name = user.Name
        });
    }
}
