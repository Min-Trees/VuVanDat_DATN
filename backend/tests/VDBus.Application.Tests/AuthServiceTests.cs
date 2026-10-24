using System;
using System.Security.Authentication;
using System.Security.Claims;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Auth;
using VDBus.Application.Services;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;
using VDBus.Infrastructure.Persistence;
using Xunit;

namespace VDBus.Application.Tests;

public class AuthServiceTests
{
    private readonly DbContextOptions<ApplicationDbContext> _dbOptions;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IJwtTokenGenerator> _jwtGeneratorMock;
    private readonly Mock<ICurrentTenantService> _tenantServiceMock;

    public AuthServiceTests()
    {
        _dbOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _passwordHasherMock = new Mock<IPasswordHasher>();
        _jwtGeneratorMock = new Mock<IJwtTokenGenerator>();
        _tenantServiceMock = new Mock<ICurrentTenantService>();

        _passwordHasherMock.Setup(p => p.HashPassword(It.IsAny<string>()))
            .Returns<string>(p => $"hashed_{p}");

        _passwordHasherMock.Setup(p => p.VerifyPassword(It.IsAny<string>(), It.IsAny<string>()))
            .Returns<string, string>((pwd, hash) => hash == $"hashed_{pwd}");

        _jwtGeneratorMock.Setup(j => j.GenerateAccessToken(It.IsAny<User>(), It.IsAny<string>()))
            .Returns((Guid.NewGuid().ToString(), DateTime.UtcNow.AddHours(1)));

        _jwtGeneratorMock.Setup(j => j.GenerateRefreshToken())
            .Returns(Guid.NewGuid().ToString());
    }

    [Fact]
    public async Task RegisterTenantAsync_ShouldCreateTenantAndAdminUser()
    {
        using var context = new ApplicationDbContext(_dbOptions, _tenantServiceMock.Object);
        var authService = new AuthService(context, _passwordHasherMock.Object, _jwtGeneratorMock.Object, _tenantServiceMock.Object);

        var request = new RegisterTenantRequest
        {
            TenantName = "Tập đoàn Vận tải Bắc Nam",
            TenantCode = "BACNAM-LOGISTICS",
            TaxCode = "0109999999",
            AdminFullName = "Lê Quản Trị",
            AdminEmail = "admin@bacnam.vn",
            AdminPassword = "SecurePassword123!"
        };

        var response = await authService.RegisterTenantAsync(request);

        response.Should().NotBeNull();
        response.AccessToken.Should().NotBeNullOrEmpty();
        response.RefreshToken.Should().NotBeNullOrEmpty();
        response.User.Email.Should().Be("admin@bacnam.vn");
        response.User.Role.Should().Be(UserRole.Admin);

        var savedTenant = await context.Tenants.FirstOrDefaultAsync(t => t.Code == "BACNAM-LOGISTICS");
        savedTenant.Should().NotBeNull();
        savedTenant!.Name.Should().Be("Tập đoàn Vận tải Bắc Nam");
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ShouldThrowAuthenticationException()
    {
        using var context = new ApplicationDbContext(_dbOptions, _tenantServiceMock.Object);
        var authService = new AuthService(context, _passwordHasherMock.Object, _jwtGeneratorMock.Object, _tenantServiceMock.Object);

        // Đăng ký tenant trước
        await authService.RegisterTenantAsync(new RegisterTenantRequest
        {
            TenantName = "Test Co",
            TenantCode = "TEST-CO",
            AdminEmail = "admin@test.vn",
            AdminPassword = "CorrectPassword"
        });

        // Thử đăng nhập sai mật khẩu
        var act = () => authService.LoginAsync(new LoginRequest
        {
            Email = "admin@test.vn",
            Password = "WrongPassword"
        });

        await act.Should().ThrowAsync<AuthenticationException>();
    }
}
