import browser from 'webextension-polyfill';
import { improvePrompt, getLimits } from '../services/api';
import { getInstallationId, saveToLibrary } from '../services/storage';
import type { BgMessage, BgResponse, AppError } from '../types';

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    // @ts-expect-error -- chrome.sidePanel not in types
    if (chrome.sidePanel) {
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
    }
  });

  browser.runtime.onMessage.addListener(
    async (msg: BgMessage): Promise<BgResponse> => {
      const installationId = await getInstallationId();
      try {
        if (msg.type === 'IMPROVE') {
          const data = await improvePrompt(msg.payload.text, installationId);
          return { success: true, data };
        }
        if (msg.type === 'GET_LIMITS') {
          const data = await getLimits(installationId);
          return { success: true, data };
        }
        if (msg.type === 'SAVE_PROMPT') {
          const item = await saveToLibrary(msg.payload.original, msg.payload.improved);
          return { success: true, data: item };
        }
        return { success: false, error: { type: 'unknown', message: 'Unknown message type' } };
      } catch (error) {
        return { success: false, error: error as AppError };
      }
    }
  );
});
