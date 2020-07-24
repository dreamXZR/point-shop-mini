const App = getApp();
const Toptips = require('../../../components/toptips/toptips');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedId: -1,
    shop_id: -1,
    isAuthor: true,

    shopList: [] // 门店列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let _this = this;
    // 记录已选中的id
    _this.setData({
      selectedId: options.selected_id,
      shop_id : options.shop_id,
      order_type:options.order_type
    });
    // 获取默认门店列表
    _this.getShopList(options.shop_id);
    // 获取用户坐标
    _this.getLocation((res) => {
      _this.getShopList(res.longitude, res.latitude);
    });
  },

  /**
   * 获取门店列表
   */
  getShopList(shop_id,longitude, latitude) {
    let _this = this;
    if(_this.data.order_type != 'exchangeNow'){
        App._get('shop/lists', {
          longitude: longitude || '',
          latitude: latitude || '',
          shop_id:_this.data.shop_id,
        }, (result) => {
          _this.setData({
            shopList: result.data.list
          });
        });
    }else{
        App._get('point_goods/addressList', {
          longitude: longitude || '',
          latitude: latitude || '',
          shop_id:_this.data.shop_id,
        }, (result) => {
          _this.setData({
            shopList: result.data.list
          });
        });
    }
    
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
  onSelectedShop(e) {
    let _this = this,
      selectedId = e.currentTarget.dataset.id;
    // 设置选中的id
    _this.setData({
      selectedId
    });
    // 设置上级页面的门店id
    let pages = getCurrentPages();
    if (pages.length < 2) {
      return false;
    }
    let prevPage = pages[pages.length - 2];
    prevPage.setData({
      selectedShopId: selectedId
    });
    // 返回上级页面
    wx.navigateBack({
      delta: 1
    });
  },

})