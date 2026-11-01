# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project definition files
COPY ["src/VDBus.Domain/VDBus.Domain.csproj", "src/VDBus.Domain/"]
COPY ["src/VDBus.Application/VDBus.Application.csproj", "src/VDBus.Application/"]
COPY ["src/VDBus.Infrastructure/VDBus.Infrastructure.csproj", "src/VDBus.Infrastructure/"]
COPY ["src/VDBus.Api/VDBus.Api.csproj", "src/VDBus.Api/"]

# Restore packages
RUN dotnet restore "src/VDBus.Api/VDBus.Api.csproj"

# Copy source code
COPY src/ src/

# Publish release binary
RUN dotnet publish "src/VDBus.Api/VDBus.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_HTTP_PORTS=8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/health || exit 1

ENTRYPOINT ["dotnet", "VDBus.Api.dll"]
