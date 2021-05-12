// Add required packages
const express = require("express");
const app = express();

// Add addiional packages
const dblib = require("./dblib.js");
require('dotenv').config()

const multer = require("multer");
const upload = multer();

// Add middleware to parse default urlencoded form
app.use(express.urlencoded({ extended: false }));

// Add database package and connection string (can remove ssl)
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Set up EJS
app.set("view engine", "ejs");

// Enable CORS (see https://enable-cors.org/server_expressjs.html)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

// Start listener
app.listen(process.env.PORT || 3000, () => {
    console.log("Server started (http://localhost:3000/) !");
});

// Setup routes
app.get("/", (req, res) => {
    //res.send ("Hello world...");
    res.render("index");
});

// get and post manage

app.get("/manage", async (req, res) => {
    // Omitted validation check
    const totRecs = await dblib.getTotalRecords();
    //Create an empty customer object (To populate form with values)
    const customer = {
        c_id: "",
        c_first_name: "",
        c_last_name: "",
        c_state: "",
        sales_ytd: "",
        py_sales: ""
    };
    res.render("manage", {
        type: "get",
        totRecs: totRecs.totRecords,
        customer: customer
    });
});


app.post("/manage", async (req, res) => {

    const totRecs = await dblib.getTotalRecords();
    dblib.findCustomers(req.body)
    .then(result => {
      res.render("manage", {
        type: "post",
        totRecs: totRecs.totRecords,
        result: result,
        customer: req.body
      });
    })
    .catch(err => {
      res.render("manage", {
        type: "post",
        totRecs: totRecs.totRecords,
        result: `Unexpected Error: ${err.message}`,
        customer: req.body
      });
    });

});


dblib.getTotalRecords()
    .then(result => {
        if (result.msg.substring(0, 5) === "Error") {
            console.log(`Error Encountered.  ${result.msg}`);
        } else {
            console.log(`Total number of database records: ${result.totRecords}`);
        };
    })
    .catch(err => {
        console.log(`Error: ${err.message}`);
    });


// testing get and post add

app.get("/add", async (req, res) => {
    // Omitted validation check
    const totRecs = await dblib.getTotalRecords();
    //Create an empty customer object (To populate form with values)
    const customer = {
        c_id: "",
        c_first_name: "",
        c_last_name: "",
        c_state: "",
        sales_ytd: "",
        py_sales: ""
    };
    res.render("add", {
        type: "get",
        totRecs: totRecs.totRecords,
        customer: customer
    });
});


app.post("/add", async (req, res) => {

    const totRecs = await dblib.getTotalRecords();
    dblib.findCustomers(req.body)
    .then(result => {
      res.render("add", {
        type: "post",
        totRecs: totRecs.totRecords,
        result: result,
        customer: req.body
      });
    })
    .catch(err => {
      res.render("add", {
        type: "post",
        totRecs: totRecs.totRecords,
        result: `Unexpected Error: ${err.message}`,
        customer: req.body
      });
    });

});


// get and post import aka input

app.get("/input", (req, res) => {
    res.render("input");
 });
 
 app.post("/input",  upload.single('filename'), (req, res) => {
     if(!req.file || Object.keys(req.file).length === 0) {
         message = "Error: Import file not uploaded";
         return res.send(message);
     };
     //Read file line by line, inserting records
     const buffer = req.file.buffer; 
     const lines = buffer.toString().split(/\r?\n/);
 
     lines.forEach(line => {
          //console.log(line);
          product = line.split(",");
          //console.log(customer);
          const sql = "INSERT INTO CUSTOMERS(c_id, c_first_name, c_last_name, c_state, sales_ytd, py_sales) VALUES ($1, $2, $3, $4)";
          pool.query(sql, product, (err, result) => {
              if (err) {
                  console.log(`Insert Error.  Error message: ${err.message}`);
              } else {
                  console.log(`Inserted successfully`);
              }
         });
     });
     message = `Processing Complete - Processed ${lines.length} records`;
     res.send(message);
 });



// get and post export aka output

app.get("/output", (req, res) => {
    var message = "";
    res.render("output",{ message: message });
   });
   
   
   app.post("/output", (req, res) => {
       const sql = "SELECT * FROM CUSTOMERS ORDER BY C_ID";
       pool.query(sql, [], (err, result) => {
           var message = "";
           if(err) {
               message = `Error - ${err.message}`;
               res.render("output", { message: message })
           } else {
               var output = "";
               result.rows.forEach(customer => {
                   output += `${customer.c_id},${customer.c_first_name},${customer.c_last_name},${customer.c_state},${customer.sales_ytd},${customer.py_sales}\r\n`;
               });
               res.header("Content-Type", "text/csv");
               res.attachment("export.csv");
               return res.send(output);
           };
       });
   });

// inserted new test code

// testing out style sheets please ignore
// <link href="/styles.css" rel="stylesheet" type="text/css">
// <!-- CSS only -->
// <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-wEmeIV1mKuiNpC+IOBjI7aAzPcEZeedi5yW5f2yOq55WWLwNGmvvx4Um1vskeMj0" crossorigin="anonymous"></link>