const App = getApp();

// 枚举类：发货方式
const DeliveryTypeEnum = require('../../../utils/enum/DeliveryType.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataType: 'all', // 列表类型
    list: [], // 订单列表
    scrollHeight: null, // 列表容器高度

    deliverys: DeliveryTypeEnum, // 配送方式

    no_more: false, // 没有更多数据
    isLoading: true, // 是否正在加载中

    page: 1, // 当前页码

    showQRCodePopup: false, // 核销码弹窗显示隐藏
    QRCodeImage: '', // 核销码图片
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let _this = this;
    _this.setListHeight();
    this.data.dataType = options.type || 'all';
    this.setData({
      dataType: this.data.dataType
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 获取订单列表
    this.getOrderList(this.data.dataType);
  },

  /**
   * 获取订单列表
   */
  getOrderList: function(isPage, page) {
    let _this = this;
    App._get('sharing.order/lists', {
      page: page || 1,
      dataType: _this.data.dataType
    }, function(result) {
      let resList = result.data.list,
        dataList = _this.data.list;
      if (isPage == true) {
        _this.setData({
          'list.data': dataList.data.concat(resList.data),
          isLoading: false,
        });
      } else {
        _this.setData({
          list: resList,
          isLoading: false,
        });
      }
    });
  },

  /**
   * 切换标签
   */
  bindHeaderTap: function(e) {
    this.setData({
      dataType: e.currentTarget.dataset.type,
      list: {},
      isLoading: true,
      page: 1,
      no_more: false,
    });
    // 获取订单列表
    this.getOrderList(e.currentTarget.dataset.type);
  },

  /**
   * 取消订单
   */
  cancelOrder: function(e) {
    let _this = this;
    let order_id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "友情提示",
      content: "确认要取消该订单吗？",
      success: function(o) {
        if (o.confirm) {
          App._post_form('sharing.order/cancel', {
            order_id
          }, function(result) {
            _this.getOrderList(_this.data.dataType);
          });
        }
      }
    });
  },

  /**
   * 确认收货
   */
  receipt: function(e) {
    let _this = this;
    let order_id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "提示",
      content: "确认收到商品？",
      success: function(o) {
        if (o.confirm) {
          App._post_form('sharing.order/receipt', {
            order_id
          }, function(result) {
            _this.getOrderList(_this.data.dataType);
          });
        }
      }
    });
  },

  /**
   * 发起付款
   */
  payOrder: function(e) {
    let _this = this;
    let order_id = e.currentTarget.dataset.id;

    // 显示loading
    wx.showLoading({
      title: '正在处理...',
    });
    App._post_form('sharing.order/pay', {
      order_id
    }, function(result) {
      if (result.code === -10) {
        App.showError(result.msg);
        return false;
      }
      // 发起微信支付
      wx.requestPayment({
        timeStamp: result.data.timeStamp,
        nonceStr: result.data.nonceStr,
        package: 'prepay_id=' + result.data.prepay_id,
        signType: 'MD5',
        paySign: result.data.paySign,
        success: function(res) {
          // 跳转到已付款订单
          wx.navigateTo({
            url: './detail/detail?order_id=' + order_id
          });
        },
        fail: function() {
          App.showError('订单未支付');
        },
      });
    }, null, function() {
      wx.hideLoading();
    });
  },

  /**
   * 订单评价
   */
  comment: function(e) {
    let _this = this;
    let order_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: './comment/comment?order_id=' + order_id,
    })
    console.log(order_id);
  },

  /**
   * 跳转订单详情页
   */
  navigateToDetail: function(e) {
    // 记录formId
    App.saveFormId(e.detail.formId);
    let order_id = e.detail.target.dataset.id;
    wx.navigateTo({
      url: './detail/detail?order_id=' + order_id
    });
  },

  /**
   * 跳转到拼团详情
   */
  navigateToSharingActive: function(e) {
    // 记录formId
    App.saveFormId(e.detail.formId);
    let active_id = e.detail.target.dataset.id;
    wx.navigateTo({
      url: '../active/index?active_id=' + active_id
    });
  },

  /**
   * 跳转到售后列表
   */
  onTargetRefund: function() {
    wx.navigateTo({
      url: './refund/index'
    });
  },

  onPullDownRefresh: function() {
    wx.stopPullDownRefresh();
  },

  /**
   * 下拉到底加载数据
   */
  bindDownLoad: function() {
    // 已经是最后一页
    if (this.data.page >= this.data.list.last_page) {
      this.setData({
        no_more: true
      });
      return false;
    }
    // 加载下一页列表
    this.getOrderList(true, ++this.data.page);
  },

  /**
   * 设置商品列表高度
   */
  setListHeight: function() {
    let systemInfo = wx.getSystemInfoSync(),
      rpx = systemInfo.windowWidth / 750, // 计算rpx
      tapHeight = Math.floor(rpx * 88), // tap高度
      scrollHeight = systemInfo.windowHeight - tapHeight; // swiper高度
    this.setData({
      scrollHeight
    });
  },

  /**
   * 查看核销二维码
   */
  onExtractQRCode(e) {
    let _this = this,
      order_id = e.currentTarget.dataset.id;
    // 调用后台api获取核销二维码
    wx.showLoading({
      title: '加载中',
    });
    App._get('sharing.order/extractQrcode', {
      order_id
    }, (result) => {
      // 设置二维码图片路径
      _this.setData({
        QRCodeImage: result.data.qrcode
      });
      // 显示核销二维码
      _this.onToggleQRCodePopup();
    }, null, () => {
      wx.hideLoading();
    });
  },

  /**
   * 核销码弹出层
   */
  onToggleQRCodePopup() {
    let _this = this;
    _this.setData({
      showQRCodePopup: !_this.data.showQRCodePopup
    });
  },

});