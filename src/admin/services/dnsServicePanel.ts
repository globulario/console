import { ServicePanel } from "../servicePanel"
import { IServiceConfig } from "../../../../globular-mvc/node_modules/globular-web-client"
import { ConfigurationLine } from "../configurationPanel";

/**
 * The sql service admin configuration interface.
 */
export class DnsServicePanel extends ServicePanel {
    private dnsPort: ConfigurationLine;
    private storageDataPath: ConfigurationLine;
    private managedDomains: ConfigurationLine;

    constructor(service: IServiceConfig, id: string, name: string) {
        super(service, id, name)
    }

    onlogin(data: any) {
        super.onlogin(data);

        // simply append the root variable.
        if (this.dnsPort == undefined) {
            this.dnsPort = this.appendTextualConfig("DnsPort", "DNS Port", "number", 1, 0, 64000);
            this.dnsPort.unlock()
        }

        if (this.storageDataPath == undefined) {
            this.storageDataPath = this.appendTextualConfig("StorageDataPath", "Storage Data Path");
            this.storageDataPath.unlock()
        }

        if (this.managedDomains == undefined) {
            this.managedDomains = this.appendStringListConfig("Domains", "Managed Domains");
            this.managedDomains.unlock()
        }

    }

    onlogout() {
        super.onlogout();
    }
}