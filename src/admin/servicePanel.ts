import { ConfigurationPanel } from "./configurationPanel";
import { IServiceConfig} from "../../../globular-mvc/node_modules/globular-web-client";
import { randomUUID } from "./utility";
import { createElement } from "./element";
import {
  stopService,
  startService,
  saveService,
  getErrorMessage,
  uninstallService,
  installService,
  getServiceDescriptor
} from "../../../globular-mvc/node_modules/globular-web-client/api";
import { ServiceDescriptor } from "../../../globular-mvc/node_modules/globular-web-client/services/services_pb";
import {Model} from "../../../globular-mvc/Model"

/**
 * That class is use to display service configuration.
 */
export class ServicePanel extends ConfigurationPanel {
  private uninstallBtn: any;
  private updateBtn: any;
  private stopBtn: any;
  private startBtn: any;
  public actionBtnGroup: any;

  // configuration lines.
  private domainConfig: any;
  private publisherConfig: any;
  private versionConfig: any;
  private keepUpdataConfig: any;
  private keepAliveConfig: any;
  private portConfig: any;
  private proxyConfig: any;
  private tlsConfig: any;
  public stateDiv: any;
  private editable: boolean;
  private listeners: Map<string, Array<string>>;

  constructor(service: IServiceConfig, id: string, name: string) {
    super(service, name, randomUUID());

    this.listeners = new Map<string, Array<string>>();

    // Set the domain propertie.
    this.domainConfig = this.appendTextualConfig("Domain");

    // Set the id of the publisher
    this.publisherConfig = this.appendTextualConfig("PublisherId", "Publisher");

    // The version of the service...
    this.versionConfig = this.appendTextualConfig("Version");

    // TLS todo create boolean configuration values...
    this.keepUpdataConfig = this.appendBooleanConfig(
      "KeepUpToDate",
      ["True", "False"],
      "Keep up to date"
    );

    // Restart the service if it stop...
    this.keepAliveConfig = this.appendBooleanConfig(
      "KeepAlive",
      ["True", "False"],
      "Keep alive"
    );

    // The port
    this.portConfig = this.appendTextualConfig(
      "Port",
      "Port",
      "number",
      1,
      0,
      65535
    );

    // The proxy
    this.proxyConfig = this.appendTextualConfig(
      "Proxy",
      "Proxy",
      "number",
      1,
      0,
      65535
    );

    // TLS todo create boolean configuration values...
    this.tlsConfig = this.appendBooleanConfig(
      "TLS",
      ["True", "False"],
      "Use TLS"
    );

    // Here I will append specific button
    this.actionBtnGroup = createElement(null, {
      tag: "div",
      class: "col s6 right-align",
      style: "display: none;",
    });

    this.actionBtnGroup
      .appendElement({
        tag: "a",
        id: "update_btn",
        href: "javascript:void(0)",
        class: "waves-effect waves-light btn-flat",
        innerHtml: "Update",
        style: "margin-right: 2px; display: none",
      })
      .appendElement({
        tag: "a",
        id: "uninstall_btn",
        href: "javascript:void(0)",
        class: "waves-effect waves-light btn-flat",
        innerHtml: "Uninstall",
        style: "margin-right: 2px;",
      })
      .appendElement({
        tag: "a",
        id: "stop_btn",
        href: "javascript:void(0)",
        class: "waves-effect waves-light btn-flat",
        innerHtml: "Stop",
        style: "margin-right: 2px;",
      })
      .appendElement({
        tag: "a",
        id: "start_btn",
        href: "javascript:void(0)",
        class: "waves-effect waves-light btn-flat",
        innerHtml: "Start",
        style: "margin-right: 2px; display: none;",
      });

    this.uninstallBtn = this.actionBtnGroup.getChildById("uninstall_btn");
    this.stopBtn = this.actionBtnGroup.getChildById("stop_btn");
    this.startBtn = this.actionBtnGroup.getChildById("start_btn");
    this.updateBtn = this.actionBtnGroup.getChildById("update_btn");

    // display the start button and hide stop if the service is not running.
    if (service.State != "running") {
      this.stopBtn.element.style.display = "none";
      this.startBtn.element.style.display = "";
    }

    // Actions..

    // Uninstall
    this.uninstallBtn.element.onclick = (evt: any) => {
      evt.stopPropagation();
      uninstallService(
        Model.globular,
        this.config,
        true,
        () => {
          delete Model.globular.config.Services[this.config.Id];
          Model.eventHub.publish("uninstall_service_event", this.config.Id, true);
          M.toast({
            html:
              "Service " +
              this.config.Name +
              ":" +
              this.config.Id +
              " was uninstalled successfully!",
            displayLength: 3000,
          });
        },
        (err: any) => {
          M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
        }
      );
    };

    this.stopBtn.element.onclick = (evt: any) => {
      evt.stopPropagation();
      stopService(
        Model.globular,
        id,
        () => {
          // Here I will set the start button...
          Model.eventHub.publish("stop_service_event_" + id, id, false);
        },
        (err: any) => {
          M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
        }
      );
    };

    /**
     * That event will be call when a service will be stopped.
     */
    Model.eventHub.subscribe(
      "stop_service_event_" + id,
      (uuid: string) => {
        /** Subscriber id. todo diconnect on logout...*/
        if (!this.listeners.has("stop_service_event_" + id)) {
          this.listeners.set("stop_service_event_" + id, new Array<string>());
        }
        this.listeners.get("stop_service_event_" + id).push(uuid);
      },
      (evt: any) => {
        this.stopBtn.element.style.display = "none";
        this.startBtn.element.style.display = "";
        this.keepAliveConfig.set(); // set the value...
        this.stateDiv.element.innerHTML = "stopped";
      },
      false
    );

    this.startBtn.element.onclick = (evt: any) => {
      evt.stopPropagation();
      startService(
        Model.globular,
        id,
        () => {
          // Here I will set the start button...
          Model.eventHub.publish("start_service_event_" + id, id, false);
        },
        (err: any) => {
          M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
        }
      );
    };

    Model.eventHub.subscribe(
      "start_service_event_" + id,
      (uuid: string) => {
        //console.log("start_service_event_" + id, uuid);
        if (!this.listeners.has("start_service_event_" + id)) {
          this.listeners.set("start_service_event_" + id, new Array<string>());
        }
        this.listeners.get("start_service_event_" + id).push(uuid);
      },
      (evt: any) => {
        this.stopBtn.element.style.display = "";
        this.startBtn.element.style.display = "none";
        this.stateDiv.element.innerHTML = "running";
      },
      false
    );

    // Here I will update the configuration on save event.
    Model.eventHub.subscribe(
      "save_service_config_event_" + id,
      (uuid: string) => {
        //console.log("save_service_config_event_" + id, uuid);
        if (!this.listeners.has("save_service_config_event_" + id)) {
          this.listeners.set(
            "save_service_config_event_" + id,
            new Array<string>()
          );
        }
        this.listeners.get("save_service_config_event_" + id).push(uuid);
      },
      (configStr: string) => {
        this.config = JSON.parse(configStr);
        this.keepAliveConfig.reset();
        this.domainConfig.reset();
        this.publisherConfig.reset();
        this.versionConfig.reset();
        this.keepUpdataConfig.reset();
        this.keepAliveConfig.reset();
        this.portConfig.reset();
        this.proxyConfig.reset();
        this.tlsConfig.reset();
        this.stateDiv.element.innerHTML = this.config.State;
      },
      false
    );
  }

