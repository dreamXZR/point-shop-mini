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
    _this.setData({
      options : options
    })
    //获取店铺信息
    _this.getShopDetail(options.shop_id);
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
    _this.data.inputVal=e.detail.value

  },
  pay(){
    var _this=this
    var value=_this.data.inputVal
    
    // 订单创建成功后回调--微信支付
    let callback = function(result) {
      if (result.code === -10) {
        App.showError(result.msg, function() {
          // 跳转到未付款订单
          wx.switchTab({
            url: '/pages/index/index',
          });
        });
        return false;
      }
      // 发起微信支付
      wx.requestPayment({
        timeStamp: result.data.payment.timeStamp,
        nonceStr: result.data.payment.nonceStr,
        package: 'prepay_id=' + result.data.payment.prepay_id,
        signType: 'MD5',
        paySign: result.data.payment.paySign,
        success: function(res) {
          // 跳转到订单详情
          wx.showModal({
            title: '友情提示',
            content: '支付成功',
            showCancel: true,
            success: function(res) {
              wx.switchTab({
                url: '/pages/index/index',
              });
            }
          })
          
        },
        fail: function() {
          App.showError('未支付', function() {
            // 跳转到未付款订单
            wx.switchTab({
              url: '/pages/index/index',
            });
          });
        },
      });
    };
    if(value > 0){
      App._post_form('user/outlinePay', {
        total_price:value,
        shop_id: _this.data.detail.shop_id,
      }, function(result) {
        callback(result);
      });
    }else{
      wx.showToast({
        title: '请输入金额',
        icon: 'none',
        duration: 2000
      })

    }
  },
  /**
   * 获取门店详情
   */
  getShopDetail(shop_id) {
    let _this = this;
    App._get('shop/detail', {
      shop_id
    }, function(result) {
      _this.setData(result.data);

    });
  },
  
  

})