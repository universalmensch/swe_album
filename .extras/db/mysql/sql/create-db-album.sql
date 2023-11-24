-- (1) PowerShell:
--     cd .extras\compose\db\mysql
--     docker compose up
-- (1) 2. PowerShell:
--     docker compose exec db bash
--         mysql --user=root --password=p < /sql/create-db-album.sql
--         exit
--     docker compose down

CREATE USER IF NOT EXISTS album IDENTIFIED BY 'p';
GRANT USAGE ON *.* TO album;

CREATE DATABASE IF NOT EXISTS album CHARACTER SET utf8;

GRANT ALL PRIVILEGES ON album.* to album;

CREATE TABLESPACE `albumspace` ADD DATAFILE 'albumspace.ibd' ENGINE=INNODB;