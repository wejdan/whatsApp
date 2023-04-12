export const readNotification = (
  loggedInUserID,
  notificationObj,
  latestMessageUser,
  storedUsers,
) => {
  let objects = '';
  let subTitle = '';
  notificationObj.object?.map(userObj => {
    const objectUser = storedUsers[userObj];
    if (objectUser) {
      objects =
        objects +
        (objects.length > 0 ? ', ' : '') +
        (userObj == loggedInUserID ? 'You' : storedUsers[userObj].firstLast);
    }
  });

  subTitle = `${
    notificationObj.user == loggedInUserID ? 'You' : latestMessageUser.firstLast
  } ${notificationObj.action} ${notificationObj.object ? objects : ''}`;
  return subTitle;
};
