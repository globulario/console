import "materialize-css/sass/materialize.scss";
import { Application } from "../../globular-mvc/Application";
import { ApplicationView } from "../../globular-mvc/ApplicationView";
import { Model } from "../../globular-mvc/Model";
import { Account } from "../../globular-mvc/Account";
import { SettingsMenu, SettingsPanel } from "../../globular-mvc/components/Settings"
import { ServerGeneralSettings } from "./serverGeneralSettings";
import { ServicesSettings } from "./servicesSettings";
import { SaveConfigRequest } from "../../globular-mvc/node_modules/globular-web-client/admin/admin_pb"

export class ConsoleApplicationView extends ApplicationView {

  /** The settings Menu */
  protected consoleSettingsMenu: SettingsMenu;

  /** The settings Panel */
  protected consoleSettingsPanel: SettingsPanel;

  constructor() {
    super();
    this.consoleSettingsMenu = new SettingsMenu();
    this.consoleSettingsPanel = new SettingsPanel();
  }

  onLogin(account: Account) {
    super.onLogin(account);
    this.getWorkspace().innerHTML = "";


    this.getSideMenu().appendChild(this.consoleSettingsMenu)
    this.getWorkspace().appendChild(this.consoleSettingsPanel)

    // Now the save menu
    let saveMenuItem = this.consoleSettingsMenu.appendSettingsMenuItem("save", "Save");
    saveMenuItem.onclick = () => {
      saveMenuItem.style.display = "none"
      //ApplicationView.displayMessage("The server will now restart...", 3000)
      let saveRqst = new SaveConfigRequest
      saveRqst.setConfig(JSON.stringify(Model.globular.config))
      Model.globular.adminService.saveConfig(saveRqst, {
        token: localStorage.getItem("user_token"),
        application: Model.application,
        domain: Model.domain
      }).then(() => { })
        .catch(err => {
          ApplicationView.displayMessage(err, 3000)
        })
    }

    saveMenuItem.style.display = "none"
    // Configuration menu...
    let serverGeneralSettings = new ServerGeneralSettings(Model.globular.config, this.consoleSettingsMenu, this.consoleSettingsPanel, saveMenuItem);
    let servicesSettings = new ServicesSettings(this.consoleSettingsMenu, this.consoleSettingsPanel, saveMenuItem);

    this.consoleSettingsMenu.show()

    // fire the window resize event to display the side menu.
    window.dispatchEvent(new Event('resize'));
  }

  onLogout() {
    super.onLogout();
    this.getWorkspace().innerHTML = "";
    this.consoleSettingsMenu.clear(); // clear various stuff...
    this.consoleSettingsPanel.clear();
  }
}

export class ConsoleApplication extends Application {
  constructor(view: ConsoleApplicationView) {
    super("console", "Globular Console", view);
  }
}
