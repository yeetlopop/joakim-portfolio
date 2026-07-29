const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = 3000;

const visitorFile = path.join(__dirname, "data", "visitors.json");


// -------------------------
// Setup
// -------------------------

// Lag data-mappe hvis den ikke finnes
if (!fs.existsSync(path.join(__dirname, "data"))) {
    fs.mkdirSync(path.join(__dirname, "data"));
}


// Lag JSON-fil hvis den ikke finnes
if (!fs.existsSync(visitorFile)) {
    fs.writeFileSync(visitorFile, "[]");
}


// Ikke la express laste index automatisk
app.use(express.static(path.join(__dirname, "public"), {
    index: false
}));




// -------------------------
// Visitor system
// -------------------------

function registerVisitor(req) {


    const ip =
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress;



    const browser =
        req.headers["user-agent"];



    const currentTime =
        new Date().toLocaleString("no-NO");



    let visitors =
        JSON.parse(
            fs.readFileSync(visitorFile, "utf8")
        );



    const existingVisitor =
        visitors.find(
            visitor => visitor.ip === ip
        );



    if (existingVisitor) {


        existingVisitor.visits += 1;

        existingVisitor.lastVisit = currentTime;

        existingVisitor.browser = browser;


    } else {


        visitors.push({

            ip: ip,

            visits: 1,

            firstVisit: currentTime,

            lastVisit: currentTime,

            browser: browser

        });


    }



    fs.writeFileSync(
        visitorFile,
        JSON.stringify(
            visitors,
            null,
            4
        )
    );


    console.log("New visit:");
    console.log(ip);

}





// -------------------------
// Main website
// -------------------------

app.get("/", (req, res) => {


    registerVisitor(req);



    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );


});






// -------------------------
// Admin page
// -------------------------

app.get("/admin", (req, res) => {


    let visitors =
        JSON.parse(
            fs.readFileSync(visitorFile, "utf8")
        );



    let html = `

<!DOCTYPE html>

<html>

<head>

<title>
Visitor Dashboard
</title>


<style>

body {

    font-family: Arial;
    background:#080808;
    color:white;
    padding:40px;

}


h1 {

    color:#a78bfa;

}


table {

    width:100%;
    border-collapse:collapse;
    background:white;
    color:black;

}


th, td {

    padding:15px;
    border:1px solid #ccc;

}


</style>


</head>


<body>


<h1>
Visitor Dashboard
</h1>



<table>


<tr>

<th>
IP
</th>

<th>
Visits
</th>

<th>
First Visit
</th>

<th>
Last Visit
</th>

<th>
Browser
</th>

</tr>

`;



visitors.forEach(visitor => {


html += `

<tr>

<td>
${visitor.ip}
</td>


<td>
${visitor.visits}
</td>


<td>
${visitor.firstVisit}
</td>


<td>
${visitor.lastVisit}
</td>


<td>
${visitor.browser}
</td>


</tr>

`;


});



html += `

</table>


</body>

</html>

`;



res.send(html);


});







// -------------------------
// Start server
// -------------------------

app.listen(PORT, "0.0.0.0", () => {


    console.log(
        `Server running at http://localhost:${PORT}`
    );


});