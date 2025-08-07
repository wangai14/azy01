(function() {
  'use strict';
  /**
   * 检测设备类型
   */
  function detectDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) || 
                     (window.screen.width >= 768 && window.screen.width <= 1024 && 'ontouchstart' in window);
    const isDesktop = !isMobile && !isTablet;
    
    return {
      isMobile,
      isTablet,
      isDesktop,
      deviceType: isMobile ? 'mobile' : (isTablet ? 'tablet' : 'desktop')
    };
  }

  // 删除了复杂的硬件检测和浏览器特性检测函数，因为现在只需要简单的设备类型判断

  /**
   * 检测用户偏好（简化版）
   */
  function detectUserPreferences() {
    const preferences = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      userChoice: localStorage.getItem('aurora-performance-mode')
    };

    return preferences;
  }

  /**
   * 简化的背景模式判断
   */
  function determineBackgroundMode() {
    const deviceType = detectDeviceType();
    const preferences = detectUserPreferences();

    // 用户手动选择优先级最高
    if (preferences.userChoice) {
      switch (preferences.userChoice) {
        case 'dynamic':
          return 'performance-high';
        case 'static':
          return 'performance-low';
      }
    }

    // 用户偏好减少动画
    if (preferences.reducedMotion) {
      return 'performance-low';
    }

    // 设备类型判断：PC默认动态，其他设备默认静态
    if (deviceType.isDesktop) {
      return 'performance-high'; // PC默认动态模式
    } else {
      return 'performance-low';  // 移动设备和平板默认静态模式
    }
  }

  // 删除了determinePerformanceLevel函数，现在直接在determineBackgroundMode中判断

  /**
   * 应用性能级别
   */
  function applyPerformanceLevel(level) {
    const body = document.body;
    
    // 移除所有性能类名
    body.classList.remove('performance-high', 'performance-low', 'reduce-motion');
    
    // 添加新的性能级别类名
    body.classList.add(level);
    
    // 设置背景模式属性
    if (level === 'performance-high') {
      body.setAttribute('data-background-mode', 'dynamic');
    } else {
      body.setAttribute('data-background-mode', 'static');
    }
    
    // 如果用户偏好减少动画，额外添加reduce-motion类
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      body.classList.add('reduce-motion');
    }

    // 保存到localStorage以便下次快速加载
    localStorage.setItem('aurora-performance-level', level);
    
    console.log(`极光背景性能级别: ${level}`);
  }

  // 删除了createPerformanceControl函数，不再需要独立的控制面板

  /**
   * 初始化性能优化器（简化版）
   */
  function initPerformanceOptimizer() {
    try {
      // 直接判断背景模式
      const level = determineBackgroundMode();
      applyPerformanceLevel(level);
    } catch (error) {
      console.warn('背景模式设置失败，使用静态模式:', error);
      applyPerformanceLevel('performance-low');
    }
  }

  /**
   * 监听用户偏好变化
   */
  function setupPerformanceMonitoring() {
    // 监听用户偏好变化
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addListener(function() {
      initPerformanceOptimizer();
    });
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initPerformanceOptimizer();
      setupPerformanceMonitoring();
      initBackgroundToggle();
    });
  } else {
    initPerformanceOptimizer();
    setupPerformanceMonitoring();
    initBackgroundToggle();
  }

  /**
   * 切换背景模式
   */
  function toggleBackgroundMode() {
    const currentMode = localStorage.getItem('aurora-performance-mode') || 'auto';
    let newMode;
    
    switch (currentMode) {
      case 'auto':
      case 'static':
        newMode = 'dynamic';
        break;
      case 'dynamic':
        newMode = 'static';
        break;
    }
    
    localStorage.setItem('aurora-performance-mode', newMode);
    
    let level;
    switch (newMode) {
      case 'dynamic':
        level = 'performance-high';
        break;
      case 'static':
        level = 'performance-low';
        break;
    }
    
    applyPerformanceLevel(level);
    
    // 显示切换提示
    const modeText = newMode === 'dynamic' ? '动态模式' : '静态模式';
    if (window.anzhiyu && window.anzhiyu.snackbarShow) {
      window.anzhiyu.snackbarShow(`背景已切换至${modeText}`);
    } else {
      console.log(`背景已切换至${modeText}`);
    }
  }
  
  /**
   * 初始化背景切换按钮
   */
  function initBackgroundToggle() {
    // 等待DOM加载完成
    const initButton = () => {
      const button = document.getElementById('switch-background');
      if (button) {
        // 移除之前的事件监听器（如果存在）
        button.removeEventListener('click', toggleBackgroundMode);
        // 添加新的事件监听器
        button.addEventListener('click', toggleBackgroundMode);
        
        // 根据当前模式更新按钮状态
        const updateButtonState = () => {
          const currentMode = localStorage.getItem('aurora-performance-mode') || 'auto';
          const body = document.body;
          
          if (body.classList.contains('performance-high') || currentMode === 'dynamic') {
            button.title = '切换到静态模式';
          } else {
            button.title = '切换到动态模式';
          }
        };
        
        updateButtonState();
        
        // 清除之前的观察器（如果存在）
        if (button._backgroundObserver) {
          button._backgroundObserver.disconnect();
        }
        
        // 监听性能级别变化
        const observer = new MutationObserver(updateButtonState);
        observer.observe(document.body, {
          attributes: true,
          attributeFilter: ['class']
        });
        
        // 将观察器保存到按钮元素上，以便后续清理
        button._backgroundObserver = observer;
        
        console.log('背景切换按钮已重新初始化');
      } else {
        // 如果按钮还没有加载，延迟重试，最多重试10次
        if (!initButton.retryCount) initButton.retryCount = 0;
        if (initButton.retryCount < 10) {
          initButton.retryCount++;
          setTimeout(initButton, 200);
        } else {
          console.warn('无法找到背景切换按钮 #switch-background');
        }
      }
    };
    
    initButton();
  }

  // 导出到全局作用域以便调试
  window.AuroraPerformanceOptimizer = {
    init: initPerformanceOptimizer,
    applyLevel: applyPerformanceLevel,
    toggleBackground: toggleBackgroundMode,
    initBackgroundToggle: initBackgroundToggle
  };

})();