export const timestampToDisplayString = (ts) => {
  // timestamp has format 2021-04-27 12:31:12.794809 +0000 UTC
  // must be converted to ms timestamp and then reformatted to Apr 27, 2021
  if (!ts) {
    return '';
  }

  // get YYYY-MM-DD format
  const ms = Date.parse(ts);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  const tsDisplay = new Intl.DateTimeFormat('en-US', options).format(ms);
  return tsDisplay;
};

export const convertStringToDate = (createdAtAsString) => {
  if (isNaN(Date.parse(createdAtAsString))) {
    // converts property created_at of the image object from string to UTC
    const [dateValues, timeValues] = createdAtAsString.split(' ');
    const datetimeString = `${dateValues}T${timeValues}Z`;
    return Date.parse(datetimeString);
  } else {
    return Date.parse(createdAtAsString);
  }
};

export const hoursToExpiration = (imageCreatedAt) => {
  if (imageCreatedAt) {
    const currentTime = Date.now();
    // miliseconds in hour - needed for calculating the difference
    // between current date and the date of the image creation
    const msInHour = 1000 * 60 * 60;
    const timeUntilExpiration = Math.floor(
      (currentTime - convertStringToDate(imageCreatedAt)) / msInHour
    );
    return timeUntilExpiration;
  } else {
    // when creating a new image, the compose.created_at can be undefined when first queued
    return 0;
  }
};
