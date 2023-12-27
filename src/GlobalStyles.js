import StyleConfig from './StyleConfig';

export default {
  flexOne: {flex: 1},
  flexDirectionRow: {flexDirection: 'row'},
  alignItemsCenter: {alignItems: 'center'},
  justifyContentCenter: {justifyContent: 'center'},
  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: StyleConfig.dimensions.borderRadius * 8,
    height: StyleConfig.dimensions.height * 0.923,
  },
};
