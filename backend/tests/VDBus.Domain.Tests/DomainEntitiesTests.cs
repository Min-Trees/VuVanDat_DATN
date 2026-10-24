using System;
using FluentAssertions;
using VDBus.Domain.Common;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;
using Xunit;

namespace VDBus.Domain.Tests;

public class DomainEntitiesTests
{
    [Fact]
    public void BaseEntity_ShouldInitializeWithGuidAndUtcDate()
    {
        // Act
        var tenant = new Tenant { Name = "Công ty TNHH Vận Tải VDBus", Code = "VDBUS" };

        // Assert
        tenant.Id.Should().NotBeEmpty();
        tenant.CreatedAtUtc.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(2));
        tenant.IsActive.Should().BeTrue();
    }

    [Fact]
    public void User_ShouldImplementITenantEntity()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var user = new User
        {
            TenantId = tenantId,
            Email = "admin@vdbus.vn",
            FullName = "Nguyễn Văn Admin",
            Role = UserRole.Admin
        };

        // Assert
        user.Should().BeAssignableTo<ITenantEntity>();
        user.TenantId.Should().Be(tenantId);
        user.Role.Should().Be(UserRole.Admin);
    }

    [Fact]
    public void RegulationRule_ShouldContainLegalDisclaimerByDefault()
    {
        // Arrange & Act
        var rule = new RegulationRule
        {
            ProvinceCode = "HN",
            RouteName = "Vành đai 3",
            StartTime = new TimeSpan(6, 0, 0),
            EndTime = new TimeSpan(9, 0, 0),
            MaxWeightTons = 2.5m,
            SourceReference = "Quyết định số 24/2020/QĐ-UBND"
        };

        // Assert
        rule.LegalNote.Should().Be("Cần chuyên gia pháp lý xác nhận trước khi áp dụng chính thức");
        rule.SourceReference.Should().NotBeNullOrEmpty();
    }
}
