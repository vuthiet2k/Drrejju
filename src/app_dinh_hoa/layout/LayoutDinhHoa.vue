<template>
  <div class="dh-app-root">
    <HeaderDinhHoa />
    <main class="dh-main-content">
      <router-view />
    </main>
    <FooterDinhHoa />
  </div>
</template>

<script setup>
import HeaderDinhHoa from "../components/HeaderDinhHoa.vue";
import FooterDinhHoa from "../components/FooterDinhHoa.vue";
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Asap+Condensed:wght@600;700;800&family=Asap:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Saira+Extra+Condensed:wght@700;800&display=swap');

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
  background-color: #140808;
  color: #fbf4e6;
  font-family: 'Asap', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.dh-app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #140808;
}

.dh-main-content {
  flex: 1 0 auto;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #140808;
}
::-webkit-scrollbar-thumb {
  background: #3b281b;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #d4af37;
}
</style>
