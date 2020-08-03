USE Employee_Tracker_db;

INSERT INTO Department (department_name)
VALUES
("IT"),
("Engineering"),
("Medical"),
("HR");

INSERT INTO Role (title, salary, department_id)
VALUES
("Developer", 100000, 1),
("Civil", 50000, 2),
("Nurse", 10000, 3),
("Supervisor", 1000, 4);

INSERT INTO Employee (first_name, last_name, role_id, manager_id)
VALUES 
("Alexander", "The Great", 2, null),
("Cleopatra", "Selene", 3, 1),
("Ten", "Ben", 4, 5),
("Seven", "Eleven", 4, null),
("William", "Wallace", 2, 2),
("Four", "Fantastic", 1, 1);

SELECT * FROM Department;
SELECT * FROM Role;
SELECT * FROM Employee;