  refresh() {
    // Set the config.
    this.config = Model.globular.config.Services[this.config.Id];

    // set field values.
    this.keepAliveConfig.reset();
    this.domainConfig.reset();
    this.publisherConfig.reset();
    this.versionConfig.reset();
    this.keepUpdataConfig.reset();
    this.keepAliveConfig.reset();
    this.portConfig.reset();
    this.proxyConfig.reset();
    this.tlsConfig.reset();
  }

  setStateDiv(div: any) {
    this.stateDiv = div;
    if (this.editable) {
      this.stateDiv.element.style.display = "none";
    } else {
      this.stateDiv.element.style.display = "";
    }
  }

  onlogin(data: any) {
    super.onlogin(data);

    if (this.config != undefined) {
      this.actionBtnGroup.element.style.display = "";
      this.stateDiv.element.style.display = "none";
      this.config = data.Services[this.config.Id];
      this.editable = true;

      // So here I will get information to see if or not a new service
      // version is available and show the update button if it's the case.
      getServiceDescriptor(
        Model.globular,
        this.config.Id,
        this.config.PublisherId,
        (descriptors: Array<ServiceDescriptor>) => {
          descriptors.sort((a, b) =>
            a.getVersion() > b.getVersion()
              ? 1
              : b.getVersion() > a.getVersion()
              ? -1
              : 0
          );
          if (descriptors.length > 0) {
            let descriptor = descriptors[descriptors.length - 1];
            if (this.config.Version < descriptor.getVersion()) {
              // In that case I will dsiplay the update button
              this.updateBtn.element.style.display = "inline";

              // Update the service to the last version.
              this.updateBtn.element.onclick = (evt: any) => {
                uninstallService(
                  Model.globular,
                  this.config,
                  false,
                  () => {
                    installService(
                      Model.globular,
                      descriptor.getDiscoveriesList()[0],
                      descriptor.getId(),
                      descriptor.getPublisherid(),
                      descriptor.getVersion(),
                      () => {
                        // here I will refresh the token and set the full config...
                        Model.eventHub.publish(
                          "install_service_event",
                          descriptor.getId(),
                          true
                        );
                        M.toast({
                          html:
                            "Service " +
                            descriptor.getId() +
                            "  installed successfully!",
                          displayLength: 3000,
                        });

                        // refresh the panel again to set the new service to admin mode.
                        Model.eventHub.publish("onlogin", Model.globular.config, true);
                      },
                      (err: any) => {
                        M.toast({
                          html: getErrorMessage(err.message),
                          displayLength: 2000,
                        });
                      }
                    );
                  },
                  (err: any) => {
                    M.toast({
                      html: getErrorMessage(err.message),
                      displayLength: 2000,
                    });
                  }
                );
              };
            } else {
              this.updateBtn.element.style.display = "none";
            }
          }
        },
        (err: any) => {
          M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
        }
      );
    } else {
      console.log("service panel have empty configuration! ", this);
    }
  }

  onlogout() {
    super.onlogout();
    this.actionBtnGroup.element.style.display = "none";
    this.stateDiv.element.style.display = "";
    this.editable = true;
  }

  close() {
    super.close();
    // close the listener.
    this.listeners.forEach((listeners: Array<string>, event: string) => {
      listeners.forEach((uuid: string) => {
        Model.eventHub.unSubscribe(event, uuid);
      });
    });
  }

  save() {
    super.save();

    // Now I will save the configuration.
    console.log("save service!");
    saveService(
      Model.globular,
      this.config,
      (service: any) => {
        // So here I will publish an event to update configuration.
        Model.eventHub.publish(
          "save_service_config_event_" + service.Id,
          JSON.stringify(service),
          false
        );
      },
      (err: any) => {
        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      }
    );
  }
}
