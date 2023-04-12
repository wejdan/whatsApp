import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React from 'react';
import colors from '../constants/colors';
import {
  Menu,
  MenuTrigger,
  MenuOptions,
  MenuOption,
} from 'react-native-popup-menu';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import uuid from 'react-native-uuid';
import Clipboard from '@react-native-clipboard/clipboard';
import {starMessage} from '../utils/actions/chatActions';
import {connect, useSelector} from 'react-redux';
import md5 from 'md5';
import {auth} from '../utils/firebaseHelper';

export const MenuItem = ({text, icon, onSelect}) => {
  return (
    <MenuOption onSelect={onSelect}>
      <View style={styles.menuItemContainer}>
        <Text style={styles.menuText}>{text}</Text>
        <FontAwesome name={icon} size={18} />
      </View>
    </MenuOption>
  );
};
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}
function formatDate2(textDate) {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const date = new Date(textDate);
  return (
    monthNames[date.getMonth()] +
    ' ' +
    date.getDate() +
    ',' +
    date.getFullYear()
  );
}
const mapStateToProps = state => ({
  starredMessages: state.messages.starredMessages,
  storedUsers: state.users.storedUsers,
});
class PureBubble extends React.PureComponent {
  render() {
    const {
      text,
      type,
      chatID,
      sentAt,
      messageId,
      setReplay,
      replayTo,
      name,
      isLoading,
      imageUrl,
      isStar,
      storedUsers,
      starredMessages,
      navigation,
    } = this.props;
    const starId = md5(chatID + messageId);

    const bubbleStyle = {...styles.bubble};
    const textStyle = {...styles.text};
    const container = {...styles.container};
    let Container = View;
    const menuRef = React.createRef(null);
    const menuName = React.createRef();
    menuName.current = messageId;
    if (type == 'system') {
      textStyle.color = '#65644A';
      bubbleStyle.backgroundColor = colors.beige;
      bubbleStyle.alignItems = 'center';
      bubbleStyle.marginTop = 10;
    } else if (type == 'date') {
      textStyle.color = colors.textColor;
      bubbleStyle.backgroundColor = colors.extraLightGrey;
      bubbleStyle.alignItems = 'center';
      bubbleStyle.alignSelf = 'center';
      bubbleStyle.marginTop = 10;
    } else if (type == 'error') {
      textStyle.color = 'white';
      bubbleStyle.backgroundColor = colors.red;
      bubbleStyle.alignItems = 'center';
      bubbleStyle.marginTop = 10;
    } else if (type == 'myMessage') {
      bubbleStyle.backgroundColor = '#E7FED6';
      container.justifyContent = 'flex-end';
      bubbleStyle.maxWidth = '90%';
      Container = TouchableWithoutFeedback;
    } else if (type == 'theirMessage') {
      container.justifyContent = 'flex-start';
      bubbleStyle.maxWidth = '90%';
      Container = TouchableWithoutFeedback;
    } else if (type == 'replay') {
      bubbleStyle.backgroundColor = '#F2F2F2';
    } else if (type == 'info') {
      textStyle.color = colors.textColor;
      bubbleStyle.backgroundColor = 'rgba(255,255,255,0.7)';
      bubbleStyle.alignItems = 'center';
      bubbleStyle.alignSelf = 'center';
      bubbleStyle.marginTop = 10;
    }
    if (isStar) {
      container.justifyContent = 'flex-start';
      //  Container = View;
    }
    const copyToClipboard = async text => {
      Clipboard.setString(text);
    };
    const isStarred = starredMessages && starredMessages[starId] ? true : false;

    const replayingToUser = replayTo && storedUsers[replayTo.sentBy];

    return (
      <View style={container}>
        <Container
          style={{width: '100%'}}
          onPress={() => {
            if (isStar) {
              navigation.navigate('ChatScreen', {chatID, messageId});
            }
          }}
          onLongPress={() => {
            if (!isStar) {
              menuRef.current.props.ctx.menuActions.openMenu(menuName.current);
            }
          }}>
          <View style={bubbleStyle}>
            {name && <Text style={styles.name}>{name}</Text>}
            {replayTo && (
              <PureBubble
                text={replayTo.text}
                type="replay"
                name={replayingToUser.firstLast}
              />
            )}
            {imageUrl ? (
              <View style={{width: 300, height: 300, marginBottom: 5}}>
                <Image
                  source={{uri: imageUrl}}
                  style={{...StyleSheet.absoluteFill}}
                />
                {isLoading && (
                  <View
                    style={{
                      ...StyleSheet.absoluteFill,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                )}
              </View>
            ) : (
              <Text style={textStyle}>{text}</Text>
            )}
            {(type == 'replay' ||
              type == 'myMessage' ||
              type == 'theirMessage') &&
              !isStar && (
                <View style={styles.timeContainer}>
                  {isLoading && !imageUrl && (
                    <ActivityIndicator size="small" color={colors.grey} />
                  )}
                  {sentAt && !isLoading && (
                    <Text style={styles.time}>{formatDate(sentAt)}</Text>
                  )}

                  {isStarred && (
                    <FontAwesome
                      name="star"
                      size={12}
                      color={colors.textColor}
                      style={{marginLeft: 5}}
                    />
                  )}
                </View>
              )}
            {isStar && (
              <View style={styles.timeContainer}>
                <Text style={styles.time}>{formatDate2(sentAt)}</Text>
              </View>
            )}
            <Menu name={menuName.current} ref={menuRef}>
              <MenuTrigger />
              <MenuOptions>
                <MenuItem
                  text="Copy to clipboard"
                  icon="copy"
                  onSelect={() => copyToClipboard(text)}
                />
                <MenuItem
                  text={isStarred ? 'Unstar message' : 'Star message'}
                  icon={isStarred ? 'star' : 'star-o'}
                  onSelect={() =>
                    starMessage(messageId, chatID, auth.currentUser.uid)
                  }
                />
                <MenuItem text="Reply" icon="reply" onSelect={setReplay} />
              </MenuOptions>
            </Menu>
          </View>
        </Container>
      </View>
    );
  }
}

export default connect(mapStateToProps)(PureBubble);
const styles = StyleSheet.create({
  container: {flexDirection: 'row', justifyContent: 'center'},
  text: {
    fontFamily: 'Roboto-Regular',
    letterSpacing: 0.3,
  },
  bubble: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 5,

    marginBottom: 4,
    borderColor: '#E2DACC',
    borderWidth: 1,
  },
  menuItemContainer: {flexDirection: 'row', padding: 5},
  replay: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 5,
    marginBottom: 5,
  },
  replayText: {
    color: colors.blue,
  },
  name: {color: colors.blue, letterSpacing: 0.3, fontFamily: 'Roboto-Medium'},

  menuText: {
    flex: 1,
    fontFamily: 'Roboto-Regular',
    letterSpacing: 0.3,
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    color: colors.gray,
  },
});
