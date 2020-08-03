const dotevn = require("dotenv").config();
const mysql = require("mysql");
const inquirer = require("inquirer");
// const Employee = require("./Queries/Employee");
// const Role = require("./Queries/Role");
// const Department = require("./Queries/Department");

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME
});

connection.connect(err => {
    if (err) throw err;
    console.log(`Connection Id: ${connection.threadId}`);
    appEmployeeTracker();
});

const appEmployeeTracker = async () => {

    console.log(`Start`);

    await inquirer.prompt({
        name: "userChoice",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "View Employees",
            "View Roles",
            "View Departments",
            "View All Employees by Manager",
            "Add Employee",
            "Add Role",
            "Add Department",
            "Update Employee ROLE",
            "Update Employee MANGER",
            "Delete Employee",
            "Delete ROLE",
            "Delete DEPARTMENT",
            "View Department Budgets",
            "Exit"
        ]
    })
        .then(response => {
            switch (response.userChoice) {
                case "View Employees":
                    viewEmployees();
                    break;
                case "View Roles":
                    viewRoles();
                    break;
                case "View Departments":
                    viewDepartments();
                    break;
                case "View All Employees by Manager":
                    viewEmployeesByManager();
                    break;
                case "Add Employee":
                    addEmployee();
                    break;
                case "Add Role":
                    addRole();
                    break;
                case "Add Department":
                    addDepartment();
                    break;
                case "Update Employee ROLE":
                    updateEmployeeRole();
                    break;
                case "Update Employee MANGER":
                    updateEmployeeManager();
                    break;
                case "Delete Employee":
                    deleteEmployee();
                    break;
                case "Delete ROLE":
                    deleteRole();
                    break;
                case "Delete DEPARTMENT":
                    deleteDepartment();
                    break;
                case "View Department Budgets":
                    departmentBudget();
                    break;
                case "Exit":
                    connection.end();
                    break;
            }
        });
};

//View Employees Table with Roles and Department they belong to. 

const viewEmployees = () => {
    connection.query(
        "SELECT employee.id, first_name, last_name, title, salary, department_name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id;",
            (err, res) => {
                if(err) throw err;
                console.table(res);
                appEmployeeTracker();
            }
    );
};

//View Employees by Manager

const viewEmployeesByManager = () => {

    let managers = [];

    connection.query("SELECT id, CONCAT(first_name, ' ', last_name) AS employee_name FROM employee", (err, res) => {

        if (err) throw err

        for (let i = 0; i < res.length; i++) {
            managers.push({
                name: res[i].employee_name,
                value: res[i].id
            });
        };

        inquirer.prompt([
            {
                name: "managerName",
                type: "list",
                message: "Select the name of the Manager",
                choices: managers
            }
        ]).then(response => {

            connection.query(
                `SELECT CONCAT(first_name, ' ', last_name) AS employee_name FROM employee WHERE manager_id = ${response.managerName};`,
                (err, res) => {
                    if (err) throw err
                    console.table(res);
                    appEmployeeTracker();
                }
            );
        });
    });
};

//Add new employee

const addEmployee = () => {

    let roleNames = [];
    let managerNames = [];

    connection.query("SELECT id, title FROM role", (err, res) => {

        if (err) throw err

        for (let i = 0; i < res.length; i++) {
            roleNames.push({
                name: res[i].title,
                value: res[i].id
            });
        };

        connection.query(`SELECT employee.id, CONCAT(first_name, " ", last_name) AS managers FROM employee`, (err, res) => {

            if (err) throw err

            for (let i = 0; i < res.length; i++) {
                managerNames.push({
                    name: res[i].managers,
                    value: res[i].id
                });
            };

            inquirer.prompt([
                {
                    name: "firstName",
                    type: "input",
                    message: "What is your first name?"
                },
                {
                    name: "lastName",
                    type: "input",
                    message: "What is your surname?"
                },
                {
                    name: "myRole",
                    type: "list",
                    message: "What is your role?",
                    choices: roleNames
                },
                {
                    name: "myManager",
                    type: "list",
                    message: "Who is your manager?",
                    choices: managerNames
                }
            ]).then(response => {

                connection.query(
                    "INSERT INTO Employee SET ?",
                    {
                        first_name: response.firstName,
                        last_name: response.lastName,
                        role_id: response.myRole,
                        manager_id: response.myManager
                    },
                    (err) => {
                        if (err) throw err;
                        console.table("Employee has been added successfully");
                        appEmployeeTracker();
                    }
                );
            });
        });
    });
};



