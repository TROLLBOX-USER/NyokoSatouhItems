// Modules
const express = require("express")
const basicAuth = require("express-basic-auth")
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser")
const app = express();
const fs = require("fs");
const ach = require("./ach.json")

/**
 * Displays all achievements
 * @param {boolean} [c] Check if incomplete or completed.
*/
function checkAch(c = false) {
  if (c) return "<div class='ach complete'>" + ach.completed.join("<br>") + "</div>"
  else return "<div class='ach'>" + ach.incomplete.join("<br>") + "</div>"
}

// Main code

var uuid = require("./uuid.js").uuid;
let password = "K3SH-7HHC-2YK3-EFPM-N2US-9M5D-HLTB";
let items = []
let deleteditems = [];
let recentUser = "";
let admins = {}
items = JSON.parse(fs.readFileSync("./save/savefle.json"));
deleteditems = JSON.parse(fs.readFileSync("./save/savefle2.json"));
recentUser = JSON.parse(fs.readFileSync("./save/savefle3.json"));
admins = JSON.parse(fs.readFileSync("./save/savefle4.json"))
const basic = basicAuth({
  users: admins,
  challenge: true,
  realm: "Admin Panel",
  unauthorizedResponse: "Access denied"
})
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25
})
/**
 * Check banned users
*/
const banned = []
const news = ["There is a total of " + items.length + " items", "Recent name made an item is " + recentUser]
let randomizeNews = Math.floor(Math.random() * news.length)
let newsThing = news[randomizeNews]

setInterval(() => {
  randomizeNews = Math.floor(Math.random() * news.length)
  newsThing = news[randomizeNews]
}, 15000)

app.enable('trust proxy')

app.enable('case sensitive routing')

app.use(express.static("./static"))

app.use(limiter)

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json());

app.set("view engine", "ejs")

function web(t = "NamItems", a = "", d = false) {
  function disabled() {
    if (d) return "disabled='true' "
    else return " "
  }
  return "<!DOCTYPE html><title>" + t + "</title><link href='style.css' rel='stylesheet'><link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css'><script src='https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js'></script><script src='script.js' defer></script><link href='https://fonts.googleapis.com/icon?family=Material+Icons' rel='stylesheet'><div class='news-tcontainer'><div class='news-ticker'><div class='news-ticker-wrap'><div class='news-ticker-move'>BREAKING NEWS: " + newsThing + "</div></div></div></div><br><div class='items'><h1>Items</h1></div><br><button class='waves-effect waves-light btn green' onclick='toggleDarkMode()'>Toggle dark mode</button><br><br>" + items.join("<br>") + "<br><br><button onclick=\"location.href = '/createItem'\" class='waves-effect waves-light btn green'>Create an item</button><br><br><button onclick=\"location.href = '/admin'\" " + disabled() + "class='waves-effect waves-black btn'>Admin Login</button>" + a + "<hr><h4>Misc</h4><hr><button onclick=\"location.href = '/achievements'\" class='card-panel teal lighten-2'>Achievements</button><br><button class='waves-effect waves-light btn black' onclick=\"location.href = '/mods'\">Modifications</button><br><br><button class='waves-effect waves-light btn blue' onclick=\"location.href = '/searchItem'\">Search an item</button><br><br><nav><button onclick=\"location.href = '/about'\" class='waves-effect waves-light btn-small green'>About</button> <button onclick=\"location.href = '/changelogs'\" class='waves-effect waves-light btn-small green'>Changelogs</button></nav><br>Current Version: v2.234"
}

app.get("/", (req, res) => {
  banned.includes(req.ip) ? res.status(403).sendFile(__dirname + "/banned.html") : res.send(web())
})

app.get("/about", (req, res) => {
  banned.includes(req.ip) ? res.status(403).sendFile(__dirname + "/banned.html") : res.sendFile(__dirname + "/about.html")
})

app.get("/changelogs", (req, res) => {
  banned.includes(req.ip) ? res.status(403).sendFile(__dirname + "/banned.html") : res.sendFile(__dirname + "/changelogs.html")
})

