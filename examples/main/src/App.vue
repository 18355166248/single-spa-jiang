<template>
  <div class="mainapp">
    <!-- 标题栏 -->
    <header class="mainapp-header">
      <h1>single-spa-jiang</h1>
      <button @click="setGlobalState">给全局状态设置一个属性</button>
      <button @click="emit">发送一个全局事件</button>
    </header>
    <div class="mainapp-main">
      <!-- 侧边栏 -->
      <ul class="mainapp-sidemenu">
        <li @click="push('/vue2')">Vue2</li>
        <li @click="push('/react18')">React18</li>
        <li @click="push('/multiple')">multiple</li>
      </ul>
      <!-- 子应用  -->
      <main class="subapp-container">
        <div id="micro-app"></div>
        <div id="multiple-app"></div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      path: '',
    };
  },
  methods: {
    push(path) {
      this.path = path;
      history.pushState(null, path, path);
    },

    setGlobalState() {
      window.spaJiangGloabalState.set(
        'msg',
        '父应用在 spa 全局状态上新增了一个 msg 属性',
      );
    },

    emit() {
      window.spaJiangGloabalState.emit(
        'testEvent',
        '父应用发送了一个全局事件: testEvent',
      );
    },
  },
};
</script>

<style>
body {
  margin: 0;
}

.mainapp {
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC,
    Hiragino Sans GB, Microsoft YaHei, Helvetica Neue, Helvetica, Arial,
    sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
  line-height: 1;
}

.mainapp-header {
  display: flex;
  align-items: center;
}

.mainapp-header h1 {
  color: #333;
  font-size: 36px;
  font-weight: 700;
  margin: 0;
  padding: 36px;
}

.mainapp-main {
  display: flex;
}

.mainapp-sidemenu {
  width: 130px;
  list-style: none;
  margin: 0;
  margin-left: 40px;
  padding: 0;
  border-right: 2px solid #aaa;
}

.mainapp-sidemenu li {
  color: #aaa;
  margin: 20px 0;
  font-size: 18px;
  font-weight: 400;
  cursor: pointer;
}

.mainapp-sidemenu li:hover {
  color: #444;
}

.mainapp-sidemenu li:first-child {
  margin-top: 5px;
}
/* 子应用区域 */
.subapp-container {
  flex-grow: 1;
  position: relative;
  margin: 0 40px;
}

.subapp-loading {
  color: #444;
  font-size: 28px;
  font-weight: 600;
  text-align: center;
}
</style>
