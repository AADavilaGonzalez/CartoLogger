using Microsoft.AspNetCore.Mvc;
using CartoLogger.Domain;
using CartoLogger.Domain.Constraints;
using CartoLogger.Domain.Entities;
using CartoLogger.WebApi.DTO;
using CartoLogger.WebApi.DTO.Http;

namespace CartoLogger.WebApi.Controllers;

[ApiController]
[Route("api/map")]
public class MapController(IUnitOfWork unitOfWork) : ControllerBase
{
}
