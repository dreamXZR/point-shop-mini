const App = getApp();
const Toptips = require('../../components/toptips/toptips');

Page({
   /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  properties: {
    itemIndex: String,
    itemStyle: Object,
    dataList: Object,
    params: Object
  },
  /**
   * 页面的初始数据
   */
  data: {

    // 分类列表
    categoryList: [],
    // 当前的分类id (0则代表首页)
    category_id: 0,
    isAuthor: true,

    shopList: [],// 门店列表


    // banner轮播组件属性
    indicatorDots: true, // 是否显示面板指示点	
    autoplay: true, // 是否自动切换
    duration: 800, // 滑动动画时长

    imgHeights: [], // 图片的高度
    imgCurrent: 0, // 当前banne所在滑块指针

    imgList: [],

  },

  methods: {
    
    /**
     * 计算图片高度
     */
    _imagesHeight: function(e) {
      // 获取图片真实宽度
      let imgwidth = e.detail.width,
        imgheight = e.detail.height,
        // 宽高比
        ratio = imgwidth / imgheight;
      // 计算的高度值
      let viewHeight = 750 / ratio,
        imgHeights = this.data.imgHeights;
      // 把每一张图片的高度记录到数组里
      imgHeights.push(viewHeight);
      this.setData({
        imgHeights,
      });
    },

    /**
     * 记录当前指针
     */
    _bindChange: function(e) {
      this.setData({
        imgCurrent: e.detail.current
      });
    },

    /**
     * 跳转到指定页面
     */
    navigationTo: function(e) {
      App.navigationTo(e.currentTarget.dataset.url);
    },

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let _this = this;
    // 记录已选中的id
    _this.setData({
      selectedId: options.selected_id
    });
    // 获取店铺轮播
    _this.getimgList();

    //获取店铺分类
    this.getShopClassify();
    // 获取用户坐标
    _this.getLocation((res) => {
      _this.getShopList(res.longitude, res.latitude);
    });
  },
  /**
   * Api：获取店铺分类
   */
  getShopClassify(){
    let _this = this;
    // 获取文章首页
    App._get('shopClassify/index', {}, function(result) {
      // console.log(result.data)
      _this.setData({
        categoryList: result.data.list
      });
      console.log(categoryList)
    });
  },
  /**
   * Api：切换导航栏
   */
  onSwitchTab: function(e) {
    let _this = this;
    // 第一步：切换当前的分类id
    _this.setData({
      category_id: e.currentTarget.dataset.id,
      articleList: {},
      page: 1,
      no_more: false,
      isLoading: true,
    });
    // 第二步：更新当前的店铺列表
    _this.getLocation((res) => {
      _this.getShopList(res.longitude, res.latitude);
    });
  },
  /**
   * 获取门店列表
   */
  getShopList(longitude, latitude) {
    let _this = this;
    App._get('shop/lists', {
      longitude: longitude || '',
      latitude: latitude || '',
      shop_classify_id : _this.data.category_id,
    }, (result) => {
      _this.setData({
        shopList: result.data.list,
      });
      // console.log(result.data.list)

    });


  },
  

  /**
   * 获取店铺轮播
   */
  getimgList() {
    let _this = this;
    wx:wx.request({
      url: 'url',
    })
    App._get('banner/index', {
      banner_type: 2,
    }, (result) => {
      _this.setData({
        imgList: result.data,

      });
      // console.log(result.data)
      
    });

  },

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
        Toptips({
          duration: 3000,
          content: '获取定位失败，请点击右下角按钮打开定位权限'
        });
        _this.setData({
          isAuthor: false
        });
      },
    })
  },

  /**
   * 授权启用定位权限
   */
  onAuthorize() {
    let _this = this;
    wx.openSetting({
      success(res) {
        if (res.authSetting["scope.userLocation"]) {
          console.log('授权成功');
          _this.setData({
            isAuthor: true
          });
          setTimeout(() => {
            // 获取用户坐标
            _this.getLocation((res) => {
              console.log('获取用户坐标');
              _this.getShopList(res.longitude, res.latitude);
            });
          }, 1000);
        }
      }
    })
  },

  /**
   * 选择门店
   */
  _onTargetDetail(e) {
    wx.navigateTo({
      url: '/pages/shop/detail/index?shop_id=' + e.detail.target.dataset.id,
    });
  },

})