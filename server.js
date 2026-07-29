const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");

const app = express();

const PORT = process.env.PORT || 3000;


// =======================
// Middleware
// =======================

app.set("trust proxy", true);

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(session({
    secret: "joakim-private-admin-key",
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(
    path.join(__dirname, "public")
));


// =======================
// Visits JSON
// =======================

const visitsFile = path.join(
    __dirname,
    "visits.json"
);


function getVisits() {

    if (!fs.existsSync(visitsFile)) {

        fs.writeFileSync(
            visitsFile,
            "[]"
        );

    }


    return JSON.parse(
        fs.readFileSync(visitsFile, "utf8")
    );

}



function saveVisits(data) {

    fs.writeFileSync(
        visitsFile,
        JSON.stringify(data, null, 4)
    );

}



// =======================
// Visitor Tracking
// =======================

app.use((req, res, next) => {


    // Ikke registrer admin/api/filer
    if (
        req.path !== "/admin" &&
        !req.path.startsWith("/api") &&
        !req.path.includes(".")
    ) {


        let ip =
            req.headers["x-forwarded-for"]?.split(",")[0]
            ||
            req.socket.remoteAddress;



        ip = ip.replace("::ffff:", "");



        const visits = getVisits();



        let visitor = visits.find(
            v => v.ip === ip
        );



        const now =
            new Date().toLocaleString("no-NO");



        if (visitor) {


            visitor.visits++;

            visitor.lastVisit = now;


        } else {


            visits.push({

                ip: ip,

                visits: 1,

                firstVisit: now,

                lastVisit: now,

                browser:
                req.headers["user-agent"]

            });


        }



        saveVisits(visits);


    }



    next();


});



// =======================
// Admin Login
// =======================


app.get("/admin", (req, res) => {


    if (req.session.loggedIn) {


        res.sendFile(
            path.join(
                __dirname,
                "public",
                "admin.html"
            )
        );


    } else {


        res.sendFile(
            path.join(
                __dirname,
                "public",
                "login.html"
            )
        );


    }

});





app.post("/login", (req, res) => {


    const password = req.body.password;



    if (password === "Joakim2026") {


        req.session.loggedIn = true;


        res.redirect("/admin");


    } else {


        res.send(
            "<h1>Feil passord</h1>"
        );


    }

});




// =======================
// API til Admin Dashboard
// =======================


app.get("/api/visits", (req, res) => {


    if (!req.session.loggedIn) {


        return res.status(403).json({

            error: "Access denied"

        });


    }



    res.json(
        getVisits()
    );


});



// =======================
// Start Server
// =======================

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});