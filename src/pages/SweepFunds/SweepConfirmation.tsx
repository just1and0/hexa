import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar, 
  ScrollView,
  Image
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { UsNumberFormat } from '../../common/utilities';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomSheet from 'reanimated-bottom-sheet';

import { withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import { REGULAR_ACCOUNT } from '../../common/constants/serviceTypes';
import RadioButton from '../../components/RadioButton';
import idx from 'idx';
import ModalHeader from '../../components/ModalHeader';
import CustomPriorityContent from '../../components/CustomPriorityContent';

interface SweepConfirmationStateTypes {
  accountData: any;
  serviceType: any;
  totalAmount: any;
  sliderValueText: any;
  transfer: any;
  customFeePerByte: string;
  customFeePerByteErr: string;
  loading: any;
  switchOn: boolean;
  CurrencyCode: string;
  exchangeRates: any;
  customEstimatedBlock: any;
}

interface SweepConfirmationPropsTypes {
  navigation: any;
  accounts: any;
  currencyToggleValue: any;
  currencyCode: any;
  exchangeRates: any;

}

class SweepConfirmation extends Component<
  SweepConfirmationPropsTypes,
  SweepConfirmationStateTypes
> {
  isSendMax: boolean;
  transfer: any;
  constructor(props) {
    super(props);
    this.isSendMax = false;//props.navigation.getParam('isSendMax');
    if (this.isSendMax) {
      setTimeout(() => {
        this.onPrioritySelect('Medium Fee');
      }, 2);
    }
    this.state={
      accountData: this.props.navigation.getParam('accountData'),
      serviceType: REGULAR_ACCOUNT,
      totalAmount: 0,
      sliderValueText: 'Low Fee',
      transfer: {},
      customFeePerByte: '',
      customFeePerByteErr: '',
      loading: {},
      switchOn: true,
      CurrencyCode: 'USD',
      exchangeRates: this.props.exchangeRates,
      customEstimatedBlock: 0,

    }
  }

  componentDidMount = () => {
    let { accounts } = this.props;
    let {serviceType} = this.state;
    if (accounts[serviceType].transfer.details) {
      let totalAmount = 0;
      accounts[serviceType].transfer.details.map((item) => {
        totalAmount += parseInt(item.bitcoinAmount);
      });
      if (totalAmount) this.setState({ totalAmount: totalAmount });
    }
    this.setState({
      transfer: accounts[serviceType].transfer,
      loading: accounts[serviceType].loading,
    });
   // this.onChangeInTransfer();
    this.setCurrencyCodeFromAsync();
  };

  componentDidUpdate = (prevProps) => {
    if (prevProps.exchangeRates !== this.props.exchangeRates) {
      this.setState({ exchangeRates: this.props.exchangeRates });
    }

    if (
      prevProps.accounts[this.state.serviceType].loading !==
      this.props.accounts[this.state.serviceType].loading
    ) {
      this.setState({ loading: this.props.accounts[this.state.serviceType].loading });
    }
  };

  calculateTotalAmount = () =>{
    const { accountData } = this.state;
    let sum = accountData.reduce((a, b) => a + (b['balance'] || 0), 0);
    console.log("SUM", sum);
    return UsNumberFormat(sum);
  }

  onPrioritySelect = (priority) => {
    this.setState({
      sliderValueText: priority,
    });
  };

  handleCustomFee = (amount, customEstimatedBlock) => {
    if (parseInt(amount) < 1) {
      this.setState({
        customFeePerByte: '',
        customFeePerByteErr: 'Custom fee minimum: 1 sat/byte ',
      });
      return;
    }
  }

  setCurrencyCodeFromAsync = async () => {
    let currencyToggleValueTmp = this.props.currencyToggleValue;
    let currencyCodeTmp = this.props.currencyCode;
    this.setState({
      switchOn: currencyToggleValueTmp ? true : false,
      CurrencyCode: currencyCodeTmp ? currencyCodeTmp : 'USD',
    });
  };

  getCorrectCurrencySymbol = () => {
    const { switchOn, CurrencyCode } = this.state;
    return switchOn
      ? 'sats'
      : CurrencyCode.toLocaleLowerCase();
  };

  convertBitCoinToCurrency = (value) => {
    const { switchOn, exchangeRates, CurrencyCode } = this.state;
    return switchOn
      ? UsNumberFormat(value)
      : exchangeRates
      ? ((value / 1e8) * exchangeRates[CurrencyCode].last).toFixed(2)
      : null;
  };

  render() {
    const { accountData, totalAmount, transfer, serviceType } = this.state;
    const { navigation } = this.props;
    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 0 }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              style={{ height: 30, width: 30, justifyContent: 'center' }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <View style={{ marginLeft: wp('2.5%') }}>
              <Text style={styles.modalHeaderTitleText}>
                {'Send Confirmation'}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ width: wp('85%'), alignSelf: 'center' }}>
          <ScrollView horizontal={true}>
            {accountData.map((item) => {
              return (
                <View style={styles.view1}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image source={item.image} 
                    style={styles.circleShapeView} />
                  </View>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.account_name}
                  </Text>
                  <Text
                    style={{
                      ...styles.amountText,
                      fontSize: RFValue(9),
                      color: Colors.blue,
                      alignSelf: 'center',
                      fontFamily: Fonts.FiraSansMediumItalic,
                    }}
                  >
                    {item.balance + ' sats'}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
        <View style={styles.availableToSpendView}>
          <Text style={styles.sweepingFromText}>Sweeping From: </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            {accountData.map((item) => {
              return (
            <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansItalic,
              }}
            >
              {item.account_name + ', '}
            </Text>)
            })}
          </View>
        </View>
        <View style={styles.totalMountView}>
          <Text style={styles.totalAmountText}>Total Amount</Text>
          <View style={styles.totalAmountOuterView}>
            <View style={styles.totalAmountInnerView}>
              <View style={styles.amountInputImage}>
                <Image
                  style={styles.textBoxImage}
                  source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
                />
              </View>
              <View style={styles.totalAmountView} />
              <Text style={styles.amountText}>
                {this.calculateTotalAmount()}
                {/* {UsNumberFormat(totalAmount)} */}
                {/* {totalAmount} */}
              </Text>
              <Text style={styles.amountUnitText}>{' sats'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.transactionPriorityView}>
            <Text style={styles.transactionPriorityText}>
              Transaction Priority
            </Text>
            {/* <Text style={styles.transactionPriorityInfoText}>
              Set priority for your transaction
            </Text> */}
            <View style={styles.priorityTableHeadingContainer}>
              <View style={{ paddingLeft: 10 }}>
                <Text style={styles.tableHeadingText}>Priority</Text>
              </View>
              <View style={styles.priorityDataContainer}>
                <Text style={styles.tableHeadingText}>Arrival Time</Text>
              </View>
              <View style={styles.priorityDataContainer}>
                <Text
                  style={{ ...styles.tableHeadingText, textAlign: 'center' }}
                >
                  Fee
                </Text>
              </View>
            </View>
            {!this.isSendMax ? (
              <View style={styles.priorityTableContainer}>
                <View
                  style={{
                    ...styles.priorityDataContainer,
                    justifyContent: 'flex-start',
                  }}
                >
                  <RadioButton
                    size={20}
                    color={Colors.lightBlue}
                    borderColor={Colors.borderColor}
                    isChecked={this.state.sliderValueText.includes('High')}
                    onpress={() => this.onPrioritySelect('High Fee')}
                  />
                  <Text style={{ ...styles.priorityTableText, marginLeft: 10 }}>
                    High
                  </Text>
                </View>
                <View style={styles.priorityDataContainer}>
                  <Text style={styles.priorityTableText}>
                  {'10 - 20 minutes'}
                    </Text>
                </View>
                <View style={styles.priorityDataContainer}>
                  <Text style={styles.priorityTableText}>
                    {this.convertBitCoinToCurrency(
                      transfer.stage1 && transfer.stage1.txPrerequisites
                        ? transfer.stage1.txPrerequisites['high'].fee
                        : '',
                    )}
                    {' ' + this.getCorrectCurrencySymbol()}
                  </Text>
                </View>
              </View>
            ) : null}
            <View style={styles.priorityTableContainer}>
              <View
                style={{
                  ...styles.priorityDataContainer,
                  justifyContent: 'flex-start',
                }}
              >
                <RadioButton
                  size={20}
                  color={Colors.lightBlue}
                  borderColor={Colors.borderColor}
                  isChecked={this.state.sliderValueText.includes('Medium')}
                  onpress={() => this.onPrioritySelect('Medium Fee')}
                />
                <Text style={{ ...styles.priorityTableText, marginLeft: 10 }}>
                  Medium
                </Text>
              </View>
              <View style={styles.priorityDataContainer}>
                {!this.isSendMax ? (
                    <Text style={styles.priorityTableText}>
                      {'10 - 20 minutes'}
                    </Text>
                ) : (
                  <Text>120 - 130</Text>
                )}
              </View>
              <View style={styles.priorityDataContainer}>
                <Text style={styles.priorityTableText}>
                  {this.convertBitCoinToCurrency(
                    transfer.stage1 && transfer.stage1.txPrerequisites
                      ? transfer.stage1.txPrerequisites['medium'].fee
                      : '',
                  )}
                  {' ' + this.getCorrectCurrencySymbol()}
                </Text>
              </View>
            </View>
            {!this.isSendMax ? (
              <View
                style={{
                  ...styles.priorityTableContainer,
                  borderBottomWidth:
                    this.state.customFeePerByte !== '' ? 0.5 : 0,
                }}
              >
                <View
                  style={{
                    ...styles.priorityDataContainer,
                    justifyContent: 'flex-start',
                  }}
                >
                  <RadioButton
                    size={20}
                    color={Colors.lightBlue}
                    borderColor={Colors.borderColor}
                    isChecked={this.state.sliderValueText.includes('Low')}
                    onpress={() => this.onPrioritySelect('Low Fee')}
                  />
                  <Text style={{ ...styles.priorityTableText, marginLeft: 10 }}>
                    Low
                  </Text>
                </View>
                <View style={styles.priorityDataContainer}>
                  <Text style={styles.priorityTableText}>
                      {'10 - 20 minutes'}
                    </Text>
                </View>
                <View style={styles.priorityDataContainer}>
                  <Text style={styles.priorityTableText}>
                    {this.convertBitCoinToCurrency(
                      transfer.stage1 && transfer.stage1.txPrerequisites
                        ? transfer.stage1.txPrerequisites['low'].fee
                        : '',
                    )}
                    {' ' + this.getCorrectCurrencySymbol()}
                  </Text>
                </View>
              </View>
            ) : null}
            {this.state.customFeePerByte !== '' && (
              <View
                style={{
                  ...styles.priorityTableContainer,
                  borderBottomWidth: 0,
                }}
              >
                <View
                  style={{
                    ...styles.priorityDataContainer,
                    justifyContent: 'flex-start',
                  }}
                >
                  <RadioButton
                    size={20}
                    color={Colors.lightBlue}
                    borderColor={Colors.borderColor}
                    isChecked={this.state.sliderValueText.includes('Custom')}
                    onpress={() => this.onPrioritySelect('Custom Fee')}
                  />
                  <Text style={{ ...styles.priorityTableText, marginLeft: 10 }}>
                    Custom
                  </Text>
                </View>
                <View style={styles.priorityDataContainer}>
                  <Text style={styles.priorityTableText}>
                    {this.state.customEstimatedBlock * 10} -{' '}
                    {(this.state.customEstimatedBlock + 1) * 10} minutes
                  </Text>
                </View>
                <View style={styles.priorityDataContainer}>
                  <Text style={styles.priorityTableText}>
                    {this.state.customFeePerByte}
                    {' ' + this.getCorrectCurrencySymbol()}
                    {/* {this.convertBitCoinToCurrency(
                      transfer.stage1 && transfer.stage1.txPrerequisites
                        ? transfer.stage1.txPrerequisites['low'].fee
                        : '')}{' ' + this.getCorrectCurrencySymbol()} */}
                  </Text>
                </View>
              </View>
            )}
            <TouchableOpacity
              style={{borderRadius: 8,
                marginTop: hp('1.2%'),
                backgroundColor: Colors.white,
                borderColor: Colors.backgroundColor,
                borderWidth: 2,
                opacity: this.isSendMax ? 0.5 : 1,
              }}
              onPress={() => {
                (this.refs.CustomPriorityBottomSheet as any).snapTo(1);
              }}
              disabled={this.isSendMax}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: hp('1.5%'),
                  paddingHorizontal: hp('1.5%'),
                }}
              >
                <Text style={styles.accountTypeTextBalanceView}>
                  Custom Priority
                </Text>
                <View
                  style={{
                    paddingHorizontal: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name="ios-arrow-forward"
                    color={Colors.textColorGrey}
                    size={12}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
          <BottomSheet
          onCloseStart={() => {
            (this.refs.CustomPriorityBottomSheet as any).snapTo(0);
          }}
          enabledInnerScrolling={true}
          ref={'CustomPriorityBottomSheet'}
          snapPoints={[-50, hp('65%')]}
          renderContent={() => (
            <CustomPriorityContent
              title={'Custom Priority'}
              info={''}
              err={this.state.customFeePerByteErr}
              service={this.props.accounts[serviceType].service}
              okButtonText={'Confirm'}
              cancelButtonText={'Back'}
              isCancel={true}
              onPressOk={(amount, customEstimatedBlock) =>
                this.handleCustomFee(amount, customEstimatedBlock)
              }
              onPressCancel={() => {
                if (this.refs.CustomPriorityBottomSheet as any)
                  (this.refs.CustomPriorityBottomSheet as any).snapTo(0);
              }}
            />
          )}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() => {
                if (this.refs.CustomPriorityBottomSheet as any)
                  (this.refs.CustomPriorityBottomSheet as any).snapTo(0);
              }}
            />
          )}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    accounts: state.accounts || [],
    currencyToggleValue: idx(state, (_) => _.preferences.currencyToggleValue),
    currencyCode: idx(state, (_) => _.preferences.currencyCode),

  };
};

