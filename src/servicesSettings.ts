import { Settings } from "../../globular-mvc/Settings"
import { SettingsMenu, SettingsPanel, ComplexSetting, LinkSetting, EmailSetting, ActionSetting, OnOffSetting, ReadOnlyStringSetting, StringListSetting, StringSetting, DropdownSetting, TextAreaSetting, NumberSetting } from "../../globular-mvc/components/Settings"
import { ApplicationView } from "../../globular-mvc/ApplicationView";
import { Model } from "../../globular-mvc/Model";
import { SaveConfigRequest } from "../../globular-mvc/node_modules/globular-web-client/admin/admin_pb"
import * as resource from "../../globular-mvc/node_modules/globular-web-client/resource/resource_pb"
import * as servicesManager from "../../globular-mvc/node_modules/globular-web-client/services_manager/services_manager_pb"
import { Application } from "../../globular-mvc/Application";
import { ConsoleApplication } from "./application";


export class ServicesSettings extends Settings {
    private services: any

    constructor(settingsMenu: SettingsMenu, settingsPanel: SettingsPanel, saveMenuItem: any) {
        super(settingsMenu, settingsPanel);

        // Init the service configuration...
        this.getServicesConfiguration(
            (services: any) => {
                console.log(services)
                this.init(services, settingsMenu, settingsPanel, saveMenuItem)
                // refresh service states...
                setInterval(() => {
                    this.getServicesConfiguration(
                        (services: any) => {
                            console.log(services)

                            // refresh service states...
                            services.forEach((service: any) => {
                                if (this.services[service.Id] != undefined) {

                                    // So here I will update the service state...
                                    this.setServiceState(service)


                                }
                            })

                        }, (err: any) => {
                            console.log(err)
                        })
                }, 5000)
            }, (err: any) => {
                console.log(err)
            })
    }

    // Init the configuration interface...
    init(services: any, settingsMenu: SettingsMenu, settingsPanel: SettingsPanel, saveMenuItem: any) {
        this.services = {}

        // Create the settings menu and panel here
        settingsMenu.appendSettingsMenuItem("settings", "Services");

        // Create General informations setting's
        let serverSettingsPage = <any>settingsPanel.appendSettingsPage("Services");

        // Create general server settings ...
        let servicesSettings = serverSettingsPage.appendSettings("Runing Instances", "Installed gRPC service instances(" + Object.keys(services).length + ")");
        let range = document.createRange()

        // Now The actions...
        let resartAllServicesAction = new ActionSetting("Restart", "Restart all gRpc services", () => {
            let rqst = new servicesManager.RestartAllServicesRequest
            Model.globular.servicesManagerService.restartAllServices(rqst, {
                token: localStorage.getItem("user_token"),
                application: Model.application,
                domain: Model.domain
            }).then(() => {
                console.log("services was restarted!")
            })
            .catch((err:any)=>{
                ApplicationView.displayMessage(err, 3000)
            })
        })

        servicesSettings.addSetting(resartAllServicesAction)

        for (var s in services) {
            let service = services[s]
            if (service.Name != undefined) {
                let serviceSetting = new ComplexSetting(service.Name.split(".")[0], "")
                serviceSetting.getDescription = () => {
                    return "gRpc service settings"
                }

                /** So here I will append into the description div controls to stop/start the serivce */
                let serviceToolBar = `
                <div style="display: flex; padding-left: 25px; align-items: center;">
                    <div style="width: 28px; height: 28px; display: none;">
                        <paper-spinner id="service-spinner-${service.Id}"></paper-spinner>
                    </div>
                    <paper-icon-button icon="av:play-arrow" id="start-service-btn-${service.Id}">
                        Start
                    </paper-icon-button>
                    <paper-icon-button style="padding-rigth: 15px;" icon="av:stop" id="stop-service-btn-${service.Id}">
                        Stop
                    </paper-icon-button>
                    <div style="display: flex; align-items: center; width: 100%; padding-left: 15px;">
                        <span class="setting-name" style="flex-basis: 55px; ">Status: </span>
                        <span id="service-state-${service.Id}"></span>
                        <span style="padding-left: 10px; color: var(--palette-error-main);" id="service-last-error-${service.Id}">
                    </div>
                </div>
            `

                let div = <any>serviceSetting.getDescriptionDiv()
                div.appendChild(range.createContextualFragment(serviceToolBar))

                new ServiceSetting(service, serviceSetting, saveMenuItem)

                // Now I will set the actions 
                let startServiceBtn = div.querySelector("#start-service-btn-" + service.Id)
                let stopServiceBtn = div.querySelector("#stop-service-btn-" + service.Id)
                let spinner = div.querySelector("#service-spinner-" + service.Id)

                if (service.State == "running") {
                    startServiceBtn.style.display = "none"
                    stopServiceBtn.style.display = "block"
                } else {
                    startServiceBtn.style.display = "block"
                    stopServiceBtn.style.display = "none"
                }

                /** Start service */
                startServiceBtn.onclick = () => {
                    spinner.setAttribute("active", "")
                    spinner.parentNode.style.display = "block"
                    startServiceBtn.style.display = "none"
                    stopServiceBtn.style.display = "none"
                    let rqst = new servicesManager.StartServiceInstanceRequest
                    rqst.setServiceId(service.Id)
                    Model.globular.servicesManagerService.startServiceInstance(rqst, {
                        token: localStorage.getItem("user_token"),
                        application: Model.application,
                        domain: Model.domain
                    }).then(() => {

                    }).catch((err: any) => {
                        ApplicationView.displayMessage(err, 3000)
                    })
                }

                /** Stop service instance */
                stopServiceBtn.onclick = () => {
                    let rqst = new servicesManager.StopServiceInstanceRequest
                    rqst.setServiceId(service.Id)
                    spinner.setAttribute("active", "")
                    startServiceBtn.style.display = "none"
                    stopServiceBtn.style.display = "none"
                    spinner.parentNode.style.display = "block"
                    Model.globular.servicesManagerService.stopServiceInstance(rqst, {
                        token: localStorage.getItem("user_token"),
                        application: Model.application,
                        domain: Model.domain
                    }).then(() => {

                    }).catch((err: any) => {
                        ApplicationView.displayMessage(err, 3000)
                    })

                }

                servicesSettings.addSetting(serviceSetting)

                this.services[service.Id] = div
                this.setServiceState(service)
            }
        }

    }

