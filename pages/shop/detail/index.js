const App = getApp();

Page({


  /**
   * 页面的初始数据
   */
  data: {
    scrollHeight: null,
    // 优惠时间
    countdown:'2020-07-06 22:53:00',
    // 门店详情
    detail: {},
    dataType: 'goods', // 列表类型
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

    // 设置商品列表高度
    _this.setListHeight();

    // 记录option
    _this.setData({
      option
    }, function() {
      // 获取商品列表
      _this.getGoodsList();
      // 获取门店详情
    _this.getShopDetail(option.shop_id);
    });
    // _this.setData({
    //   option
    // }, function() {
    //   // 获取商品列表
    //   _this.getGoodsList();
    //    // 获取门店详情
    // _this.getShopDetail(option.shop_id);
    // });
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
   * 设置商品列表高度
   */
  setListHeight: function() {
    let _this = this;
    wx.getSystemInfo({
      success: function(res) {
        _this.setData({
          scrollHeight: res.windowHeight - 90,
        });
      }
    });
  },

  /**
   * 切换标签
   */
  bindHeaderTap: function(e) {
    let _this = this;
    _this.setData({
      dataType: e.currentTarget.dataset.type,
      list: {},
      isLoading: true,
      page: 1,
      no_more: false,
    });
    // console.log(_this.data.dataType)
    // 获取列表
    if(e.currentTarget.dataset.type == 'goods'){
      _this.getGoodsList();
    }else{
      _this.getSeckillGoodsList();
    }
   
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
    this.getGoodsList(true, ++this.data.page);
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
      status: this.data.dataType,
      sortType: this.data.sortType,
      sortPrice: this.data.sortPrice ? 1 : 0,
      category_id: this.data.option.category_id || 0,
      search: this.data.option.search || '',
      shop_id:_this.data.option.shop_id
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
   * 获取优惠商品列表
   * @param {bool} isPage 是否分页
   * @param {number} page 指定的页码
   */
  getSeckillGoodsList: function(isPage, page) {
    let _this = this;

    App._get('seckill.goods/lists', {
      page: page || 1,
      status: 'on-going',
      search: this.data.option.search || '',
      shop_id:_this.data.option.shop_id
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

})