export default withNavigationFocus(
  connect(mapStateToProps, {})(SweepConfirmation),
);

const styles = StyleSheet.create({
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('1.5%'),
    paddingTop: hp('1%'),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp('1.5%'),
  },
  textBoxView: {
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: Colors.borderColor,
  },
  textBoxImage: {
    width: wp('6%'),
    height: wp('6%'),
    resizeMode: 'contain',
  },
  amountInputImage: {
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  confirmButtonView: {
    width: wp('50%'),
    height: wp('13%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
  headerText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(12),
  },
  availableBalanceView: {
    paddingBottom: hp('1%'),
    paddingTop: hp('0.7%'),
    marginRight: wp('6%'),
    marginLeft: wp('6%'),
    marginBottom: hp('1%'),
    marginTop: hp('1%'),
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  accountTypeTextBalanceView: {
    color: Colors.blue,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansItalic,
  },
  availableToSpendText: {
    color: Colors.blue,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansItalic,
    lineHeight: 15,
    textAlign: 'center',
  },
  availableBalanceText: {
    color: Colors.blue,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansItalic,
  },
  availableBalanceUnitText: {
    color: Colors.blue,
    fontSize: RFValue(9),
    fontFamily: Fonts.FiraSansMediumItalic,
  },
  totalMountView: {
    flexDirection: 'row',
    alignItems: 'center',
   marginTop: hp('1.2%'),
    marginRight: wp('6%'),
    marginLeft: wp('6%'),
     //borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    paddingBottom: hp('1.7%'),
    // paddingTop: hp('1.5%'),
  },
  totalAmountText: {
    color: Colors.greyTextColor,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 5,
  },
  totalAmountOuterView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  totalAmountInnerView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  totalAmountView: {
    width: 1,
    height: '60%',
    backgroundColor: Colors.borderColor,
    marginRight: 5,
    marginLeft: 5,
    alignSelf: 'center',
  },
  amountText: {
    color: Colors.black,
    fontSize: RFValue(20),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 10,
  },
  amountUnitText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    marginRight: 5,
  },
  transactionPriorityView: {
    marginRight: wp('6%'),
    marginLeft: wp('6%'),
    marginTop: hp('2%'),
  },
  transactionPriorityText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 5,
  },
  transactionPriorityInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 5,
  },
  sliderTextView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sliderText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'center',
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 5,
  },
  bottomButtonView: {
    flexDirection: 'row',
    marginTop: hp('3%'),
    marginBottom: hp('5%'),
    marginLeft: wp('6%'),
    marginRight: wp('6%'),
  },
  tableHeadingText: {
    color: Colors.greyTextColor,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansMedium,
    textAlign: 'center'
  },
  priorityTableText: {
    fontSize: RFValue(12),
    lineHeight: RFValue(12),
    color: Colors.greyTextColor,
    textAlign: 'center',
  },
  priorityTableHeadingContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    marginTop: hp('2%'),
    paddingBottom: hp('1.5%'),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priorityTableContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: Colors.borderColor,
    marginTop: hp('1.5%'),
    paddingBottom: hp('1.5%'),
  },
  priorityDataContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  view1: {
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('15%'),
  },
  name: {
    color: Colors.textColorGrey,
    fontSize: RFValue(9),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'center',
    marginTop: 5,
    width: wp('15%'),
  },
  circleShapeView: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('14%') / 2,
    borderColor: Colors.white,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.7,
    shadowColor: Colors.borderColor,
    elevation: 10,
  },
  availableToSpendView: {
    marginRight: wp('6%'),
    marginLeft: wp('6%'),
    marginBottom: hp('1%'),
    marginTop: hp('1.5%'),
    flexDirection: 'row',
  },
  addessText: {
    color: Colors.blue,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansItalic,
  },
  sweepingFromText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 5,
  },
  balanceText: {
    color: Colors.blue,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansItalic,
  },
  textTsats: {
    color: Colors.textColorGrey,
    fontSize: RFValue(7),
    fontFamily: Fonts.FiraSansMediumItalic,
  },
});
