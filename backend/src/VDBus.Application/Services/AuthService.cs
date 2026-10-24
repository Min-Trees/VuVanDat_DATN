using System;
using System.Security.Authentication;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Auth;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;

namespace VDBus.Application.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly ICurrentTenantService _currentTenantService;

    public AuthService(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        ICurrentTenantService currentTenantService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _currentTenantService = currentTenantService;
    }

    public async Task<LoginResponse> RegisterTenantAsync(RegisterTenantRequest request, CancellationToken ct = default)
    {
        // 1. Kiểm tra Tenant code đã tồn tại chưa
        var exists = await _context.Tenants.AnyAsync(t => t.Code.ToLower() == request.TenantCode.ToLower(), ct);
        if (exists)
        {
            throw new InvalidOperationException($"Mã doanh nghiệp '{request.TenantCode}' đã được đăng ký trên hệ thống.");
        }

        // 2. Tạo Tenant mới
        var tenant = new Tenant
        {
            Name = request.TenantName,
            Code = request.TenantCode.ToUpperInvariant(),
            TaxCode = request.TaxCode,
            ContactEmail = request.AdminEmail,
            ContactPhone = request.AdminPhone ?? string.Empty,
            IsActive = true
        };
        _context.Tenants.Add(tenant);

        // 3. Tạo Admin User cho Tenant
        var adminUser = new User
        {
            TenantId = tenant.Id,
            FullName = request.AdminFullName,
            Email = request.AdminEmail.ToLowerInvariant(),
            PasswordHash = _passwordHasher.HashPassword(request.AdminPassword),
            Role = UserRole.Admin,
            PhoneNumber = request.AdminPhone ?? string.Empty,
            IsActive = true
        };
        _context.Users.Add(adminUser);

        // 4. Sinh Token
        var (accessToken, expiresAt) = _jwtTokenGenerator.GenerateAccessToken(adminUser, tenant.Name);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        adminUser.RefreshToken = refreshToken;
        adminUser.RefreshTokenExpiryTimeUtc = DateTime.UtcNow.AddDays(7);

        await _context.SaveChangesAsync(ct);

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAtUtc = expiresAt,
            User = new UserDto
            {
                Id = adminUser.Id,
                TenantId = tenant.Id,
                TenantName = tenant.Name,
                FullName = adminUser.FullName,
                Email = adminUser.Email,
                Role = adminUser.Role
            }
        };
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        // Query user IgnoreQueryFilters vì chưa có tenant context
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users
            .IgnoreQueryFilters()
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail && u.IsActive, ct);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new AuthenticationException("Tài khoản hoặc mật khẩu không chính xác.");
        }

        if (user.Tenant == null || !user.Tenant.IsActive)
        {
            throw new AuthenticationException("Doanh nghiệp của bạn đang bị tạm khóa. Vui lòng liên hệ quản trị viên.");
        }

        var (accessToken, expiresAt) = _jwtTokenGenerator.GenerateAccessToken(user, user.Tenant.Name);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTimeUtc = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync(ct);

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAtUtc = expiresAt,
            User = new UserDto
            {
                Id = user.Id,
                TenantId = user.TenantId,
                TenantName = user.Tenant.Name,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            }
        };
    }

    public async Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken ct = default)
    {
        var principal = _jwtTokenGenerator.GetPrincipalFromExpiredToken(request.AccessToken);
        if (principal == null)
        {
            throw new AuthenticationException("Mã truy cập không hợp lệ.");
        }

        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            throw new AuthenticationException("Mã người dùng trong token không hợp lệ.");
        }

        var user = await _context.Users
            .IgnoreQueryFilters()
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user == null || user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiryTimeUtc <= DateTime.UtcNow)
        {
            throw new AuthenticationException("Phiên làm việc đã hết hạn hoặc refresh token không hợp lệ.");
        }

        var (newAccessToken, expiresAt) = _jwtTokenGenerator.GenerateAccessToken(user, user.Tenant?.Name ?? string.Empty);
        var newRefreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTimeUtc = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync(ct);

        return new LoginResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            ExpiresAtUtc = expiresAt,
            User = new UserDto
            {
                Id = user.Id,
                TenantId = user.TenantId,
                TenantName = user.Tenant?.Name ?? string.Empty,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            }
        };
    }

    public async Task<UserDto> GetCurrentUserAsync(CancellationToken ct = default)
    {
        if (!Guid.TryParse(_currentTenantService.UserId, out var userId))
        {
            throw new AuthenticationException("Chưa xác thực người dùng hiện tại.");
        }

        var user = await _context.Users
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user == null)
        {
            throw new AuthenticationException("Không tìm thấy thông tin tài khoản.");
        }

        return new UserDto
        {
            Id = user.Id,
            TenantId = user.TenantId,
            TenantName = user.Tenant?.Name ?? string.Empty,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role
        };
    }
}
