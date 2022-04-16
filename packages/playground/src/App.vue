<script setup lang="ts">
import Editor from './components/Editor.vue'

const test = () => {}
</script>

<template>
  <div class="App">
    <h1>Lexical Vue Demo</h1>
    <p>Note: this is an experimental build of Lexical</p>
    <Editor @test="test" />
    <div className="other">
      <h2>View source</h2>
      <ul>
        <li>
          <a
            href="https://github.com/wobsoriano/lexical-vue/tree/master/examples/demo"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
