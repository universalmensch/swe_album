CREATE SCHEMA IF NOT EXISTS AUTHORIZATION album;

ALTER ROLE album SET search_path = 'album';

CREATE TYPE genre AS ENUM ('POP', 'RAP', 'ROCK');

CREATE TABLE IF NOT EXISTS album (
    id            integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE albumspace,
    genre         genre,
    name          varchar(40),
    titelbild     varchar(64)
) TABLESPACE buchspace;

CREATE TABLE IF NOT EXISTS kuenstler (
    id          integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE buchspace,
    name        varchar(40) NOT NULL,
    vorname     varchar(40),
    alter       integer NOT NULL,
    album_id    integer NOT NULL UNIQUE USING INDEX TABLESPACE buchspace REFERENCES buch
) TABLESPACE buchspace;


CREATE TABLE IF NOT EXISTS lied (
    id              integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE buchspace,
    name            varchar(40) NOT NULL,
    dauerinsekunden integer NOT NULL,
    album_id        integer NOT NULL REFERENCES album
) TABLESPACE buchspace;
CREATE INDEX IF NOT EXISTS lieder_album_id_idx ON lied(album_id) TABLESPACE albumspace;