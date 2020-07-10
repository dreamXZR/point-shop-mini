const App = getApp();

var time= require("../../utils/util.js");

Page({
  properties: {
    itemIndex: String,
    itemStyle: Object,
    params: Object,
    dataList: Object
  },
  data: {

    // 倒计时
    countdown:'',    
    // endDate2: '2020-07-06 22:53:00',
    startData2: [],
    endDate2: [],


    dataType: 'on-going', // 列表类型


    scrollHeight: null,

    showView: false, // 列表显示方式
    showView1: true,
    arrange: "", // 列表显示方式class

    sortType: 'all', // 排序类型
    sortPrice: false, // 价格从低到高

    option: {}, // 当前页面参数
    list: {}, // 商品列表数据

    no_more: false, // 没有更多数据
    isLoading: true, // 是否正在加载中

    page: 1, // 当前页码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(option) {
    let _this = this;

    // 设置商品列表高度
    _this.setListHeight();

    // 记录option
    _this.setData({
      option
    }, function() {
      // 获取商品列表
      _this.getGoodsList();
    });


  },
  methods: {

    /**
     * 跳转商品详情页
     */
    _onTargetGoods(e) {
      // 记录formid
      App.saveFormId(e.detail.formId);
      wx.navigateTo({
        url: '/pages/sharing/goods/index?goods_id=' + e.detail.target.dataset.id,
      });
    },
  },

  /**
   * 获取商品列表
   * @param {bool} isPage 是否分页
   * @param {number} page 指定的页码
   */
  getGoodsList: function(isPage, page) {
    let _this = this;

    App._get('seckill.goods/lists', {
      page: page || 1,
      status: this.data.dataType,
      search: this.data.option.search || '',
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
    // 获取列表
    // this.getOrderList(e.currentTarget.dataset.type);

    _this.getGoodsList();
  },

  /**
   * 切换排序方式
   */
  switchSortType: function(e) {
    let _this = this,
      newSortType = e.currentTarget.dataset.type,
      
      newSortPrice = newSortType === 'price' ? !this.data.sortPrice : true;

    this.setData({
      list: {},
      isLoading: true,
      page: 1,
      sortType: newSortType,
      sortPrice: newSortPrice
    }, function() {
      // 获取商品列表
      _this.getGoodsList();
    });
    console.log(e.currentTarget.dataset.type)
  },

  /**
   * 切换列表显示方式
   */
  onChangeShowState: function() {
    let _this = this;
    _this.setData({
      showView: !_this.data.showView,
      showView1: !_this.data.showView1,
      arrange: _this.data.arrange ? "" : "arrange"
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
   * 设置分享内容
   */
  onShareAppMessage: function() {
    // 构建分享参数
    return {
      title: "全部分类",
      path: "/pages/category/index?" + App.getShareUrlParams()
    };
  },

  /**
   * 商品搜索
   */
  triggerSearch: function() {
    let pages = getCurrentPages();
    // 判断来源页面
    if (pages.length > 1 &&
      pages[pages.length - 2].route === 'pages/seckill/search/index') {
      wx.navigateBack();
      return;
    }
    // 跳转到商品搜索
    wx.navigateTo({
      url: './search/index',
    })
  },
  countTime() {
    var that = this;
    
    var date = new Date();
    // console.log(time.formatTime(date));
    // 当前时间的日期格式： 2019/02/22 15:24:23
    
    // var sjc = 1550714678;
    var sjc = that.data.endDate2;
    

    // console.log(time.formatTimeTwo(sjc,'M-D h:m:s'));
    // console.log(time.formatTimeTwo(sjc,'h:m')); // 03:03
    
    var date = new Date();
    var now = date.getTime();
    var start1= Math.floor(now / 1000);
    // var endDate = new Date(that.data.endDate2);//设置截止时间
    // var end = that.data.endDate2.getTime();
    // var end = new Date(that.data.endDate2);
    // var dd= 
    // console.log(end)
    
    var leftTime = that.data.endDate2 - start1; //时间差       
    var d, h, m, s, ms;
      
    if (leftTime >= 0) {
      // d = Math.floor(leftTime / 1000 / 60 / 60 / 24);
      // h = Math.floor(leftTime / 1000 / 60 / 60 % 24);
      h = Math.floor(leftTime / 60 / 60 );
      m = Math.floor(leftTime / 60 % 60);
      s = Math.floor(leftTime  % 60);

      // ms = Math.floor(leftTime % 1000);
      // ms = ms < 100 ? "0" + ms : ms
      s = s < 10 ? "0" + s : s;
      m = m < 10 ? "0" + m : m;
      h = h < 10 ? "0" + h : h;
      // for( var i = 0 ; i<that.data.list.data.length; i++){
      //   that.setData({
      //     // countdown: d + "：" + h + "：" + m + "：" + s + ":" + ms,
      //     countdown:  h + ":" + m  + ":" + s,
  
      //   })
      // }
      that.setData({
        // countdown: d + "：" + h + "：" + m + "：" + s + ":" + ms,
        // countdown:  h + ":" + m  + ":" + s,
        countdown : time.formatTimeTwo(sjc,'M-D h:m:s'),


      })
      
     //递归每秒调用countTime方法，显示动态时间效果
    setTimeout(that.countTime, 1000);
    } else {
      console.log('已截止')
      that.setData({
        countdown:'00:00:00'
      })
    }
    
   
  },

});