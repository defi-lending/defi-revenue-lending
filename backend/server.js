const express = require("express");

const getDummyReport = require("./utils/dummyReport");
const stripeApi = require("./utils/stripeApi");

const app = express();

// Returns Stripe report by its key
const getStripeReport = async (req, res, next) => {
  const key = req.params.key;
  let report;

  // Dummy report for demo
  report = getDummyReport(key);

  // Fetching real Stripe report. Assumes that the report exists and
  // that information will be later parsed.
  // Commented out for demo
  /*   try {
    report = await stripeApi.listReports(key);
  } catch (err) {
    return next(err);
  } */

  res.status(200).json(report);
};

// Endpoint for retrieving stripe reports
app.get("/borrowers/:key/stripe_reports", getStripeReport);

// Response for non-defined endpoints
app.use("/", (req, res, next) => {
  const error = new Error("Could not find this route");
  error.code = 404;
  throw error;
});

// Error handler
app.use((error, req, res, next) => {
  if (res.headerSent) {
    // means that for some reason a response has already been sent
    next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error ocurred!" });
});

// Start server
app.listen(process.env.PORT || 5000);