    // Set the service state in the interface.
    setServiceState(service: any) {
        let stateSpan = this.services[service.Id].querySelector("#service-state-" + service.Id)
        if (stateSpan.innerHTML == service.State) {
            return
        }
        let startServiceBtn = this.services[service.Id].querySelector("#start-service-btn-" + service.Id)
        let stopServiceBtn = this.services[service.Id].querySelector("#stop-service-btn-" + service.Id)
        let spinner = this.services[service.Id].querySelector("#service-spinner-" + service.Id)

        stateSpan.innerHTML = service.State
        stateSpan.style.color = "var(--palette-text-primary)"
        startServiceBtn.style.display = "block"
        stopServiceBtn.style.display = "none"
        let lastErrorSpan = this.services[service.Id].querySelector("#service-last-error-" + service.Id)
        lastErrorSpan.innerHTML = ""

        if (service.State == "failed") {
            lastErrorSpan.innerHTML = "(" + service.last_error + ")"
            stateSpan.style.color = "var(--palette-error-main)"
            ApplicationView.displayMessage("Service " + service.Name + ":" + service.Id + " failed with error " + service.last_error, 3000)
        } else if(service.State == "running")  {
            startServiceBtn.style.display = "none"
            stopServiceBtn.style.display = "block"
            stateSpan.style.color = "var(--palette-success-main)"
        } else if(service.State == "killed")  {
            stateSpan.style.color = "var(--palette-error-main)"
        } else if(service.State == "starting")  {
            stateSpan.style.color = "var(--palette-warning-main)"
            startServiceBtn.style.display = "none"
            stopServiceBtn.style.display = "none"
            spinner.parentNode.style.display = "block"
            spinner.setAttribute("active", "")
        }
        
       
        if(service.State != "starting"){
            spinner.parentNode.style.display = "none"
            spinner.removeAttribute("active")
        }
    }

    getServicesConfiguration(successCallback: (services: any) => void, errorCallback: (services: any) => void) {
        let rqst = new servicesManager.GetServicesConfigurationRequest

        Model.globular.servicesManagerService.getServicesConfiguration(rqst, {
            token: localStorage.getItem("user_token"),
            application: Model.application,
            domain: Model.domain
        }).then((rsp: servicesManager.GetServicesConfigurationResponse) => {
            let services = []

            for (var i = 0; i < rsp.getServicesList().length; i++) {
                let service = rsp.getServicesList()[i].toJavaScript()
                services.push(service)
            }

            successCallback(services)
        })
            .catch((err: any) => {
                console.log(err)
            })
    }

}