//Update employee by role

const updateEmployeeRole = () => {

    let firstNames = [];
    let lastNames = [];
    let roleNames = [];

    connection.query("SELECT first_name, last_name FROM employee", (err, res) => {
        
        if(err) throw err

        for (let i=0; i<res.length; i++){
            firstNames.push(res[i].first_name);
            lastNames.push(res[i].last_name);
        };
    

        connection.query("SELECT title FROM role", (err, res) => {
            
            if(err) throw err

            for (let i=0; i<res.length; i++){
                roleNames.push(res[i].title);
            };
    

            inquirer.prompt([
                {
                    name:"firstName",
                    type: "list",
                    message: "Select the name of the Employee",
                    choices: firstNames
                },
                {
                    name:"lastName",
                    type: "list",
                    message: "Select the surname of the Employee",
                    choices: lastNames
                },
                {
                    name:"roleName",
                    type: "list",
                    message: "Select the role of the Employee",
                    choices: roleNames
                }
            ]).then(response => {
        
                connection.query(
                    `UPDATE employee SET role_id = (SELECT role.id FROM role WHERE title = "${response.roleName}") WHERE first_name = "${response.firstName}" AND last_name = "${response.lastName}"`,
                    (err) => {
                        if(err) throw err;
                        console.log("Employee role has been updated successfully");
                        appEmployeeTracker();
                    }
                );
            });
        });
    });
};

//Update employee by manager

const updateEmployeeManager = () => {

    let firstNames = [];
    let lastNames = [];
   

    connection.query("SELECT first_name, last_name FROM employee", (err, res) => {
        
        if(err) throw err

        for (let i=0; i<res.length; i++){
            firstNames.push(res[i].first_name);
            lastNames.push(res[i].last_name);
        };

        inquirer.prompt([
            {
                name:"firstName",
                type: "list",
                message: "Select the name of the Employee",
                choices: firstNames
            },
            {
                name:"lastName",
                type: "list",
                message: "Select the surname of the Employee",
                choices: lastNames
            },
            {
                name:"managerFirstName",
                type: "list",
                message: "Select the name of the Manager",
                choices: firstNames
            },
            {
                name:"managerLastName",
                type: "list",
                message: "Select the surname of the Manager",
                choices: lastNames
            }
        ]).then(response => {

            connection.query(
                `SELECT employee.id FROM employee WHERE first_name = "${response.managerFirstName}" AND last_name = "${response.managerLastName}"`,
                (err, res) => {
                    if(err) throw err

                    connection.query(
                        `UPDATE employee SET manager_id = ${res[0].id} WHERE first_name = "${response.firstName}" AND last_name = "${response.lastName}"`,
                        (err) => {
                            if(err) throw err;
                            console.log("Employee manager has been updated successfully");
                            appEmployeeTracker();
                        }
                    );
                }
            );
        });
    });
};

//Delete employee 

const deleteEmployee = () => {

    connection.query("SELECT first_name, last_name FROM employee;", (err, res) => {
        
        if(err) throw err

        let firstNames = [];
        let lastNames = [];

        for (let i=0; i<res.length; i++){
            firstNames.push(res[i].first_name);
            lastNames.push(res[i].last_name);
        };

        inquirer.prompt([
            {
                name:"firstName",
                type: "list",
                message: "Select the name of the Employee",
                choices: firstNames
            },
            {
                name:"lastName",
                type: "list",
                message: "Select the surname of the Employee",
                choices: lastNames
            }
        ]).then(response => {
    
            connection.query(
                `DELETE FROM employee WHERE first_name = "${response.firstName}" AND last_name = "${response.lastName}";`,
                (err) => {
                    if(err) throw err;
                    console.log("Employee has been deleted successfully");
                    appEmployeeTracker();
                }
            );
        });
    });
};

