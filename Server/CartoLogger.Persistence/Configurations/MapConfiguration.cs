using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using CartoLogger.Domain.Entities;

namespace CartoLogger.Persistence.Configurations;

public class MapConfiguration : IEntityTypeConfiguration<Map>
{
    public void Configure(EntityTypeBuilder<Map> table)
    {
        table.HasKey(map => map.Id);
        table.Property(map => map.Id)
             .ValueGeneratedOnAdd();

        table.Property(map => map.Title)
             .IsRequired()
             .HasMaxLength(Map.TitleConstraints.maxLength);

        table.Property(map => map.Description)
             .IsRequired()
             .HasMaxLength(Map.DescriptionConstraints.maxLength);

        table.OwnsOne(map => map.View, owned =>
        {
            owned.Property(v => v.Lat)
                 .HasColumnName("ViewLatitude")
                 .IsRequired();

            owned.Property(v => v.Lng)
                 .HasColumnName("ViewCenterLongitude")
                 .IsRequired(); 
        });

        table.HasOne(map => map.User)
             .WithMany(user => user.Maps)
             .HasForeignKey(map => map.UserId)
             .OnDelete(DeleteBehavior.SetNull);

    }
}
