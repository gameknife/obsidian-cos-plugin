import { App, Notice, PluginSettingTab, Setting } from "obsidian";
// eslint-disable-next-line import/no-cycle
import { IMGUR_ACCESS_TOKEN_LOCALSTORAGE_KEY } from "src/imgur/constants";
// eslint-disable-next-line import/no-cycle
import ObsidianCosPlugin from "../ImgurPlugin";
import UploadStrategy from "../UploadStrategy";
import ImgurAuthModal from "./ImgurAuthModal";

const COS_SECRET_URL = "https://console.cloud.tencent.com/capi";

export default class ImgurPluginSettingsTab extends PluginSettingTab {
  plugin: ObsidianCosPlugin;

  authModal?: ImgurAuthModal;

  strategyDiv?: HTMLDivElement;

  constructor(app: App, plugin: ObsidianCosPlugin) {
    super(app, plugin);
    this.plugin = plugin;

    this.plugin.registerObsidianProtocolHandler("imgur-oauth", (params) => {
      if (!this.authModal || !this.authModal.isOpen) return;

      if (params.error) {
        // eslint-disable-next-line no-new
        new Notice(`Authentication failed with error: ${params.error}`);
        return;
      }

      const mappedData = params.hash.split("&").map((p) => {
        const sp = p.split("=");
        return [sp[0], sp[1]] as [string, string];
      });
      const map = new Map<string, string>(mappedData);
      localStorage.setItem(
        IMGUR_ACCESS_TOKEN_LOCALSTORAGE_KEY,
        map.get("access_token")
      );

      this.plugin.setupImagesUploader();

      this.authModal.close();
      this.authModal = null;
    });
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h2", { text: "Obsidian COS Plugin settings" });

    const uploadApproachDiv = containerEl.createDiv();
    this.strategyDiv = containerEl.createDiv();

    new Setting(uploadApproachDiv)
      .setName("Images upload approach")
      .addDropdown((dropdown) => {
        UploadStrategy.values.forEach((s) => {
          dropdown.addOption(s.id, s.description);
        });
        dropdown.setValue(this.plugin.settings.uploadStrategy);
        dropdown.onChange((v) => {
          this.plugin.settings.uploadStrategy = v;
          this.plugin.setupImagesUploader();
          this.drawSettings(this.strategyDiv);
        });
      });

    this.drawSettings(this.strategyDiv);

    new Setting(containerEl).setName("Confirm before upload").addToggle((t) => {
      t.setValue(this.plugin.settings.showRemoteUploadConfirmation);
      t.onChange((newValue) => {
        this.plugin.settings.showRemoteUploadConfirmation = newValue;
      });
    });

    new Setting(containerEl).setName("Rename by timestamp").addToggle((t) => {
      t.setValue(this.plugin.settings.renameByTimestamp);
      t.onChange((newValue) => {
        this.plugin.settings.renameByTimestamp = newValue;
      });
    });
  }

  async hide(): Promise<any> {
    await this.plugin.saveSettings();
    this.plugin.setupImagesUploader();
  }

  private drawSettings(parentEl: HTMLElement) {
    parentEl.empty();
    switch (this.plugin.settings.uploadStrategy) {
      case UploadStrategy.TENCENT_COS.id:
        this.drawAnonymousClientIdSetting(parentEl);
        break;
      default:
        throw new Error(
          "There must be a bug, this code is not expected to be reached"
        );
    }
  }

  private drawAnonymousClientIdSetting(containerEl: HTMLElement) {
    // new Setting(containerEl)
    //   .setName("Client ID")
    //   .setTooltip(
    //     `Client ID is required for anonymous images upload. If you do not provide your own Client ID, the one shipped with the plugin and shared with many other users will be used. If you face issues with images upload, it's better generate your own Client ID"`
    //   )
    //   .setDesc(ImgurPluginSettingsTab.clientIdSettingDescription())
    //   .addText((text) =>
    //     text
    //       .setPlaceholder("Enter your client_id")
    //       .setValue(this.plugin.settings.clientId)
    //       .onChange((value) => {
    //         this.plugin.settings.clientId = value;
    //       })
    //   );
    new Setting(containerEl).setName("Secret Id").addText((text) =>
      text
        .setPlaceholder("Enter your secret_id")
        .setValue(this.plugin.settings.SecretId)
        .onChange((value) => {
          this.plugin.settings.SecretId = value;
        })
    );
    new Setting(containerEl).setName("Secret Key").addText((text) =>
      text
        .setPlaceholder("Enter your secret_key")
        .setValue(this.plugin.settings.SecretKey)
        .onChange((value) => {
          this.plugin.settings.SecretKey = value;
        })
    );
    new Setting(containerEl).setName("Bucket").addText((text) =>
      text
        .setPlaceholder("Enter your bucket name")
        .setValue(this.plugin.settings.Bucket)
        .onChange((value) => {
          this.plugin.settings.Bucket = value;
        })
    );
    new Setting(containerEl).setName("Region").addText((text) =>
      text
        .setPlaceholder("Enter your region name")
        .setValue(this.plugin.settings.Region)
        .onChange((value) => {
          this.plugin.settings.Region = value;
        })
    );
  }

  private static clientIdSettingDescription() {
    const fragment = document.createDocumentFragment();
    const a = document.createElement("a");
    a.textContent = COS_SECRET_URL;
    a.setAttribute("href", COS_SECRET_URL);
    fragment.append("Generate your own Client ID at ");
    fragment.append(a);
    return fragment;
  }
}
