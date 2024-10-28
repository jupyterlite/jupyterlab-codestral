import {
  ActiveCellManager,
  buildChatSidebar,
  buildErrorWidget,
  IActiveCellManager
} from '@jupyter/chat';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ReactWidget, IThemeManager } from '@jupyterlab/apputils';
import { ICompletionProviderManager } from '@jupyterlab/completer';
import { INotebookTracker } from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { ChatHandler } from './chat-handler';
import { ILlmProvider } from './token';
import { LlmProvider } from './provider';

// const inlineProviderPlugin: JupyterFrontEndPlugin<void> = {
//   id: 'jupyterlab-codestral:inline-provider',
//   autoStart: true,
//   requires: [ICompletionProviderManager, ILlmProvider, ISettingRegistry],
//   activate: (
//     app: JupyterFrontEnd,
//     manager: ICompletionProviderManager,
//     llmProvider: ILlmProvider
//   ): void => {
//     llmProvider.providerChange.connect(() => {
//       if (llmProvider.inlineCompleter !== null) {
//         manager.registerInlineProvider(llmProvider.inlineCompleter);
//       }
//     });
//   }
// };

const chatPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-codestral:chat',
  description: 'LLM chat extension',
  autoStart: true,
  optional: [INotebookTracker, ISettingRegistry, IThemeManager],
  requires: [ILlmProvider, IRenderMimeRegistry],
  activate: async (
    app: JupyterFrontEnd,
    llmProvider: ILlmProvider,
    rmRegistry: IRenderMimeRegistry,
    notebookTracker: INotebookTracker | null,
    settingsRegistry: ISettingRegistry | null,
    themeManager: IThemeManager | null
  ) => {
    let activeCellManager: IActiveCellManager | null = null;
    if (notebookTracker) {
      activeCellManager = new ActiveCellManager({
        tracker: notebookTracker,
        shell: app.shell
      });
    }

    const chatHandler = new ChatHandler({
      llmClient: llmProvider.chatModel,
      activeCellManager: activeCellManager
    });

    llmProvider.providerChange.connect(() => {
      chatHandler.llmClient = llmProvider.chatModel;
    });

    let sendWithShiftEnter = false;
    let enableCodeToolbar = true;

    function loadSetting(setting: ISettingRegistry.ISettings): void {
      sendWithShiftEnter = setting.get('sendWithShiftEnter')
        .composite as boolean;
      enableCodeToolbar = setting.get('enableCodeToolbar').composite as boolean;
      chatHandler.config = { sendWithShiftEnter, enableCodeToolbar };
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
      chatWidget = buildChatSidebar({
        model: chatHandler,
        themeManager,
        rmRegistry
      });
      chatWidget.title.caption = 'Codestral Chat';
    } catch (e) {
      chatWidget = buildErrorWidget(themeManager);
    }

    app.shell.add(chatWidget as ReactWidget, 'left', { rank: 2000 });

    console.log('Chat extension initialized');
  }
};

const llmProviderPlugin: JupyterFrontEndPlugin<ILlmProvider> = {
  id: 'jupyterlab-codestral:llm-provider',
  autoStart: true,
  requires: [ICompletionProviderManager, ISettingRegistry],
  provides: ILlmProvider,
  activate: (
    app: JupyterFrontEnd,
    manager: ICompletionProviderManager,
    settingRegistry: ISettingRegistry
  ): ILlmProvider => {
    const llmProvider = new LlmProvider({ completionProviderManager: manager });

    settingRegistry
      .load(llmProviderPlugin.id)
      .then(settings => {
        const updateProvider = () => {
          const provider = settings.get('provider').composite as string;
          llmProvider.setProvider(provider, settings.composite);
        };

        settings.changed.connect(() => updateProvider());
        updateProvider();
      })
      .catch(reason => {
        console.error(
          `Failed to load settings for ${llmProviderPlugin.id}`,
          reason
        );
      });

    return llmProvider;
  }
};

export default [chatPlugin, llmProviderPlugin];
