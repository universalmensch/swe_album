-- (1) in .extras\compose\db\postgres\compose.yml auskommentieren:
--        Zeile mit "command:" undnachfolgende Listenelemente mit führendem "-" auskommentieren
--            damit der PostgreSQL-Server ohne TLS gestartet wird
--        bei den Listenelemente unterhalb von "volumes:" die Zeilen mit "read_only:" bei private-key.pem und certificate.cer auskommentieren
--            damit die Zugriffsrechte fuer den privaten Schluessel und das Zertifikat gesetzt werden koennen
--        Zeile mit "user:" auskommentieren
--            damit der PostgreSQL-Server implizit mit dem Linux-User "root" gestartet wird
--     in .extras\compose\db\postgres\postgres.env auskommentieren:
--        Zeile mit "POSTGRES_HOST_AUTH_METHOD" auskommentieren
-- (2) PowerShell:
--     cd .extras\compose\db\postgres
--     docker compose up db
-- (3) 2. PowerShell:
--     cd .extras\compose\db\postgres
--     docker compose exec db bash
--        chown postgres:postgres /var/lib/postgresql/tablespace
--        chown postgres:postgres /var/lib/postgresql/tablespace/album
--        chown postgres:postgres /var/lib/postgresql/private-key.pem
--        chown postgres:postgres /var/lib/postgresql/certificate.cer
--        chmod 600 /var/lib/postgresql/private-key.pem
--        chmod 600 /var/lib/postgresql/certificate.cer
--        exit
--     docker compose down
-- (3) in compose.yml die obigen Kommentare wieder entfernen, d.h.
--        PostgreSQL-Server mit TLS starten
--        private-key.pem und certificate.cer als readonly
--        den Linux-User "postgres" wieder aktivieren
--     in postgres.env die obigen Kommentare wieder entfernen, d.h.
--        POSTGRES_HOST_AUTH_METHOD wieder aktivieren
-- (4) 1. PowerShell:
--     docker compose up db
-- (5) 2. PowerShell:
--     docker compose exec db bash
--        psql --dbname=postgres --username=postgres --file=/sql/create-db-album.sql
--        psql --dbname=album --username=album --file=/sql/create-schema-album.sql
--        exit
--      docker compose down

CREATE ROLE album LOGIN PASSWORD 'p';

CREATE DATABASE album;

GRANT ALL ON DATABASE album TO album;

CREATE TABLESPACE albumspace OWNER album LOCATION '/var/lib/postgresql/tablespace/album';
