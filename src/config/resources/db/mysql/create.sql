CREATE TABLE IF NOT EXISTS album (
    id           INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    version      INT NOT NULL DEFAULT 0,
    genre        ENUM('POP', 'RAP', 'ROCK'),
    name         VARCHAR(40) NOT NULL,
    titelbild    VARCHAR(40),
    erzeugt      DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    aktualisiert DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)
) TABLESPACE albumspace ROW_FORMAT=COMPACT;
ALTER TABLE album AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS kuenstler (
    id       INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name     VARCHAR(40) NOT NULL,
    vorname  VARCHAR(40),
    `alter`  INT NOT NULL,
    album_id CHAR(36) UNIQUE NOT NULL references album(id)
) TABLESPACE albumspace ROW_FORMAT=COMPACT;
ALTER TABLE kuenstler AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS lied (
    id                INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name              VARCHAR(32) NOT NULL,
    dauer_in_sekunden INT NOT NULL CHECK (dauer_in_sekunden >= 1),
    album_id          CHAR(36) NOT NULL references album(id),

    INDEX lied_album_id_idx(album_id)
) TABLESPACE albumspace ROW_FORMAT=COMPACT;
ALTER TABLE lied AUTO_INCREMENT=1;
