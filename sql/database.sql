CREATE DATABASE kampus_bun;
USE kampus_bun;

CREATE TABLE mahasiswa (
id INT AUTO_INCREMENT PRIMARY KEY,
nama VARCHAR(100),
jurusan VARCHAR(100),
angkatan INT
);

INSERT INTO mahasiswa (nama, jurusan, angkatan)
VALUES
('Andi', 'Sistem Informasi', 2022),
('Siti', 'Informatika', 2023);