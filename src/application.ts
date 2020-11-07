import "materialize-css/sass/materialize.scss";
import { Application } from "../../globular-mvc/Application";
import { ApplicationView } from "../../globular-mvc/ApplicationView";
import { Model } from "../../globular-mvc/Model";

import { SearchServicesPanel } from "./admin/searchServicesPanel";
import { GeneralInfoPanel } from "./admin/generalInfoPanel";
import { ServicePanel } from "./admin/servicePanel";
import { RolePanel } from "./admin/rolePanel";
import { randomUUID, fireResize } from "./admin/utility";
import { createElement } from './admin/element.js'
import { SqlServicePanel } from "./admin/services/sqlServicePanel";
import { SmtpServicePanel } from "./admin/services/smtpServicePanel";
import { LdapServicePanel } from "./admin/services/ldapServicePanel";
import { PersistenceServicePanel } from "./admin/services/persistenceServicePanel";
import { FileServicePanel } from './admin/services/fileServicePanel';
import { PlcServerConfigPanel } from './admin/services/plcServerConfigPanel';
import { PlcExporterConfigPanel } from "./admin/services/plcExporterConfigPanel";
import { PlcLinkConfigPanel } from "./admin/services/plcLinkConfigPanel";
import { DnsServicePanel } from "./admin/services/dnsServicePanel";
import { AccountManager } from "./admin/accountPanel";
import { FileManager } from "./admin/filePanel";
import { RessourceManager } from "./admin/ressourcePanel";
import { ApplicationManager } from "./admin/applicationPanel";
import { LogManager } from "./admin/logPanel";
import { PeerManager } from "./admin/peersPanel";
import { ServiceManager } from "./admin/servicesPanel";

export class ConsoleApplicationView extends ApplicationView {
    private welcomeContent: string
    constructor(){
        super();
        this.welcomeContent = this.getWorkspace().innerHTML
    }

    // init the view
    init(){
        super.init()
        
        // Keep the actual content
        Model.eventHub.subscribe("login_event", 
            (uuid:string)=>{}, 
            ()=>{
                this.getWorkspace().innerHTML = ""
            }, false)


        Model.eventHub.subscribe("logout_event", 
        (uuid:string)=>{}, 
        ()=>{
            this.getWorkspace().innerHTML = this.welcomeContent
        }, false)
    }



}


export class ConsoleApplication extends Application{
    constructor(view: ConsoleApplicationView){
        super("tests", "Globular Unit Tests", view);
    }
}