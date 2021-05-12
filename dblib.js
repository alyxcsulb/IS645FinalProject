// required module
require('dotenv').config()

// Add database package and connection string (can remove ssl)
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const getTotalRecords = () => {
    sql = "SELECT COUNT(*) FROM customer";
    return pool.query(sql)
        .then(result => {
            return {
                msg: "success",
                totRecords: result.rows[0].count
            }
        })
        .catch(err => {
            return {
                msg: `Error: ${err.message}`
            }
        });
};

module.exports.getTotalRecords = getTotalRecords;

// code structure from step 4
// find customers
// rememeber NO S!!

const findCustomers = (customer) => {
    // Will build query based on data provided from the form
    //  Use parameters to avoid sql injection

    // Declare variables
    var i = 1;
    params = [];
    sql = "SELECT * FROM customer WHERE true";

    // Check data provided and build query as necessary
    if (customer.c_id !== "") {
        params.push(parseInt(customer.c_id));
        sql += ` AND c_id = $${i}`;
        i++;
    };
    if (customer.c_first_name !== "") {
        params.push(`${customer.c_first_name}%`);
        sql += ` AND UPPER(c_first_name) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.c_last_name !== "") {
        params.push(`${customer.c_last_name}%`);
        sql += ` AND UPPER(c_last_name) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.c_state !== "") {
        params.push(`${customer.c_state}%`);
        sql += ` AND UPPER(c_state) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.sales_ytd !== "") {
        params.push(`${customer.sales_ytd}%`);
        sql += ` AND UPPER(sales_ytd) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.py_sales !== "") {
        params.push(parseFloat(customer.py_sales));
        sql += ` AND py_sales >= $${i}`;
        i++;
    };

    sql += ` ORDER BY c_id`;
    // for debugging
     console.log("sql: " + sql);
     console.log("params: " + params);

    return pool.query(sql, params)
        .then(result => {
            return { 
                trans: "success",
                result: result.rows
            }
        })
        .catch(err => {
            return {
                trans: "Error",
                result: `Error: ${err.message}`
            }
        });
};


//

// Add towards the bottom of the page
module.exports.findCustomers = findCustomers;

// test insert

const insertCustomers = (customer) => {
    // Will accept either a product array or product object
    if (customer instanceof Array) {
        params = customer;
    } else {
        params = Object.values(customer);
    };

    const sql = `INSERT INTO customer (c_id, c_first_name, c_last_name, c_state, sales_ytd, py_sales)
                 VALUES ($1, $2, $3, $4)`;

    return pool.query(sql, params)
        .then(res => {
            return {
                trans: "success", 
                msg: `C id ${params[0]} successfully inserted`
            };
        })
        .catch(err => {
            return {
                trans: "fail", 
                msg: `Error on insert of c id ${params[0]}.  ${err.message}`
            };
        });
};

// Add this at the bottom
module.exports.insertCustomers = insertCustomers;