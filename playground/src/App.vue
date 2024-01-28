<script setup lang="ts">
import Editor from './components/Editor.vue'
</script>

<template>
  <div class="App">
    <header>
      <h1>Lexical Vue Demo</h1>
    </header>
    <div class="editor-shell">
      <Editor />
    </div>
    <!-- <div className="other">
      <h2>View source</h2>
      <ul>
        <li>
          <a
            href="https://github.com/wobsoriano/lexical-vue/tree/master/packages/playground"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </li>
      </ul>
    </div> -->
  </div>
</template>
