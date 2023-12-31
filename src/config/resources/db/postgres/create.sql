CREATE SCHEMA IF NOT EXISTS AUTHORIZATION album;

ALTER ROLE album SET search_path = 'album';

CREATE TYPE genre AS ENUM ('POP', 'RAP', 'ROCK');

CREATE TABLE IF NOT EXISTS album (
    id            integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE albumspace,
    version       integer NOT NULL DEFAULT 0,
    genre         genre,
    name          varchar(40),
    titelbild     varchar(40),
    erzeugt       timestamp NOT NULL DEFAULT NOW(),
    aktualisiert  timestamp NOT NULL DEFAULT NOW()
) TABLESPACE albumspace;

CREATE TABLE IF NOT EXISTS kuenstler (
    id          integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE albumspace,
    name        varchar(40) NOT NULL,
    vorname     varchar(40),
    alter       integer NOT NULL,
    album_id    integer NOT NULL UNIQUE USING INDEX TABLESPACE albumspace REFERENCES album
) TABLESPACE albumspace;


CREATE TABLE IF NOT EXISTS lied (
    id              integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE albumspace,
    name            varchar(40) NOT NULL,
    dauer_in_sekunden integer NOT NULL,
    album_id        integer NOT NULL REFERENCES album
) TABLESPACE albumspace;
CREATE INDEX IF NOT EXISTS lieder_album_id_idx ON lied(album_id) TABLESPACE albumspace;