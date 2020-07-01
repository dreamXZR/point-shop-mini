const App = getApp();
const Toptips = require('../../components/toptips/toptips');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bottom_val:20,
    inputVal: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let _this = this;

    _this.gettoubu();
    
  },
  onShow: function() {
    // 获取当前用户信息
    this.getUserDetail();
    
  },
  getUserDetail: function() {
    let _this = this;
    App._get('user.index/detail', {}, function(result) {
      _this.setData(result.data);
    });
  },
  methods:{
    
  },
  gettoubu() {
    wx.setNavigationBarTitle({
      title: '向商户付款' 
    });
  },
  inputFocus(e){
    var _this=this
    _this.setData({
      bottom_val: e.detail.height + 20
    })
  },
  inputBlur(){
    var _this=this
    _this.setData({
      bottom_val: 20
    })
  },
  inputVal(e){
    var _this=this
    // console.log(e.detail.value)
    // _this.setData({
    //   inputVal: e.detail.value
    // })
    _this.data.inputVal=e.detail.value

  },
  pay(){
    var _this=this
    var value=_this.data.inputVal
    console.log(value)
    // console.log(e.detail.value)
    if(value > 0){
      console.log(1)
      // 微信支付
      // wx:wx.requestPayment({
      //   nonceStr: 'nonceStr',
      //   package: 'package',
      //   paySign: 'paySign',
      //   timeStamp: 'timeStamp',
      //   signType: signType,
      //   success: (res) => {},
      //   fail: (res) => {},
      //   complete: (res) => {},
      // })

    }else{
      wx.showToast({
        title: '请输入金额',
        icon: 'none',
        duration: 2000
      })

    }
  }
  
  

})