import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  outDir: '.output',
  extensionApi: 'webextension-polyfill',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'PromptTune',
    description: 'AI-powered prompt improvement tool',
    version: '0.1.0',
    permissions: ['storage', 'clipboardWrite', 'sidePanel'],
    host_permissions: ['http://localhost:8000/*'],
    action: {
      default_popup: 'popup.html',
      default_title: 'PromptTune',
    },
    side_panel: {
      default_path: 'sidepanel.html',
    },
  },
});
