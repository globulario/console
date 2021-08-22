import { Settings } from "../../globular-mvc/Settings"
import { SettingsMenu, SettingsPanel, ComplexSetting, LinkSetting, EmailSetting, ActionSetting, ReadOnlyStringSetting, StringListSetting, StringSetting, DropdownSetting, TextAreaSetting, NumberSetting } from "../../globular-mvc/components/Settings"
import { ApplicationView } from "../../globular-mvc/ApplicationView";
import { Model } from "../../globular-mvc/Model";
import { SaveConfigRequest } from "../../globular-mvc/node_modules/globular-web-client/admin/admin_pb"
import * as resource from "../../globular-mvc/node_modules/globular-web-client/resource/resource_pb"
import { Application } from "../../globular-mvc/Application";
export class ServerGeneralSettings extends Settings {
    private config: any;

    constructor(config: any, settingsMenu: SettingsMenu, settingsPanel: SettingsPanel) {
        super(settingsMenu, settingsPanel);

        // make sure the configuration is not the actual server configuration
        config = JSON.parse(JSON.stringify(config))
        delete config["Services"] // do not display services configuration here...

        // Create the settings menu and panel here
        settingsMenu.appendSettingsMenuItem("settings", "Server");

        // Now the save menu
        let saveMenuItem = settingsMenu.appendSettingsMenuItem("save", "Save");
        saveMenuItem.onclick = () => {
            saveMenuItem.style.display = "none"
            //ApplicationView.displayMessage("The server will now restart...", 3000)
            let saveRqst = new SaveConfigRequest
            saveRqst.setConfig(JSON.stringify(config))
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

        // Create General informations setting's
        let serverSettingsPage = <any>settingsPanel.appendSettingsPage("Server");

        // Create general server settings ...
        let generalSettings = serverSettingsPage.appendSettings("General", "Globular Server General Settings");

        // Set the name of the server.
        let nameSetting = new StringSetting("Name", "The Globular server name")
        nameSetting.setValue(config.Name)
        generalSettings.addSetting(nameSetting)

        //
        nameSetting.onchange = () => {
            saveMenuItem.style.display = ""
            config.Name = nameSetting.getValue()
        }

        let macSetting = new ReadOnlyStringSetting("MAC Address", "The Globular server MAC addresse")
        macSetting.setValue(config.Mac)
        generalSettings.addSetting(macSetting)

        let versionSetting = new ReadOnlyStringSetting("Version", "The Globular server version number")
        versionSetting.setValue(config.Version)
        generalSettings.addSetting(versionSetting)

        let buildSetting = new ReadOnlyStringSetting("Build", "The Globular server build number")
        buildSetting.setValue(config.Build)
        generalSettings.addSetting(buildSetting)

        let platformSetting = new ReadOnlyStringSetting("Platfrom", "The server operating system and architecture")
        platformSetting.setValue(config.Platform)
        generalSettings.addSetting(platformSetting)

        // Now the port range.
        // The user name.
        let portRangeSetting = new ComplexSetting("Grpc Port Range", "[" + config.PortsRange + "]")

        // Set the user setting complex content.
        let startPortSetting = new NumberSetting("from port number", "Enter the starting port number (inclusive)")
        startPortSetting.setValue(config.PortsRange.split("-")[0])
        portRangeSetting.addSetting(startPortSetting)

        let endPortSetting = new NumberSetting("to port number", "Enter ending port number (inclusive)")
        endPortSetting.setValue(config.PortsRange.split("-")[1])
        portRangeSetting.addSetting(endPortSetting)

        startPortSetting.onchange = endPortSetting.onchange = () => {
            config.PortsRange = startPortSetting.getValue() + "-" + endPortSetting.getValue()
            portRangeSetting.setDescription("[" + config.PortsRange + "]")
            saveMenuItem.style.display = ""
        }

        generalSettings.addSetting(portRangeSetting)

        let watchForUpdateSetting = new NumberSetting("Update Delay", "Delay before watch for update in seconds")
        watchForUpdateSetting.setValue(config.WatchUpdateDelay)
        generalSettings.addSetting(watchForUpdateSetting)

        watchForUpdateSetting.onchange = () => {
            config.WatchUpdateDelay = watchForUpdateSetting.getValue()
            saveMenuItem.style.display = ""
        }

        let sessionTimeoutSetting = new NumberSetting("Session timeout", "The time tokens will be valid in milliseconds")
        sessionTimeoutSetting.setValue(config.SessionTimeout)
        generalSettings.addSetting(sessionTimeoutSetting)

        sessionTimeoutSetting.onchange = () => {
            config.SessionTimeout = sessionTimeoutSetting.getValue()
            saveMenuItem.style.display = ""
        }

        let webSeverSettings = serverSettingsPage.appendSettings("Web Server", "Web server http settings");

        // Set the protocol...
        let protocolSetting = new DropdownSetting("http/https", "Select the http server protocol")
        protocolSetting.setDropdownList(["http", "https"])
        protocolSetting.setValue(config.Protocol)
        webSeverSettings.addSetting(protocolSetting)

        protocolSetting.onchange = () => {
            config.Protocol = protocolSetting.getValue()
            saveMenuItem.style.display = ""
        }

        let indexApplicationSetting = new DropdownSetting("Index Application", "The default application to display on the server")
        webSeverSettings.addSetting(indexApplicationSetting)
        Application.getAllApplicationInfo((info:any)=>{
            let applications = [""]
            for(var i=0; i < info.length; i++){
                let app = <resource.Application>(info[i])
                applications.push(app.getName())
            }
            indexApplicationSetting.setDropdownList(applications)
        }, (err:any)=>{})
        indexApplicationSetting.setValue(config.IndexApplication)
        indexApplicationSetting.onchange = ()=>{
            config.IndexApplication = indexApplicationSetting.getValue()
            saveMenuItem.style.display = ""
        }

        // Now the http port...
        let httpPortSetting = new NumberSetting("http port number", "Enter the http port number")
        httpPortSetting.setValue(config.PortHttp)
        httpPortSetting.onchange = () => {
            config.PortHttp = httpPortSetting.getValue()
            saveMenuItem.style.display = ""
        }
        webSeverSettings.addSetting(httpPortSetting)


        let httpsPortSetting = new NumberSetting("https port number", "Enter the https port number")
        httpsPortSetting.setValue(config.PortHttps)
        httpsPortSetting.onchange = () => {
            config.PortHttps = httpsPortSetting.getValue()
            saveMenuItem.style.display = ""
        }

        webSeverSettings.addSetting(httpsPortSetting)

        // Now the dns informations.
        let dnsSeverSettings = serverSettingsPage.appendSettings("Domain", "Domain releated informations");

        // Set the name of the server.
        let domainSetting = new StringSetting("Domain", "The server domain name. If a Name is set the domain will be Name.Domaim")
        domainSetting.setValue(config.Domain)
        domainSetting.onchange = () => {
            config.Domain = domainSetting.getValue()
            saveMenuItem.style.display = ""
        }
        dnsSeverSettings.addSetting(domainSetting)

        let alternateDomainSettings = new StringListSetting("Alternate Domains", "List of alternate domain for the server")
        alternateDomainSettings.setValues(config.AlternateDomains)
        alternateDomainSettings.onchange = () => {
            config.AlternateDomains = alternateDomainSettings.getValues()
            saveMenuItem.style.display = ""
        }
        dnsSeverSettings.addSetting(domainSetting)
        dnsSeverSettings.addSetting(alternateDomainSettings)

        let dnsSettings = new StringListSetting("DNS servers", "List of dns server at least tow...")
        dnsSettings.setValues(config.Dns)
        dnsSettings.onchange = () => {
            config.Dns = dnsSettings.getValues()
            saveMenuItem.style.display = ""
        }
        dnsSeverSettings.addSetting(dnsSettings)

        // Server certificate setting.
        let certificateSettings = serverSettingsPage.appendSettings("Certificates", "TLS certificate(s) settings");

        let certUrlSetting = new LinkSetting("Certificate", "Certificate URL")
        certUrlSetting.setValue("click to download")
        certUrlSetting.setUrl(config.CertURL)
        certificateSettings.addSetting(certUrlSetting)

        // Set the name of the server.
        let crtSetting = new StringSetting("Cerificate", "the certificate .crt file in the creds directory.")
        crtSetting.setValue(config.Certificate)
        certificateSettings.addSetting(crtSetting)

        // Empty it will force certificate regeneation...
        crtSetting.onchange = () => {
            saveMenuItem.style.display = ""
            config.Certificate = crtSetting.getValue()
        }

        let crtBundleSetting = new StringSetting("Cerificate bundle", "the certificate ca bundle")
        crtBundleSetting.setValue(config.CertificateAuthorityBundle)
        certificateSettings.addSetting(crtBundleSetting)

        // Empty it will force certificate regeneation...
        crtBundleSetting.onchange = () => {
            saveMenuItem.style.display = ""
            config.CertificateAuthorityBundle = crtBundleSetting.getValue()
        }

        let certExpirationDelaySetting = new NumberSetting("Expiration", "The number of day the certificate must be valid")
        certExpirationDelaySetting.setValue(config.CertExpirationDelay)
        certExpirationDelaySetting.onchange = () => {
            saveMenuItem.style.display = ""
            config.CertExpirationDelay = certExpirationDelaySetting.getValue()
        }
        certificateSettings.addSetting(certExpirationDelaySetting)

        let certPasswordSetting = new StringSetting("Password", "Certificate password")
        certPasswordSetting.setValue(config.CertPassword)
        certPasswordSetting.onchange = () => {
            saveMenuItem.style.display = ""
            config.CertPassword = certPasswordSetting.getValue()
        }
        certificateSettings.addSetting(certPasswordSetting)

        let certCountrySetting = new StringSetting("Country", "Country Codes are required when creating a Certificate Signing Request")
        certCountrySetting.setValue(config.Country)
        certCountrySetting.onchange = () => {
            saveMenuItem.style.display = ""
            config.Country = certCountrySetting.getValue()
        }
        certificateSettings.addSetting(certCountrySetting)

        let certStateSetting = new StringSetting("State", "State Codes are required when creating a Certificate Signing Request")
        certStateSetting.setValue(config.State)
        certStateSetting.onchange = () => {
            saveMenuItem.style.display = ""
            config.State = certStateSetting.getValue()
        }
        certificateSettings.addSetting(certStateSetting)

        let citySetting = new StringSetting("City", "City Codes are required when creating a Certificate Signing Request")
        citySetting.setValue(config.City)
        citySetting.onchange = () => {
            saveMenuItem.style.display = ""
            config.City = citySetting.getValue()
        }
        certificateSettings.addSetting(citySetting)

        let certOrganizationSetting = new StringSetting("Organization", "Organization Codes are required when creating a Certificate Signing Request")
        certOrganizationSetting.setValue(config.Organization)
        certOrganizationSetting.onchange = () => {
            saveMenuItem.style.display = ""
            config.Organization = certOrganizationSetting.getValue()
        }
        certificateSettings.addSetting(certOrganizationSetting)

        // Now the action.
        let renewCertificateAction = new ActionSetting("Renew", "Renew the certificate", () => {
            config.Certificate = ""
            config.CertificateAuthorityBundle = ""
            saveMenuItem.click()
        })

        certificateSettings.addSetting(renewCertificateAction)

    }
}