export class ServiceSetting {
    private service: any;

    constructor(service: any, serviceSetting: any, saveMenuItem: any) {
        console.log(service)

        // The restart all services button...


        // Here I will display the non editable informations...
        let descriptionSetting = new ReadOnlyStringSetting("Description", "")
        descriptionSetting.setValue(service.Description)
        serviceSetting.addSetting(descriptionSetting)

        let nameSetting = new ReadOnlyStringSetting("Name", "gRpc Service Name")
        nameSetting.setValue(service.Name)
        serviceSetting.addSetting(nameSetting)

        let idSetting = new ReadOnlyStringSetting("Id", "The serivce instance id")
        idSetting.setValue(service.Id)
        serviceSetting.addSetting(idSetting)

        let macSetting = new ReadOnlyStringSetting("MAC Address", "The Globular server MAC addresse")
        macSetting.setValue(service.Mac)
        serviceSetting.addSetting(macSetting)

        let publisherIdSetting = new ReadOnlyStringSetting("Publisher", "The creator (organization or user) of that service")
        publisherIdSetting.setValue(service.PublisherId)
        serviceSetting.addSetting(publisherIdSetting)

        let versionSetting = new ReadOnlyStringSetting("Version", "The Globular server version number")
        versionSetting.setValue(service.Version)
        serviceSetting.addSetting(versionSetting)

        let tlsSetting = new ReadOnlyStringSetting("TLS", "Does the service use secure socket...")
        tlsSetting.setValue(service.TLS)
        serviceSetting.addSetting(tlsSetting)

        let portSetting = new NumberSetting("Port", "The gRpc service port number")
        portSetting.setValue(service.Port)
        serviceSetting.addSetting(portSetting)

        let proxySetting = new NumberSetting("Proxy", "The gRpc proxy port number")
        proxySetting.setValue(service.Proxy)
        serviceSetting.addSetting(proxySetting)

        let allowedAllOrigins = new OnOffSetting("Allow All Origins", "all origins are allowed")
        allowedAllOrigins.setValue(service.AllowAllOrigins)
        serviceSetting.addSetting(allowedAllOrigins)

        let corsOriginsSettings_ = new ComplexSetting("Allowed Origins", "List of allowed Cross-origin")

        let corsOriginsSettings = new StringListSetting("Allowed Origins", "List of allowed Cross-origin")
        let allowedOrigins = service.AllowedOrigins.split(",")
        corsOriginsSettings.setValues(allowedOrigins)
        corsOriginsSettings.onchange = () => {
            let allowedOrigins = corsOriginsSettings.getValues()
            service.AllowedOrigins = ""
            for (var i = 0; i < allowedOrigins.length; i++) {
                service.AllowedOrigins += allowedOrigins[i]
                if (i < allowedOrigins.length - 1) {
                    service.AllowedOrigins += " ,"
                }
            }
            saveMenuItem.style.display = ""
        }

        if (!service.AllowAllOrigins) {
            allowedAllOrigins.setAttribute("title", "all origins are allowed")
        } else {
            corsOriginsSettings_.style.display = "none"
        }

        allowedAllOrigins.getElement().onchange = () => {
            let toggle = <any>(allowedAllOrigins.getElement())
            if (!toggle.checked) {
                toggle.setAttribute("title", "select allowed origin...")
                corsOriginsSettings_.style.display = "flex"
            } else {
                toggle.setAttribute("title", "all origins are allowed")
                corsOriginsSettings_.style.display = "none"
            }
            saveMenuItem.style.display = ""
        }

        corsOriginsSettings_.addSetting(corsOriginsSettings)
        serviceSetting.addSetting(corsOriginsSettings_)

        // Now The actions...
        let updateServiceAction = new ActionSetting("Update", "Update service to the last version", () => {
            saveMenuItem.click()
        })
        serviceSetting.addSetting(updateServiceAction)

        let uninstallServiceAction = new ActionSetting("Uninstall", "Uninstall the service", () => {
            saveMenuItem.click()
        })

        serviceSetting.addSetting(uninstallServiceAction)
    }

}