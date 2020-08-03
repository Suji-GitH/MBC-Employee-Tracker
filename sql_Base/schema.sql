DROP DATABASE IF EXISTS Employee_Tracker_db;

CREATE DATABASE Employee_Tracker_db;

USE Employee_Tracker_db;

CREATE TABLE Department (
id INT auto_increment not null,
department_name VARCHAR(30) not null,
primary key(id)
);

CREATE TABLE Role (
id INT auto_increment not null,
title VARCHAR(30) not null,
salary DECIMAL(10, 2) null,
department_id INT null,
primary key(id),
CONSTRAINT `department_id_fk`
FOREIGN KEY (`department_id`)
REFERENCES `employee_tracker_db`.`department` (`id`)
ON DELETE SET NULL
ON UPDATE SET NULL
);

CREATE TABLE Employee (
id INT auto_increment not null,
first_name VARCHAR(30) not null,
last_name VARCHAR(30) not null,
role_id INT null,
manager_id INT null,
primary key(id),
CONSTRAINT `role_id_fk`
FOREIGN KEY (`role_id`)
REFERENCES `employee_tracker_db`.`role` (`id`)
ON DELETE SET NULL
ON UPDATE SET NULL
);