app.post("/create", (req, res) => {
  items.push(req.query.user + " made " + req.query.item + " | " + new Date() + " | " + req.query.description + " | Category: " + req.query.category)
  recentUser = req.query.user
})

app.get("/createItem", (req, res) => {
  banned.includes(req.ip) ? res.status(403).sendFile(__dirname + "/banned.html") : res.sendFile(__dirname + "/create.html")
});

app.get("/achievements", (req, res) => {
  banned.includes(req.ip) ? res.status(403).sendFile(__dirname + "/banned.html") : res.render("achievements", { completed: checkAch(true), incomplete: checkAch() })
})

app.get("/admin", (req, res) => {
  banned.includes(req.ip) ? res.status(403).sendFile(__dirname + "/banned.html") : res.sendFile(__dirname + "/login.html")
})

app.get("/didLogin", basic, (req, res) => {
  if (req.auth.user == "ebicgamer2007" && req.auth.password == "bowtostern") return res.send("<h1 style='color:red'>Your password is insecure.</h1><p>Insecure passwords on your backup accounts can be serious.</p>")
  banned.includes(req.ip) ? res.status(429).sendFile(__dirname + "/banned.html") : !req.query.password ? res.status(403).sendFile(__dirname + "/empty.html") : uuid(req.query.password) == password ? res.send(web("NamItems as Admin", "<br><br><button onclick=\"location.href = '/deletedItems'\" class='waves-effect waves-light btn green'>Show deleted items</button><br><br><button class='waves-effect waves-light btn lime' onclick='location.href = `/createAdminAcc?password=NamTheDuck`'>Create Admin Account</button><br><br><button class='waves-effect waves-light btn lime' onclick='location.href = `/lookUp`'>Lookup Guest</button><br><br><button class='waves-effect waves-light btn green' onclick='location.href = `/adminDashboard`'>Admin Dashboard</button><hr><h4>DANGER ZONE</h4><hr><button onclick=\"location.replace('/deleteItem?direction=last&password='+location.search.replace('?password=',''))\" class='waves-effect waves-light btn red'>Delete last item</button><br><br><button onclick=\"location.replace('/deleteItem?direction=first&password='+location.search.replace('?password=',''))\" class='waves-effect waves-light btn red'>Delete first item</button><br><br><button onclick=\"location.replace('/deleteItem?direction=all&password='+location.search.replace('?password=',''))\" class='waves-effect waves-light btn red'>Delete all items</button><br><br><button class='waves-effect waves-light btn red' onclick='location.href = `/freezeAccountCreation?password=NamTheDuck`'>Freeze Admin Account Creation</button>", true)) : res.status(403).sendFile(__dirname + "/wrong.html");
  console.log(req.auth.user + " entered the admin panel! Keep track of him.")
})

app.get("/freezeAccountCreation", (req, res) => {
  if (!req.query.password) return res.status(403).send("Access denied")
  if (uuid(req.query.password) == password) {
    Object.seal(admins)
    res.redirect("/didLogin?password=NamTheDuck")
  } else {
    res.status(403).send("Access denied")
  }
})

app.post("/changePass", basic, (req, res) => {
  admins[req.auth.user] = req.body.password
  res.redirect("/adminDashboard")
}) 

app.get("/lookUp", (req, res) => {
  banned.includes(req.ip) ? res.status(403).sendFile(__dirname + "/banned.html") : res.sendFile(__dirname + "/lookup.html")
})

app.get("/search", (req, res) => {
  banned.includes(req.ip) ? res.status(403).sendFile(__dirname + "/banned.html") : res.render("itemsoutput", { searchedFor: req.query.q, result: items.filter(itemName => itemName.includes(req.query.q)).join("<br>") })
})

app.get("/searchItem", (req, res) => {
  banned.includes(req.ip) ? res.status(403).sendFile(__dirname + "/banned.html") : res.sendFile(__dirname + "/search.html")
})

