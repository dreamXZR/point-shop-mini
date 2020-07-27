const App = getApp();
Page({

  navigateToShopList:function () {
    wx.navigateTo({
      url: '/pages/shoplist/shoplist',
    })
  },
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
})