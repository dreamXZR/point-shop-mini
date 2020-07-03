const App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {},

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 获取推广二维码
    this.getPoster();
    // 获取分销商中心数据
    this.getDealerCenter();
  },
  /**
   * 获取分销商中心数据
   */
  getDealerCenter: function() {
    let _this = this;
    App._get('shop.settled/center', {}, function(result) {
      let data = result.data;
      data.isData = true;
      // 设置当前页面标题
      _this.setData(data);
    });
  },

  /**
   * 获取推广二维码
   */
  getPoster: function() {
    let _this = this;
    wx.showLoading({
      title: '加载中',
    });
    App._get('user.dealer.qrcode/poster', {}, function(result) {
      _this.setData(result.data);
    }, null, function() {
      wx.hideLoading();
    });
  },

  previewImage: function() {
    wx.previewImage({
      current: this.data.qrcode,
      urls: [this.data.qrcode]
    })
  },

})