app.get("/deleteItem", (req, res) => {
  if (!req.query.password) return res.status(403).send("Access denied")
  if (uuid(req.query.password) == password) {
    if (req.query.direction == "last") {
      deleteditems.push(items.pop())
      res.redirect("/didLogin?password=" + req.query.password)
    } else if (req.query.direction == "first") {
      deleteditems.unshift(items.shift())
      res.redirect("/didLogin?password=" + req.query.password);
    } else if (req.query.direction == "all") {
      while (items.length) {
        deleteditems.push(items.pop())
      }
      if (!items.length) res.redirect("/didLogin?password=" + req.query.password);
    }
  } else {
    res.status(403).send("Access denied");
  }
})

app.post("/createAdminAccount", (req, res) => {
  admins[req.query.name] = req.query.password
})

app.get("/createAdminAcc", (req, res) => {
  if (!req.query.password) return res.status(403).send("Access denied")
  if (Object.isSealed(admins)) return res.status(403).send("You cannot add admin accounts currently.")
  if (uuid(req.query.password) == password) {
    res.sendFile(__dirname + "/createadmin.html")
  } else {
    res.status(403).send("Access denied");
  }
})

app.get("/deletedItems", (req, res) => {
  banned.includes(req.ip) ? res.status(403).sendFile(__dirname + "/banned.html") : res.render("deleteditems", { deleted: deleteditems.join("<br>") })
})

app.get("/mods", (req, res) => {
  banned.includes(req.ip) ? res.status(403).sendFile(__dirname + "/banned.html") : res.sendFile(__dirname + "/modifications.html");
})

app.get("/adminDashboard", basic, (req, res) => {
  banned.includes(req.ip) ? res.status(403).sendFile(__dirname + "/banned.html") : res.render('dashboard', { username: req.auth.user, password: req.auth.password })
})

app.get("/guests/:name", (req, res) => {
  banned.includes(req.ip) ? res.status(403).sendFile(__dirname + "/banned.html") : res.render("guestprofile", { 
    guestName: req.params.name, 
    createdItems: items.filter(name => name.startsWith(req.params.name)).join("<br>"),
    deletedItems: deleteditems.filter(name => name.startsWith(req.params.name)).join("<br>"),
    isAdmin() {
      if (admins[req.params.name]) {
        return true
      }
      return false
    }
  })
})

app.get("/deletePermamently", (req, res) => {
  if (req.query.direction == "last") {
    deleteditems.pop()
    res.redirect("/deletedItems")
  } else if (req.query.direction == "first") {
    deleteditems.shift()
    res.redirect("/deletedItems")
  } else if (req.query.direction == "all") {
    deleteditems = []
    res.redirect("/deletedItems")
  }
})

app.get("/restoreItem", (req, res) => {
  if (!req.query.password) return res.status(403).send("Access denied")
  if (uuid(req.query.password) == password) {
    if (req.query.direction == "last") {
      items.push(deleteditems.pop())
      res.redirect("/deletedItems")
    } else if (req.query.direction == "first") {
      items.unshift(deleteditems.shift())
      res.redirect("/deletedItems")
    } else if (req.query.direction == "all") {
      while (deleteditems.length) {
        items.push(deleteditems.pop())
      }
      if (!deleteditems.length) res.redirect("/deletedItems")
    }
  } else {
    res.status(403).send("Access denied")
  }
})

app.get("/randomItem", (req, res) => {
  res.send("<!DOCTYPE html><title>NamItems</title><pre> " + items[Math.round(Math.random() * items.length - 1)] + " </pre>")
})

app.get("/redirect", (req, res) => {
  res.redirect(req.query.to)
})

app.use((req, res) => {
	res.status(404).sendFile(__dirname + '/notfound.html')
});

app.use((err, req, res, next) => {
  console.log(err)
  res.status(500).sendFile(__dirname + "/err.html")
})

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening...")
})

setInterval(() => {
  fs.writeFileSync("./save/savefle.json", JSON.stringify(items));
  fs.writeFileSync("./save/savefle2.json", JSON.stringify(deleteditems));
  fs.writeFileSync("./save/savefle3.json", JSON.stringify(recentUser));
  fs.writeFileSync("./save/savefle4.json", JSON.stringify(admins));
}, 5000)

//hello.