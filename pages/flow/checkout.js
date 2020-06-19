const App = getApp();

// 枚举类：发货方式
const DeliveryTypeEnum = require('../../utils/enum/DeliveryType.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {

    // 当前页面参数
    options: {},

    // 配送方式
    deliverys: DeliveryTypeEnum,
    currentDelivery: DeliveryTypeEnum.EXPRESS.value,

    address: null, // 默认收货地址
    exist_address: false, // 是否存在收货地址

    selectedShopId: 0, // 选择的自提门店id

    goods: {}, // 商品信息

    // 选择的优惠券
    selectCoupon: {
      index: null,
      couponId: null,
      reduced_price: '0.00'
    },

    // 买家留言
    remark: '',

    // 禁用submit按钮
    disabled: false,

    hasError: false,
    error: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    let _this = this;
    // 当前页面参数
    _this.data.options = options;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let _this = this;
    // 获取当前订单信息
    _this.getOrderData();
  },

  /**
   * 获取当前订单信息
   */
  getOrderData: function() {
    let _this = this,
      options = _this.data.options;
    // 获取订单信息回调方法
    let callback = function(result) {
      if (result.code !== 1) {
        App.showError(result.msg);
        return false;
      }
      // 显示错误信息
      if (result.data.has_error) {
        _this.data.hasError = true;
        _this.data.error = result.data.error_msg;
        App.showError(_this.data.error);
      }
      _this.setData(result.data);
    };
    // 立即购买
    if (options.order_type === 'buyNow') {
      App._get('order/buyNow', {
        goods_id: options.goods_id,
        goods_num: options.goods_num,
        goods_sku_id: options.goods_sku_id,
        delivery: _this.data.currentDelivery,
        shop_id: _this.data.selectedShopId,
      }, function(result) {
        callback(result);
      });
    }
    // 购物车结算
    else if (options.order_type === 'cart') {
      App._get('order/cart', {
        cart_ids: options.cart_ids,
        delivery: _this.data.currentDelivery,
        shop_id: _this.data.selectedShopId,
      }, function(result) {
        callback(result);
      });
    }
  },

  /**
   * 切换配送方式
   */
  onSwichDelivery(e) {
    // 设置当前配送方式
    let _this = this,
      currentDelivery = e.currentTarget.dataset.current;
    _this.setData({
      currentDelivery
    });
    // 重新获取订单信息
    _this.getOrderData();
  },

  /**
   * 快递配送：选择收货地址
   */
  onSelectAddress() {
    wx.navigateTo({
      url: '../address/' + (this.data.exist_address ? 'index?from=flow' : 'create')
    });
  },

  /**
   * 上门自提：选择自提点
   */
  onSelectExtractPoint() {
    let _this = this,
      selectedId = _this.data.selectedShopId;
    wx.navigateTo({
      url: '../_select/extract_point/index?selected_id=' + selectedId
    });
  },

  /**
   * 订单提交
   */
  submitOrder: function() {
    let _this = this,
      options = _this.data.options;

    if (_this.data.disabled) {
      return false;
    }

    if (_this.data.hasError) {
      App.showError(_this.data.error);
      return false;
    }

    // 订单创建成功后回调--微信支付
    let callback = function(result) {
      if (result.code === -10) {
        App.showError(result.msg, function() {
          // 跳转到未付款订单
          wx.redirectTo({
            url: '../order/index',
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
          wx.redirectTo({
            url: '../order/detail?order_id=' + result.data.order_id,
          });
        },
        fail: function() {
          App.showError('订单未支付', function() {
            // 跳转到未付款订单
            wx.redirectTo({
              url: '../order/index',
            });
          });
        },
      });
    };

    // 按钮禁用, 防止二次提交
    _this.data.disabled = true;

    // 显示loading
    wx.showLoading({
      title: '正在处理...'
    });

    // 创建订单-立即购买
    if (options.order_type === 'buyNow') {
      App._post_form('order/buyNow', {
        goods_id: options.goods_id,
        goods_num: options.goods_num,
        goods_sku_id: options.goods_sku_id,
        delivery: _this.data.currentDelivery,
        //shop_id: _this.data.selectedShopId,
        shop_id:options.shop_id,
        coupon_id: _this.data.selectCoupon.couponId,
        remark: _this.data.remark
      }, function(result) {
        // success
        console.log('success');
        callback(result);
      }, function(result) {
        // fail
        console.log('fail');
      }, function() {
        // complete
        console.log('complete');
        wx.hideLoading();
        // 解除按钮禁用
        _this.data.disabled = false;
      });
    }

    // 创建订单-购物车结算
    else if (options.order_type === 'cart') {
      App._post_form('order/cart', {
        cart_ids: options.cart_ids,
        delivery: _this.data.currentDelivery,
        shop_id: _this.data.selectedShopId,
        coupon_id: _this.data.selectCoupon.couponId,
        remark: _this.data.remark
      }, function(result) {
        // success
        console.log('success');
        callback(result);
      }, function(result) {
        // fail
        console.log('fail');
      }, function() {
        // complete
        console.log('complete');
        wx.hideLoading();
        // 解除按钮禁用
        _this.data.disabled = false;
      });
    }

  },

  /**
   * 买家留言
   */
  bindRemark: function(e) {
    this.setData({
      remark: e.detail.value
    })
  },

  /**
   * 选择优惠券(弹出/隐藏)
   */
  togglePopupCoupon() {
    let _this = this;
    if (_this.data.coupon_list.length > 0) {
      _this.setData({
        showBottomPopup: !_this.data.showBottomPopup
      });
    }
  },

  /**
   * 选择优惠券
   */
  selectCouponTap: function(e) {
    let _this = this,
      dataset = e.currentTarget.dataset;
    // 优惠券折扣金额
    let reducedPrice = _this.data.coupon_list[dataset.index].reduced_price;
    dataset.reduced_price = reducedPrice;
    // 计算优惠后的价格
    let actualPayPrice = _this.bcsub(_this.data.order_pay_price, reducedPrice);
    _this.setData({
      selectCoupon: dataset,
      actual_pay_price: actualPayPrice > 0 ? actualPayPrice : '0.01'
    });
    _this.togglePopupCoupon();
  },

  /**
   * 不使用优惠券
   */
  doNotCouponTap: function() {
    this.setData({
      selectCoupon: {},
      actual_pay_price: this.data.order_pay_price
    });
    this.togglePopupCoupon();
  },

  /**
   * 数学运算相减
   */
  bcsub: function(arg1, arg2) {
    return (Number(arg1) - Number(arg2)).toFixed(2);
  },


});