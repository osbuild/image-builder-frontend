function isBeta() {
  return insights.chrome.isBeta() || insights.chrome.getEnvironment() === 'qa'
    ? true
    : false;
}

export default isBeta;
