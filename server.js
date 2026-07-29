const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");

const app = express();

const PORT = process.env.PORT || 3000;


// ==========================
// MIDDLEWARE
// ==========================

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


app.use(session({

    secret: "joakim-private-admin-key",

    resave: false,

    saveUninitialized: false

}));


// Gjør Express klar for Render proxy
app.set("trust proxy", true);


// Public folder
app.use(express.static(
    path.join(__dirname, "public")
));




// ==========================
// VISITOR SYSTEM
// ==========================


const visitsFile = path.join(
    __dirname,
    "visits.json"
);



function getVisits(){

    if(!fs.existsSync(visitsFile)){

        fs.writeFileSync(
            visitsFile,
            "[]"
        );

    }


    return JSON.parse(
        fs.readFileSync(visitsFile)
    );

}




function saveVisits(data){

    fs.writeFileSync(

        visitsFile,

        JSON.stringify(
            data,
            null,
            4
        )

    );

}




// Registrerer besøk på hovedside

app.use((req,res,next)=>{


    if(req.path === "/" || req.path === "/index.html"){


        let ip =
        req.headers["x-forwarded-for"]?.split(",")[0]
        ||
        req.ip;


        // fjerner IPv6 format
        ip = ip.replace("::ffff:","");



        const visits = getVisits();



        let visitor = visits.find(
            v => v.ip === ip
        );



        const now =
        new Date().toLocaleString(
            "no-NO"
        );



        if(visitor){


            visitor.visits++;

            visitor.lastVisit = now;


        }

        else{


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







// ==========================
// ADMIN LOGIN
// ==========================



app.get("/admin",(req,res)=>{


    if(req.session.loggedIn){


        res.sendFile(

            path.join(
                __dirname,
                "public",
                "admin.html"
            )

        );


    }

    else{


        res.sendFile(

            path.join(
                __dirname,
                "public",
                "login.html"
            )

        );


    }


});







app.post("/login",(req,res)=>{


    const password =
    req.body.password;



    if(password === "Joakim2026"){


        req.session.loggedIn = true;


        res.redirect("/admin");


    }

    else{


        res.send(

            "<h1>Feil passord</h1>"

        );


    }


});







// Henter visitor-data til admin

app.get("/api/visits",(req,res)=>{


    if(!req.session.loggedIn){

        return res.status(403).json({

            error:"Access denied"

        });

    }



    res.json(
        getVisits()
    );


});







// ==========================
// START SERVER
// ==========================


app.listen(PORT,()=>{


    console.log(
        `Server running on port ${PORT}`
    );


});