const App = getApp();

Page({

  data: {
    // 页面参数
    options: {},
    // 页面元素
    items: {},
    scrollTop: 0,
    select_shop_id:0,
    select_shop_name:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 当前页面参数
    this.setData({
      options
    });
    // 加载页面数据
    this.getPageData();
  },
  onShow:function(){
     //当前选择店铺
     var select_shop_id = wx.getStorageSync('select_shop_id') 
     if(!select_shop_id){
      select_shop_id = 0
     }
     var select_shop_name = wx.getStorageSync('select_shop_name')
     if(!select_shop_name){
      select_shop_name = ''
     }
     //判断用户是否选择店铺 
     if(select_shop_id == 0){
      this.getLocation((res) => {
        this.getShortOne(res.longitude, res.latitude);
      });
     }else{
        this.setShopInfo(select_shop_id,select_shop_name)
     }
      
     
  },
  /**
   * 加载页面数据
   */
  getPageData: function(callback) {
    wx.showLoading({
      title: '加载中',
    })
    let _this = this;
    App._get('page/index', {
      page_id: _this.data.options.page_id,
      select_shop_id:_this.data.select_shop_id
    }, function(result) {
      // 设置顶部导航栏栏
      _this.setPageBar(result.data.page);
      _this.setData(result.data);
      // 回调函数
      typeof callback === 'function' && callback();
      //取消加载
      wx.hideLoading();
    });
  },

  /**
   * 设置顶部导航栏
   */
  setPageBar: function(page) {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: page.params.title
    });
    // 设置navbar标题、颜色
    wx.setNavigationBarColor({
      frontColor: page.style.titleTextColor === 'white' ? '#ffffff' : '#000000',
      backgroundColor: page.style.titleBackgroundColor
    })
  },

  /**
   * 分享当前页面
   */
  onShareAppMessage() {
    let _this = this;
    return {
      title: _this.data.page.params.share_title,
      path: "/pages/index/index?" + App.getShareUrlParams()
    };
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    // 获取首页数据
    this.getPageData(function() {
      wx.stopPullDownRefresh();
    });
  },

  // /**
  //  * 返回顶部
  //  */
  // goTop: function(t) {
  //   this.setData({
  //     scrollTop: 0
  //   });
  // },

  // scroll: function(t) {
  //   this.setData({
  //     indexSearch: t.detail.scrollTop
  //   }), t.detail.scrollTop > 300 ? this.setData({
  //     floorstatus: !0
  //   }) : this.setData({
  //     floorstatus: !1
  //   });
  // },
  /**
   * 获取用户坐标
   */
  getLocation(callback) {
    let _this = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        // console.log(res);
        callback && callback(res);
      },
      fail() {
        wx.navigateTo({
          url: '/pages/location/location',
        })
      },
    })
  },

  getShortOne(longitude, latitude) {
    let _this = this;
    App._get('shop/getShortOne', {
      longitude: longitude || '',
      latitude: latitude || '',
    }, (result) => {
      _this.setShopInfo(result.data.list.shop_id,result.data.list.shop_name)
    });
 },

 setShopInfo(select_shop_id,select_shop_name){
    wx.setStorageSync('select_shop_id', select_shop_id)
    wx.setStorageSync('select_shop_name', select_shop_name)
    this.setData({
      select_shop_id:select_shop_id,
      select_shop_name:select_shop_name
    },function(){
      this.getPageData();
    })
 },
 chooseShop(){
    wx.navigateTo({
      url: '/pages/shoplist/shoplist',
    })
 },



});