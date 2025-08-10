import Toast from 'react-native-toast-message';

export const showPointsToast = ({ points = 0, message = '', awardedAlready = false }) => {
    const text1 = awardedAlready
      ? `ℹ️ You already earned these ${points} points`
      : `🏆 You earned ${points} points!`;
  
    Toast.show({
      type: 'success',
      text1,
      text2: message,
      position: 'bottom',
      visibilityTime: 2500,
      bottomOffset: 50,
    });
  };
  