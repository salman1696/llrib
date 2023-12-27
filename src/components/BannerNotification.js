import React from 'react';
import {RNNotificationBanner} from 'react-native-notification-banner';

const DURATION = 5000; //second

class BannerNotification {
  static show(title = '', message, type = 'error') {
    if (type === 'error') {
      RNNotificationBanner.Error({
        title: title ?? '',
        subTitle: message ?? 'Invalid information',
        withIcon: false,
        duration: DURATION,
      });
    } else {
      RNNotificationBanner.Warn({
        title: title ?? '',
        subTitle: message ?? 'Invalid information',
        withIcon: false,
        duration: DURATION,
      });
    }
  }
}

export default BannerNotification;
