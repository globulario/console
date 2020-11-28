import "materialize-css/sass/materialize.scss";
import { Application } from "../../globular-mvc/Application";
import { ApplicationView } from "../../globular-mvc/ApplicationView";
import { Model } from "../../globular-mvc/Model";
import { Account } from "../../globular-mvc/Account";


import { Dashboard } from "./dashboard/dashboard";

export class ConsoleApplicationView extends ApplicationView {
  private welcomeContent: string;
  private dashboard: Dashboard;

  constructor() {
    super();
    this.welcomeContent = this.getWorkspace().innerHTML;
  }

  // init the view
  /*init() {
    super.init();
  }*/

  onLogin(account: Account) {
    super.onLogin(account);
    this.getWorkspace().innerHTML = "";
    this.dashboard = new Dashboard(this.getWorkspace());
    this.dashboard.init();
  }

  onLogout() {
    super.onLogout();
    this.getWorkspace().innerHTML = this.welcomeContent;
  }
}

export class ConsoleApplication extends Application {
  constructor(view: ConsoleApplicationView) {
    super("console", "Globular Console", view);
  }
}
