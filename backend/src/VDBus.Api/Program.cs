using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using VDBus.Api.Middlewares;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.Services;
using VDBus.Infrastructure.Persistence;
using VDBus.Infrastructure.Providers.Telematics;
using VDBus.Infrastructure.Providers.Vetc;
using VDBus.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration
var defaultConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>((sp, options) =>
{
    // Sử dụng PostgreSQL nếu chuỗi kết nối hợp lệ, fallback InMemory cho môi trường test/cục bộ
    if (builder.Environment.IsEnvironment("Testing") || string.IsNullOrEmpty(defaultConnectionString))
    {
        options.UseInMemoryDatabase("VDBus_Dev_Db");
    }
    else
    {
        options.UseNpgsql(defaultConnectionString);
    }
});

builder.Services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());
builder.Services.AddScoped<ICurrentTenantService, CurrentTenantService>();

// 2. Application & Infrastructure Services
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDispatchRecommendationService, DispatchRecommendationService>();
builder.Services.AddScoped<IPodService, PodService>();

// 3. Mock vs Real Providers Configuration
var useMockVetc = builder.Configuration.GetValue<bool>("Providers:Vetc:UseMock", true);
if (useMockVetc)
{
    builder.Services.AddScoped<IVetcProvider, MockVetcProvider>();
}
else
{
    builder.Services.AddScoped<IVetcProvider, RealVetcProvider>();
}

var useMockTelematics = builder.Configuration.GetValue<bool>("Providers:Telematics:UseMock", true);
if (useMockTelematics)
{
    builder.Services.AddScoped<ITelematicsProvider, MockTelematicsProvider>();
}
else
{
    builder.Services.AddScoped<ITelematicsProvider, RealTelematicsProvider>();
}

// 4. JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "vdbus_super_secret_jwt_key_at_least_32_chars_long_for_security!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "VDBusPlatform";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "VDBusClients";
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = key,
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ClockSkew = System.TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 5. CORS for Web Applications
builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCors", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 6. Controllers & Swagger OpenAPI v1
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "VDBus Logistics Platform API",
        Version = "v1",
        Description = "Nền tảng Quản trị Vận tải Đường bộ (B2B SaaS Multi-tenant TMS)"
    });

    // Cấu hình JWT Bearer trong Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập JWT token theo định dạng: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 7. Middlewares Pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "VDBus API v1");
    });
}

app.UseCors("DefaultCors");
app.UseAuthentication();
app.UseMiddleware<TenantMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Cho phép WebApplicationFactory trong Integration Tests
public partial class Program { }
