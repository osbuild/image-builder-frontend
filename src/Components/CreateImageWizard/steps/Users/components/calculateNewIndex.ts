function calculateNewIndex(
  tabIndex: number,
  activeTabKey: number,
  usersLength: number,
) {
  const tabIndexNum = tabIndex;
  let nextTabIndex = activeTabKey;

  if (tabIndexNum < activeTabKey) {
    // if a preceding tab is closing, keep focus on the new index of the current tab
    nextTabIndex = activeTabKey - 1 > 0 ? activeTabKey - 1 : 0;
  } else if (activeTabKey === usersLength - 1) {
    // if the closing tab is the last tab, focus the preceding tab
    nextTabIndex = usersLength - 2 >= 0 ? usersLength - 2 : 0;
  }

  return nextTabIndex;
}

export default calculateNewIndex;
