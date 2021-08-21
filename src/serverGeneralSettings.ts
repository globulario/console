import { Settings } from "../../globular-mvc/Settings"
import { SettingsMenu, SettingsPanel, ComplexSetting, EmailSetting, ActionSetting, ReadOnlyStringSetting, StringListSetting, StringSetting, DropdownSetting, TextAreaSetting, NumberSetting } from "../../globular-mvc/components/Settings"

export class ServerGeneralSettings extends Settings {
    private config: any;

    constructor(config: any, settingsMenu: SettingsMenu, settingsPanel: SettingsPanel) {
        super(settingsMenu, settingsPanel);
        this.config = config

        // Create the settings menu and panel here
        settingsMenu.appendSettingsMenuItem("settings", "Server");

        // Create General informations setting's
        let serverSettingsPage = <any>settingsPanel.appendSettingsPage("Server");

        // Create general server settings ...
        let generalSettings = serverSettingsPage.appendSettings("General", "Globular Server General Settings");

        // Set the name of the server.
        let nameSetting = new StringSetting("Name", "The Globular server name")
        nameSetting.setValue(config.Name)
        generalSettings.addSetting(nameSetting)

        let macSetting = new ReadOnlyStringSetting("MAC Address", "The Globular server MAC addresse")
        macSetting.setValue(config.Mac)
        generalSettings.addSetting(macSetting)

        let versionSetting = new ReadOnlyStringSetting("Version", "The Globular server version number")
        versionSetting.setValue(config.Version)
        generalSettings.addSetting(versionSetting)

        let buildSetting = new ReadOnlyStringSetting("Build", "The Globular server build number")
        buildSetting.setValue(config.Build)
        generalSettings.addSetting(buildSetting)

        // Now the port range.
        // The user name.
        let portRangeSetting = new ComplexSetting("Grpc Port Range", "[" + config.PortsRange + "]")

        // Set the user setting complex content.
        let startPortSetting = new NumberSetting("from port number", "Enter the starting port number (inclusive)")
        startPortSetting.setValue(10000)
        portRangeSetting.addSetting(startPortSetting)

        let endPortSetting = new NumberSetting("to port number", "Enter ending port number (inclusive)")
        endPortSetting.setValue(10100)
        portRangeSetting.addSetting(endPortSetting)

        generalSettings.addSetting(portRangeSetting)

        let webSeverSettings = serverSettingsPage.appendSettings("Web Server", "Web server http settings");

        // Set the protocol...
        let protocolSetting = new DropdownSetting("http/https", "Select the http server protocol")
        protocolSetting.setDropdownList(["http", "https"])

        webSeverSettings.addSetting(protocolSetting)

        // Now the http port...
        let httpPortSetting = new NumberSetting("http port number", "Enter the http port number")
        httpPortSetting.setValue(config.PortHttp)
        webSeverSettings.addSetting(httpPortSetting)


        let httpsPortSetting = new NumberSetting("https port number", "Enter the https port number")
        httpsPortSetting.setValue(config.PortHttps)
        webSeverSettings.addSetting(httpsPortSetting)

        // Now the dns informations.
        let dnsSeverSettings = serverSettingsPage.appendSettings("Domain", "Domain releated informations");
        // Set the name of the server.
        let domainSetting = new StringSetting("Domain", "The server domain name. If a Name is set the domain will be Name.Domaim")
        domainSetting.setValue(config.Domain)
        dnsSeverSettings.addSetting(domainSetting)

        let alternateDomainSettings = new StringListSetting("Alternate Domains", "List of alternate domain for the server")
        alternateDomainSettings.setValues(config.AlternateDomains)
        dnsSeverSettings.addSetting(alternateDomainSettings)

        let dnsSettings = new StringListSetting("DNS servers", "List of dns server at least tow...")
        dnsSettings.setValues(config.Dns)
        dnsSeverSettings.addSetting(dnsSettings)

        // Server certificate setting.
        let certificateSettings = serverSettingsPage.appendSettings("Certificates", "TLS certificate(s) settings");

        let certExpirationDelaySetting = new NumberSetting("Expiration", "The number of day the certificate must be valid")
        certExpirationDelaySetting.setValue(config.CertExpirationDelay)
        certificateSettings.addSetting(certExpirationDelaySetting)

        let certPasswordSetting = new StringSetting("Password", "Certificate password")
        certPasswordSetting.setValue(config.CertPassword)
        certificateSettings.addSetting(certPasswordSetting)

        let certCountrySetting = new StringSetting("Country", "Country Codes are required when creating a Certificate Signing Request")
        certCountrySetting.setValue(config.Country)
        certificateSettings.addSetting(certCountrySetting)

        let certStateSetting = new StringSetting("State", "State Codes are required when creating a Certificate Signing Request")
        certStateSetting.setValue(config.State)
        certificateSettings.addSetting(certStateSetting)

        let citySetting = new StringSetting("City", "City Codes are required when creating a Certificate Signing Request")
        citySetting.setValue(config.City)
        certificateSettings.addSetting(citySetting)

        let certOrganizationSetting = new StringSetting("Organization", "Organization Codes are required when creating a Certificate Signing Request")
        certOrganizationSetting.setValue(config.Organization)
        certificateSettings.addSetting(certOrganizationSetting)

        // Now the action.
        let renewCertificateAction = new ActionSetting("Renew", "Renew the certificate", ()=>{
            console.log("renew it! Do it! Do it!")
        })

        certificateSettings.addSetting(renewCertificateAction)
      
    }
}