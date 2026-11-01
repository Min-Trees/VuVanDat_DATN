DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'vdbus_admin') THEN
      CREATE ROLE vdbus_admin WITH LOGIN PASSWORD 'vdbus_secret_password_change_in_prod' SUPERUSER CREATEDB;
   ELSE
      ALTER ROLE vdbus_admin WITH PASSWORD 'vdbus_secret_password_change_in_prod' SUPERUSER CREATEDB;
   END IF;
END
$do$;

SELECT 'CREATE DATABASE vdbus_logistics OWNER vdbus_admin'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'vdbus_logistics')\gexec
