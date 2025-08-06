var posts=["2025/07/30/facebook软件采集教程/","2025/07/30/这是一篇新的博文/","2025/07/24/hello-world/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };