<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-3"></div>
      <div class="col-6 text-center">
        <span class="title">Sparkly</span>
      </div>
      <div class="col-3 text-end"></div>
    </div>
  </div>
</template>

<style scoped>
/* Убираем глобальный * selector — он перебивает переменные */
.title {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  font-weight: 600;
  color: var(--text-color); /* динамический цвет текста */
}

.container-fluid > .row > div {
  padding: 15px 30px;
}

.container-fluid {
  position: relative;
  z-index: 999;
  height: 61px;
  width: 100%;
  box-shadow: 0 2px 10px rgba(42, 110, 80, 0.2);
  background: var(--header-bg, #212529);   /* переменная фона */
  border-bottom: 1px solid var(--border-color, #343a40);
  transition: background-color 0.3s, border-color 0.3s;
}

/* Если нужно, чтобы текст ссылок и кнопок в хедере тоже менялся — используйте переменные */
.container-fluid a, 
.container-fluid button {
  color: var(--accent-color, #42b983);
}
</style>