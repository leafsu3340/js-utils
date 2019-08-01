define([], function () {
  return {
    /**
     * 开启loading效果
     * @method block
     * @param {object} option 参数集合
     * @param {$} option.$container loading的容器,如果不设置,默认容器为body
     * @param {Number} option.opacity loading遮罩层的透明度
     */
    block: function (option) {
      if ($('.loader-inner').length > 0) {
        return;
      }
      option = option || {};
      var $container = option.$container || $(document.body);
      var backgroundColor = option.backgroundColor || 'transparent'
      $container.block({
        message: "<div class='loader-inner ball-pulse'><div></div><div></div><div></div></div>",
        baseZ: 2000,
        css: {
          border: '0',
          padding: '0',
          backgroundColor: 'transparent',
          width: '70px',
          height: '70px'
        },
        overlayCSS: {
          backgroundColor: backgroundColor,
          opacity: option.opacity || 0.9
        }
      });
    },
    /**
     * 关闭loading效果
     * @method block
     * @param {object} option 参数集合
     * @param {$} option.$container loading的容器,如果不设置,默认容器为body
     */
    unblock: function (option) {
      option = option || {};
      var $container = option.$container || $(document.body);
      $container.unblock();
    }
  }
});