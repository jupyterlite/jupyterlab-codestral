import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICompletionProviderManager } from '@jupyterlab/completer';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { CodestralProvider } from './provider';

import { buildChatSidebar, buildErrorWidget } from '@jupyter/chat';
import { ReactWidget, IThemeManager } from '@jupyterlab/apputils';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import MistralClient from '@mistralai/mistralai';

import { CodestralHandler } from './handler';

const mistralClient = new MistralClient();

const inlineProviderPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-codestral:inline-provider',
  autoStart: true,
  requires: [ICompletionProviderManager, ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    manager: ICompletionProviderManager,
    settingRegistry: ISettingRegistry
  ): void => {
    const provider = new CodestralProvider({ mistralClient });
    manager.registerInlineProvider(provider);

    settingRegistry
      .load(inlineProviderPlugin.id)
      .then(settings => {
        const updateKey = () => {
          const apiKey = settings.get('apiKey').composite as string;
          mistralClient.apiKey = apiKey;
        };

        settings.changed.connect(() => updateKey());
        updateKey();
      })
      .catch(reason => {
        console.error(
          `Failed to load settings for ${inlineProviderPlugin.id}`,
          reason
        );
      });
  }
};

const chatPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-codestral:chat',
  description: 'Codestral chat extension',
  autoStart: true,
  optional: [ISettingRegistry, IThemeManager],
  requires: [IRenderMimeRegistry],
  activate: async (
    app: JupyterFrontEnd,
    rmRegistry: IRenderMimeRegistry,
    settingsRegistry: ISettingRegistry | null,
    themeManager: IThemeManager | null
  ) => {
    const chatHandler = new CodestralHandler({ mistralClient });

    let sendWithShiftEnter = false;

    function loadSetting(setting: ISettingRegistry.ISettings): void {
      sendWithShiftEnter = setting.get('sendWithShiftEnter')
        .composite as boolean;
      chatHandler.config = { sendWithShiftEnter };
    }

    Promise.all([app.restored, settingsRegistry?.load(chatPlugin.id)])
      .then(([, settings]) => {
        if (!settings) {
          console.warn(
            'The SettingsRegistry is not loaded for the chat extension'
          );
          return;
        }
        loadSetting(settings);
        settings.changed.connect(loadSetting);
      })
      .catch(reason => {
        console.error(
          `Something went wrong when reading the settings.\n${reason}`
        );
      });

    let chatWidget: ReactWidget | null = null;
    try {
      chatWidget = buildChatSidebar(chatHandler, themeManager, rmRegistry);
      chatWidget.title.caption = 'Codestral Chat';
    } catch (e) {
      chatWidget = buildErrorWidget(themeManager);
    }

    app.shell.add(chatWidget as ReactWidget, 'left', { rank: 2000 });

    console.log('Chat extension initialized');
  }
};

export default [inlineProviderPlugin, chatPlugin];
