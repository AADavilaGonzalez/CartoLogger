using CartoLogger.Domain.Entities;
using CartoLogger.Domain.Interfaces;

namespace CartoLogger.Persistence.Repositories;

public class MapRepository(CartoLoggerDbContext context)
    : Repository<Map>(context), IMapRepository
{
    
    public Task LoadFeatures(Map map)
    {
        return _context.Entry(map).Collection(u => u.Features).LoadAsync();
    }

}
