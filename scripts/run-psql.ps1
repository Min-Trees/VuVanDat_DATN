param(
    [string]$SqlFile = "scripts/check-db.sql"
)

$env:PGPASSWORD = "vdbus_secret_password_change_in_prod"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5432 -U vdbus_admin -d vdbus_logistics -f $SqlFile
