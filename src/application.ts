import "materialize-css/sass/materialize.scss";
import { Application } from "../../globular-mvc/Application";
import { ApplicationView } from "../../globular-mvc/ApplicationView";
import { Model } from "../../globular-mvc/Model";
import { Account } from "../../globular-mvc/Account";
import { SettingsMenu, SettingsPanel } from "../../globular-mvc/components/Settings"
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
