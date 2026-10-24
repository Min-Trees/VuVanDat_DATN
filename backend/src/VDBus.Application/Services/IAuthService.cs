using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.DTOs.Auth;

namespace VDBus.Application.Services;

public interface IAuthService
{
    Task<LoginResponse> RegisterTenantAsync(RegisterTenantRequest request, CancellationToken ct = default);
    Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken ct = default);
    Task<UserDto> GetCurrentUserAsync(CancellationToken ct = default);
}
