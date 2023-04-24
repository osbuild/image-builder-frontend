const isPreview = () => {
  return insights.chrome.isPreview() || insights.chrome.getEnvironment() === 'qa'
    ? true
    : false;
}

export default isPreview;
