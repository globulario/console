import { ServicePanel } from "../servicePanel"
import { IServiceConfig } from "../../../../globular-mvc/node_modules/globular-web-client"
import { ConfigurationTextLine } from "../configurationPanel";

/**
 * The sql service admin configuration interface.
 */
export class FileServicePanel extends ServicePanel {
    private rootTextLine: ConfigurationTextLine;

    constructor(service: IServiceConfig, id: string, name: string) {
        super(service, id, name)
    }

    onlogin(data: any) {
        super.onlogin(data);
        if(this.rootTextLine == undefined){
            // simply append the root variable.
            this.rootTextLine = this.appendTextualConfig("Root");
        }
        this.rootTextLine.unlock()
    }

    onlogout() {
        super.onlogout();
        this.rootTextLine.lock()
    }
}