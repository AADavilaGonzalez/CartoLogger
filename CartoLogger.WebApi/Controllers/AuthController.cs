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
        if(EmailConstaints.IsValidEmail(req.Identity, out string? emailErr))
        {
            task = _unitOfWork.Users.GetByEmail(req.Identity);
        }
        else
        {
            task = _unitOfWork.Users.GetByName(req.Identity);
        }

        User? user = await task;
        if(user is null)
        {
            return Unauthorized(new {
                error =  emailErr is null ? "invalid credentials" : emailErr
            });
        }

        if(PasswordConstraints.HashPassword(req.Password) != user.PasswordHash)
        {
            return Unauthorized(new {
                error = "invalid credentials"
            });
        }

        await _unitOfWork.Users.LoadMaps(user);
        #pragma warning disable IDE0305
        return Ok(new LoginResponse{
            User = new UserDto{
                Id = user.Id,
                Name = user.Name
            },
            Maps = user.Maps.Select(m => 
                new MapDto{
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description
                }
            ).ToArray()
        });
        #pragma warning restore IDE0305
    }

    /* 
    [HttpPost("signup")]
    public async Task<IActionResult> SignUp([FromBody] SignUpRequest req)
    {
        //Recibir parametros de el request (name, email, password) y cerciorarse de los
        //parametros pasados pasen las validaciones EmailConstraints.IsValidEmail y
        //PasswordConstraints.IsValidPassword.
        //Investigar una operacion de Hashing de contrasenas adecuada al contexto e
        //implmentarla dentro de la funcion PasswordConstraints.HashPassword
        //GUARGDAR CONTRASENA CUANDO YA HAYA SIDO HASHEADA
        //user.PasswordHash = PasswordConstraints.HashPasword(req.Password)
        //Si quieres porbar que funcione puedes acceder a la interfaz de swagger
        //ya esta funcionando
    }
    */
}
