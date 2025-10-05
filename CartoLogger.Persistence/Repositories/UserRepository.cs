using CartoLogger.Domain.Entities;
using CartoLogger.Domain.Interfaces;

namespace CartoLogger.Persistence.Repositories;

public class UserRepository(CartoLoggerDbContext context)
    : Repository<User>(context), IUserRepository
{
}
