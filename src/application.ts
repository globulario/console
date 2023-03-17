import "materialize-css/sass/materialize.scss";
import { Application } from "../../globular-mvc/Application";
import { ApplicationView } from "../../globular-mvc/ApplicationView";
import { Model } from "../../globular-mvc/Model";
import { Account } from "../../globular-mvc/Account";
import { SettingsMenu, SettingsPanel } from "../../globular-mvc/components/Settings"
import { SaveConfigRequest } from "../../globular-mvc/node_modules/globular-web-client/admin/admin_pb"
import { BlogPostElement, BlogPosts } from "../../globular-mvc/components/BlogPost";
import { Terminal } from "../../globular-mvc/components/Terminal";
import { Console } from "../../globular-mvc/components/Console";
import { SystemMonitor } from "../../globular-mvc/components/SystemMonitor";

export class ConsoleApplicationView extends ApplicationView {

  constructor() {
    super();
  }

  onLogin(account: Account) {
    super.onLogin(account);
    
    // fire the window resize event to display the side menu.
    window.dispatchEvent(new Event('resize'));
    this.getWorkspace()
  }

  onLogout() {
    super.onLogout();
    this.getWorkspace().innerHTML = "";
  }
}

export class ConsoleApplication extends Application {
  constructor(view: ConsoleApplicationView) {
    super("console", "Globular Console", view);
  }
}
