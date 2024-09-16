export const parseYYYYMMDDToDate = (val: string) =>
  val ? new Date(`${val}T00:00:00`) : new Date('');

export const yyyyMMddFormat = (date: Date) =>
  `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

export const toMonthAndYear = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
  };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
};

export const timestampToDisplayString = (ts?: string) => {
  // timestamp has format 2021-04-27T12:31:12Z
  // must be converted to ms timestamp and then reformatted to Apr 27, 2021
  if (!ts) {
    return '';
  }

  // get YYYY-MM-DD format
  const ms = Date.parse(ts);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const tsDisplay = new Intl.DateTimeFormat('en-US', options).format(ms);
  return tsDisplay;
};

export const timestampToDisplayStringDetailed = (ts?: string) => {
  // Detailed representation including time and time zone
  if (!ts) {
    return '';
  }

  const ms = Date.parse(ts);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    timeZoneName: 'short',
  };

  const tsDisplay = new Intl.DateTimeFormat('en-US', options).format(ms);
  return tsDisplay;
};

export const convertStringToDate = (createdAtAsString: string = '') => {
  if (isNaN(Date.parse(createdAtAsString))) {
    // converts property created_at of the image object from string to UTC
    const [dateValues, timeValues] = createdAtAsString.split(' ');
    const datetimeString = `${dateValues}T${timeValues}Z`;
    return Date.parse(datetimeString);
  } else {
    return Date.parse(createdAtAsString);
  }
};

export const computeHoursToExpiration = (imageCreatedAt: string) => {
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
