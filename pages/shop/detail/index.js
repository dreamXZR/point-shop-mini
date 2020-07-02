const App = getApp();

Page({


  /**
   * 页面的初始数据
   */
  data: {

    // 门店详情
    detail: {},

    list: {}, // 商品列表数据
    showView: true, // 列表显示方式
    arrange: "arrange", // 列表显示方式class

    sortType: 'all', // 排序类型
    sortPrice: false, // 价格从低到高

    option: {}, // 当前页面参数
    no_more: false, // 没有更多数据
    isLoading: true, // 是否正在加载中

    page: 1, // 当前页码
    
  },
  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(option) {
    let _this = this;
   
    _this.setData({
      option
    }, function() {
      // 获取商品列表
      _this.getGoodsList();
       // 获取门店详情
    _this.getShopDetail(option.shop_id);
    });
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

  /**
   * 分享当前页面
   */
  onShareAppMessage() {
    let _this = this;
    // 构建页面参数
    let params = App.getShareUrlParams({
      'shop_id': _this.data.detail.shop_id
    });
    return {
      title: _this.data.detail.article_title,
      path: "/pages/article/detail/index?" + params
    };
  },

  /**
   * 拨打电话
   */
  onMakePhoneCall() {
    let _this = this;
    wx.makePhoneCall({
      phoneNumber: _this.data.detail.phone
    });
  },

  /**
   * 查看位置
   */
  onOpenLocation() {
    let _this = this,
      detail = _this.data.detail;
    wx.openLocation({
      name: detail.shop_name,
      address: detail.region.province + detail.region.city + detail.region.region + detail.address,
      longitude: Number(detail.longitude),
      latitude: Number(detail.latitude),
      scale: 15
    });
  },

   /**
   * 获取商品列表
   * @param {bool} isPage 是否分页
   * @param {number} page 指定的页码
   */
  getGoodsList: function(isPage, page) {
    let _this = this;

    App._get('goods/lists', {
      page: page || 1,
      sortType: this.data.sortType,
      sortPrice: this.data.sortPrice ? 1 : 0,
      category_id: this.data.option.category_id || 0,
      search: this.data.option.search || '',
      shop_id:_this.data.option.shop_id
    }, function(result) {
      let resList = result.data.list,
        dataList = _this.data.list;
        console.log(result)
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

})