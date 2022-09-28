// Utillity to generate random stripe reports

/**
 * Returns a hash code from a string
 * @param  {String} str The string to hash.
 * @return {Number}    A 32bit integer
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    let chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

let DUMMY_STRIPE_REPORTS = [
  {
    currency: "eur",
    starting_balance: 0.0,
    activity_gross: 20.0,
    activity_fee: 0.83,
    activity: 19.17,
    payouts_gross: 0.0,
    payouts_fee: 0.0,
    payouts: 0.0,
    ending_balance: 19.17,
    interval_start: 1661990400,
    interval_end: 1664063999,
  },
];

function getDummyReport(key) {
  let report = { ...DUMMY_STRIPE_REPORTS[0] };
  let hash = hashCode(key);

  report.activity_gross *= hash % 10000;
  report.activity_fee *= hash % 10000;
  report.activity *= hash % 10000;
  report.ending_balance *= hash % 10000;

  return report;
}

module.exports = getDummyReport;
