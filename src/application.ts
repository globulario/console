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
    
    ////////////////////////////////////////////////////////////////////
    // TODO 
    ////////////////////////////////////////////////////////////////////
    if(account.id == "sa"){
      let term = new Terminal()
      this.getWorkspace().append(term)
      let console_ = new Console()
      this.getWorkspace().append(console_)
      let systemMonitor = new SystemMonitor
      this.getWorkspace().append(systemMonitor)

      console_.onexitfullscreen = ()=>{
        term.style.display = ""
        systemMonitor.style.display = ""
      }
      console_.onenterfullscreen = ()=>{
        term.style.display = "none"
        systemMonitor.style.display = "none"
      }
      term.onexitfullscreen = ()=>{
        console_.style.display = ""
        systemMonitor.style.display = ""
      }
      term.onenterfullscreen = ()=>{
        console_.style.display = "none"
        systemMonitor.style.display = "none"
      }
      systemMonitor.onexitfullscreen = ()=>{
        console_.style.display = ""
        term.style.display = ""
      }
      systemMonitor.onenterfullscreen = ()=>{
        console_.style.display = "none"
        term.style.display = "none"
      }
    }else{

      // The blog list...
      let blogs = new BlogPosts
      blogs.setAttribute("account",account.id)
      ApplicationView.wait("Retreive Blogs </br>Please wait...")
      blogs.style.display = "none";
      blogs.onloaded = ()=>{
        blogs.style.display = "";
        ApplicationView.resume()
      }
      this.getWorkspace().append(blogs)
    }
    
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
