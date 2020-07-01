const App = getApp();
const Toptips = require('../../components/toptips/toptips');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bottom_val:20,
    inputVal: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let _this = this;

    _this.gettoubu();
    
  },
  methods:{
    
  },
  gettoubu() {
    wx.setNavigationBarTitle({
      title: '向商户付款' 
    });
  },
  inputFocus(e){
    var _this=this
    _this.setData({
      bottom_val: e.detail.height + 20
    })
  },
  inputBlur(){
    var _this=this
    _this.setData({
      bottom_val: 20
    })
  },
  inputVal(e){
    var _this=this
    // console.log(e.detail.value)
    _this.setData({
      inputVal: e.detail.value
    })
    // console.log(_this.inputVal)
  },
  pay(e){
    var _this=this

    console.log(e.detail.value)
  }
  
  

})