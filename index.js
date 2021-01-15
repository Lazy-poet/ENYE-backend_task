#!/usr/bin/env node
require("dotenv").config();
const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  errorHandler = require("errorhandler"),
  methodOverride = require("method-override"),
  axios = require("axios"),
  cors = require("cors"),
hostname = (process.env.HOSTNAME || "localhost"),
  port = (parseInt(process.env.PORT, 10) || 5000);
app.use(methodOverride());
app.use(bodyParser.json()); // parse json req body
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(
  errorHandler({
    dumpExceptions: true,
    showStack: true,
  })
);
const response = { CREATED: 201, SUCCESS: 200, BADREQUEST: 400, NOTFOUND: 404, SERVERERROR: 500 };
// get rates with param
app.get("/api/rates", async function (req, res) {
    const queryParams = req.query;
    const {base, currency} = queryParams;
    if(!base || !currency) {
        return res.status(response.BADREQUEST).json({results: null, message: "You must supply base and currency list"});
        
      }
    const url = `https://api.exchangeratesapi.io/latest?base=${base}&symbols=${currency}`;
    try {
    let proxyData = await axios.get(url);
        if(proxyData) {
            const { date, rates } = proxyData.data;
            let resp = {results: {}};
            resp.results = {base, date, rates};
            return res.status(response.SUCCESS).json(resp);
        }
    } catch(err) {
        return res
        .status(response.SERVERERROR)
        .json({ results: null, message: String(err) });
    }
});

app.listen(port, ()=>console.log("app running at http://%s:%s", hostname, port));