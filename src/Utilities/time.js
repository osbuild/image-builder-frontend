export const timestampToISO8601 = (timestamp) => {
  if (!timestamp) {
    return '';
  }

  const date = timestamp.slice(0, 10);
  const time = timestamp.slice(11, 26);

  return `${date}T${time}+0000`;
};


export const timestampToDisplayString = (ts) => {
  // timestamp has format 2021-04-27 12:31:12.794809 +0000 UTC
  // must be converted to ms timestamp and then reformatted to Apr 27, 2021
  if (!ts) {
    return '';
  }

  // get YYYY-MM-DD format
  const date = ts.slice(0, 10);
  const ms = Date.parse(date);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  const tsDisplay = new Intl.DateTimeFormat('en-US', options).format(ms);
  return tsDisplay;
};
