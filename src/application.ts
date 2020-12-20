import "materialize-css/sass/materialize.scss";
import { Application } from "../../globular-mvc/Application";
import { ApplicationView } from "../../globular-mvc/ApplicationView";
import { Model } from "../../globular-mvc/Model";
import { Account } from "../../globular-mvc/Account";
import { ServerReflectionRequest, ServerReflectionResponse} from "../../globular-mvc/node_modules/globular-web-client/reflection/reflection_pb"
import { ServerReflectionPromiseClient} from "../../globular-mvc/node_modules/globular-web-client/reflection/reflection_grpc_web_pb"

import "../../globular-mvc/node_modules/@polymer/iron-selector/iron-selector"

export class ConsoleApplicationView extends ApplicationView {
  private welcomeContent: string;
  private navigationDiv: any;
  public displayWelcomePage: ()=>void;

  constructor() {
    super();
    this.welcomeContent = this.getWorkspace().innerHTML;

    // Here I will create the navgation menu.
    let rqst = new ServerReflectionRequest;

    
    rqst.setHost("localhost:10001")
    let client = new ServerReflectionPromiseClient("localhost:10001")
    
  }

  onLogin(account: Account) {
    super.onLogin(account);
    this.getWorkspace().innerHTML = "";
    console.log("-----> on login!");
    let navigationHtml = `
    <style>

      #topMenu {
          display: flex;
          flex-direction: column;
          min-width: fit-content;
          font-family: Roboto, Ubuntu, Arial, sans-serif;
          font-size: 81.25%;
      }


      #topMenu a{
          align-items: center;
          color: var(--settings-nav-item-color);
          display: flex;
          font-weight: 500;
          margin-inline-end: 2px;
          margin-inline-start: 1px;
          min-height: 20px;
          padding-bottom: 10px;
          padding-inline-start: 23px;
          padding-top: 10px;
      }

    </style>

    <div id="left">
      <settings-menu>
        <!--iron-selector id="topMenu" selectable="a:not(#extensionsLink)" attr-for-selected="href" role="navigation">
          <a>Item 1</a>
          <a>Item 2</a>
          <a>Item 3</a>
        </iron-selctor-->
      </settings-menu>
    </div>

    `

    // Clear previous content.
    if(document.getElementById("left") != undefined){
      document.getElementById("left").innerHTML = ""
    }

    let range = document.createRange();
    this.getSideMenu().appendChild(range.createContextualFragment(navigationHtml))
    this.navigationDiv = document.getElementById("navigation-div")

    // fire the window resize event to display the side menu.
    window.dispatchEvent(new Event('resize'));
  }

  onLogout() {
    super.onLogout();
    this.getWorkspace().innerHTML = "";
    this.displayWelcomePage();
  }
}

export class ConsoleApplication extends Application {
  constructor(view: ConsoleApplicationView) {
    super("console", "Globular Console", view);
  }
}
