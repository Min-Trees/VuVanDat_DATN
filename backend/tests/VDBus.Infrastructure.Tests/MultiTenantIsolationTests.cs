using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VDBus.Application.Common.Interfaces;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;
using VDBus.Infrastructure.Persistence;
using Xunit;

namespace VDBus.Infrastructure.Tests;

public class MultiTenantIsolationTests
{
    private readonly DbContextOptions<ApplicationDbContext> _dbOptions;

    public MultiTenantIsolationTests()
    {
        _dbOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task TenantIsolation_TenantACannotReadTenantBData()
    {
        // 1. Chuẩn bị 2 Tenant riêng biệt
        var tenantAId = Guid.NewGuid();
        var tenantBId = Guid.NewGuid();

        // 2. Tenant A tạo dữ liệu quy định và người dùng
        var mockTenantServiceA = new Mock<ICurrentTenantService>();
        mockTenantServiceA.Setup(s => s.TenantId).Returns(tenantAId);
        mockTenantServiceA.Setup(s => s.UserId).Returns("user-a");

        using (var contextA = new ApplicationDbContext(_dbOptions, mockTenantServiceA.Object))
        {
            contextA.RegulationRules.Add(new RegulationRule
            {
                TenantId = tenantAId,
                ProvinceCode = "HN",
                RouteName = "Đường Phạm Hùng - Cấm xe tải trên 1.5T",
                MaxWeightTons = 1.5m,
                SourceReference = "Quy chuẩn nội bộ Tenant A"
            });
            contextA.Users.Add(new User
            {
                TenantId = tenantAId,
                Email = "driver.a@tenanta.vn",
                FullName = "Tài xế Đội A",
                Role = UserRole.Driver
            });
            await contextA.SaveChangesAsync();
        }

        // 3. Tenant B truy vấn dữ liệu
        var mockTenantServiceB = new Mock<ICurrentTenantService>();
        mockTenantServiceB.Setup(s => s.TenantId).Returns(tenantBId);
        mockTenantServiceB.Setup(s => s.UserId).Returns("user-b");

        using (var contextB = new ApplicationDbContext(_dbOptions, mockTenantServiceB.Object))
        {
            // Tenant B tìm danh sách quy định
            var rulesForTenantB = await contextB.RegulationRules.ToListAsync();
            // Tenant B tìm danh sách người dùng
            var usersForTenantB = await contextB.Users.ToListAsync();

            // Assert: Tenant B hoàn toàn không nhìn thấy bất kỳ dữ liệu nào của Tenant A
            rulesForTenantB.Should().BeEmpty();
            usersForTenantB.Should().BeEmpty();
        }
    }

    [Fact]
    public async Task TenantIsolation_TenantBCannotUpdateOrDeleteTenantAData()
    {
        // 1. Tạo bản ghi của Tenant A
        var tenantAId = Guid.NewGuid();
        var tenantBId = Guid.NewGuid();
        var ruleId = Guid.NewGuid();

        var mockTenantServiceA = new Mock<ICurrentTenantService>();
        mockTenantServiceA.Setup(s => s.TenantId).Returns(tenantAId);

        using (var contextA = new ApplicationDbContext(_dbOptions, mockTenantServiceA.Object))
        {
            contextA.RegulationRules.Add(new RegulationRule
            {
                Id = ruleId,
                TenantId = tenantAId,
                ProvinceCode = "HCM",
                RouteName = "Quốc lộ 1A nội đô",
                MaxWeightTons = 2.5m
            });
            await contextA.SaveChangesAsync();
        }

        // 2. Tenant B cố gắng tìm bản ghi của Tenant A theo Id để sửa hoặc xóa
        var mockTenantServiceB = new Mock<ICurrentTenantService>();
        mockTenantServiceB.Setup(s => s.TenantId).Returns(tenantBId);

        using (var contextB = new ApplicationDbContext(_dbOptions, mockTenantServiceB.Object))
        {
            var rule = await contextB.RegulationRules.FirstOrDefaultAsync(r => r.Id == ruleId);
            
            // Assert: Không thể tìm thấy do query filter cách ly
            rule.Should().BeNull();
        }
    }

    [Fact]
    public async Task AuditLogInterceptor_ShouldAutomaticallyRecordAuditLogOnSave()
    {
        var tenantId = Guid.NewGuid();
        var userId = "dispatcher-01";

        var mockTenantService = new Mock<ICurrentTenantService>();
        mockTenantService.Setup(s => s.TenantId).Returns(tenantId);
        mockTenantService.Setup(s => s.UserId).Returns(userId);

        using var context = new ApplicationDbContext(_dbOptions, mockTenantService.Object);

        var rule = new RegulationRule
        {
            TenantId = tenantId,
            ProvinceCode = "DN",
            RouteName = "Cầu Rồng - Cấm giờ cao điểm",
            MaxWeightTons = 1.0m,
            SourceReference = "Quyết định TP Đà Nẵng"
        };

        context.RegulationRules.Add(rule);
        await context.SaveChangesAsync();

        // Kiểm tra bảng AuditLogs
        var auditLogs = await context.AuditLogs.ToListAsync();
        auditLogs.Should().NotBeEmpty();
        var log = auditLogs.First();
        log.EntityName.Should().Be("RegulationRule");
        log.Action.Should().Be("Added");
        log.ChangedByUserId.Should().Be(userId);
        log.TenantId.Should().Be(tenantId);
        log.NewValues.Should().Contain("Cầu Rồng");
    }
}