//View role table 

const viewRoles = () => {
    connection.query(
        "SELECT role.id, title, salary, department_name FROM role JOIN department ON role.department_id = department.id;",
            (err, res) => {
                if(err) throw err;
                console.table(res);
                appEmployeeTracker();
            }
    );
};

//Add new role

const addRole = () => {

    connection.query("SELECT department_name FROM department", (err, res) => {
        
        if(err) throw err

        let departmentNames = [];
        for (let i=0; i<res.length; i++){
            departmentNames.push(res[i].department_name);
        };

        inquirer.prompt([
            {
                name:"roleTitle",
                type: "input",
                message: "What is role title?"
            },
            {
                name:"roleSalary",
                type: "input",
                message: "What is the salary for this role?"
            },
            {
                name:"departmentName",
                type: "list",
                message: "Select the department the role belongs to",
                choices: departmentNames
            }
        ]).then(response => {
    
        connection.query(
            `INSERT INTO role (title, salary, department_id) VALUES ("${response.roleTitle}", ${response.roleSalary}, (SELECT id FROM department WHERE department_name = "${response.departmentName}"))`,
            (err) => {
                if(err) throw err;
                console.log("Role has been added successfully");
                appEmployeeTracker();
            });
        });
    });
};

//Delete role 
const deleteRole = () => {

    connection.query("SELECT title FROM role", (err, res) => {
        
        if(err) throw err

        let roleTitles = [];
        for (let i=0; i<res.length; i++){
            roleTitles.push(res[i].title);
        };

        inquirer.prompt([
            {
                name:"roleTitle",
                type: "list",
                message: "Select the role title",
                choices: roleTitles
            }
        ]).then(response => {
    
            connection.query(
                "DELETE FROM role WHERE ?;",
                {
                title: response.roleTitle,
                }, 
                (err) => {
                    if(err) throw err;
                    console.log("Role has been deleted successfully");
                    appEmployeeTracker();
                }
            );
        });
    });
};

//View department table

const viewDepartments = () => {
    connection.query(
        "SELECT id, department_name FROM department;",
        (err, res) => {
            if(err) throw err;
            console.table(res);
            appEmployeeTracker();
        }
    );
};

//Add new department

const addDepartment = () => {
    inquirer.prompt([
        {
            name:"departmentName",
            type: "input",
            message: "What is the department name?"
        }
    ]).then(response => {

        connection.query(
            "INSERT INTO Department SET ?",
            {
            department_name: response.departmentName,
            }, 
            (err) => {
                if(err) throw err;
                console.log("Department has been added successfully");
                appEmployeeTracker();
            }
        );
    });
};

//Delete department

const deleteDepartment = () => {

    connection.query("SELECT department_name FROM department", (err, res) => {
        
        if(err) throw err

        let departmentNames = [];
        for (let i=0; i<res.length; i++){
            departmentNames.push(res[i].department_name);
        };

        inquirer.prompt([
            {
                name:"departmentName",
                type: "list",
                message: "Select the department name",
                choices: departmentNames
            }
        ]).then(response => {
    
            connection.query(
                "DELETE FROM department WHERE ?;",
                {
                department_name: response.departmentName,
                }, 
                (err) => {
                    if(err) throw err;
                    console.log("Department has been deleted successfully");
                    appEmployeeTracker();
                }
            );
        });
    });
};

//View budget by department

const departmentBudget = () => {

    connection.query("SELECT DISTINCT department_name FROM employee LEFT JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id; ", (err, res) => {
        
        if(err) throw err

        let departmentNames = [];
        for (let i=0; i<res.length; i++){
            departmentNames.push(res[i].department_name);
        }

        inquirer.prompt([
            {
                name:"departmentName",
                type: "list",
                message: "Select the department name",
                choices: departmentNames
            }
        ]).then(response => {
    
            connection.query(`SELECT SUM(salary) AS ${response.departmentName}_Salary FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE department_name = "${response.departmentName}";`,
                (err, res) => {
                    if(err) throw err;
                    console.table(res);
                    appEmployeeTracker();
                }
            );
        });
    });
};





