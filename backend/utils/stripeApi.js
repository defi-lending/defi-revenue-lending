const stripe = require("stripe")();

// Gets reports of a stripe account given its API key
const listReports = async (key) => {
  var reportRuns;

  reportRuns = await stripe.reporting.reportRuns.list(
    {
      limit: 3,
    },
    {
      apiKey: key,
    }
  );

  return reportRuns;
};

exports.listReports = listReports;
