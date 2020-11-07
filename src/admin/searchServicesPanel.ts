import { Panel } from "./panel";
import {
  findServices,
  installService,
  getErrorMessage,
  uninstallService,
} from "../../../globular-mvc/node_modules/globular-web-client/api";
import { ServiceDescriptor } from "../../../globular-mvc/node_modules/globular-web-client/services/services_pb";
import { randomUUID } from "./utility";
import { Model } from "../../../globular-mvc/Model";

/**
 * Search panel is use to retreive services on registerd discoveries.
 */
export class SearchServicesPanel extends Panel {
  private resultsPanel: any;
  private isAdmin: boolean;

  constructor() {
    super("search_panel");
    // That will contain the results of the actual search.
    this.resultsPanel = this.div.appendElement({ tag: "div" }).down();
    this.isAdmin = false;
  }

  /**
   * That function is call when the user set press the enter button.
   * @param keywords
   */
  search(keywords: Array<string>) {
    this.resultsPanel.removeAllChilds();
    findServices(
      Model.globular,
      keywords,
      (services: Array<ServiceDescriptor>) => {
        // First of all I will regroup service by their publisher id and
        // service id.
        let servicesMap = new Map<String, Array<ServiceDescriptor>>();
        for (var i = 0; i < services.length; i++) {
          let id = services[i].getPublisherid() + "_" + services[i].getId();
          if (!servicesMap.has(id)) {
            servicesMap.set(id, new Array<ServiceDescriptor>());
          }
          servicesMap.get(id).push(services[i]);
        }

        // Now I will display the services.
        servicesMap.forEach((descriptors: Array<ServiceDescriptor>) => {
          // sort by version number.
          descriptors.sort((a, b) =>
            a.getVersion() > b.getVersion()
              ? 1
              : b.getVersion() > a.getVersion()
              ? -1
              : 0
          );
          let descriptorPanel = new ServiceDescriptorPanel(descriptors);
          descriptorPanel.setParent(this.resultsPanel);
          if (this.isAdmin) {
            descriptorPanel.onlogin(Model.globular.config);
          }
        });
      },
      (err: any) => {
        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      }
    );
  }

  onlogin(data: any) {
    this.isAdmin = true;
  }

  onlogout() {
    this.isAdmin = false;
  }
}

/**
 * Display the description of a services.
 */
class ServiceDescriptorPanel extends Panel {
  private descriptors: Array<ServiceDescriptor>;
  private index: number;
  private content: any;
  private installBtn: any;
  private uninstallBtn: any;
  private updateBtn: any;
  private btnGroup: any;
  private idInput: any;
  private idDiv: any;
  private versionDiv: any;

  constructor(descriptors: Array<ServiceDescriptor>) {
    // Set the panel id.
    super("service_description_panel_" + randomUUID());

    // keep track of the service diplayed.
    this.descriptors = descriptors;
    this.index = this.descriptors.length - 1; // by default display the last available version.

    // Set the index to install service version if any...
    this.setCurrentIndex();

    let install_btn_id = randomUUID();
    let id_input = randomUUID();
    let id_div = randomUUID();
    let uninstall_btn_id = randomUUID();
    let update_btn_id = randomUUID();

    // In case the service is uninstall...
    Model.eventHub.subscribe(
      "uninstall_service_event",
      (uuid: string) => {
        //console.log("start_service_event_" + id, uuid);
      },
      (evt: any) => {
        this.setButtons();
      },
      true
    );

    Model.eventHub.subscribe(
      "install_service_event",
      (uuid: string) => {
        //console.log("start_service_event_" + id, uuid);
      },
      (evt: any) => {
        this.setButtons();
      },
      true
    );

    // get the service descriptor.
    let descriptor = this.getServiceDescriptor();

    // Display general information.
    this.div
      .appendElement({ tag: "div", class: "row service_descriptor_panel" })
      .down()
      .appendElement({ tag: "div", class: "col s12 /*m10 offset-m1*/" })
      .down()
      .appendElement({ tag: "div", class: "card" })
      .down()
      .appendElement({ tag: "div", class: "card-content" })
      .down()
      .appendElement({
        tag: "span",
        class: "card-title",
        style: "font-size: medium; font-weight: inherit;",
        innerHtml: descriptor.getId(),
      })
      .appendElement({ tag: "div", id: "content" })
      // The action buttons.
      .appendElement({
        tag: "div",
        class: "card-action row",
        id: "btn_group",
        style:
          "text-align: right; display: none; align-items: baseline; justify-content: flex-end;",
      })
      .down()
      .appendElement({
        tag: "div",
        id: id_div,
        class: "input-field col s4 offset-s6",
      })
      .down()
      .appendElement({
        tag: "input",
        id: id_input,
        syle: "margin-left: 0px;",
        placeholder: "service id",
        title: "the is of the service on the server.",
        type: "text",
      })
      .appendElement({ tag: "label", for: id_input, innerHtml: "service id" })
      .up()
      .appendElement({
        tag: "a",
        id: install_btn_id,
        href: "javascript:void(0)",
        class: "waves-effect waves-light btn col s2",
        syle: "margin-left: 0px;",
        innerHtml: "Install",
      })
      .appendElement({
        tag: "a",
        id: update_btn_id,
        href: "javascript:void(0)",
        class: "waves-effect waves-light btn col s2",
        style: "display: none; margin-left: 0px;",
        innerHtml: "Update",
      })
      .appendElement({
        tag: "a",
        id: uninstall_btn_id,
        href: "javascript:void(0)",
        class: "waves-effect waves-light btn col s2",
        style: "display: none; margin-left: 0px;",
        innerHtml: "Uninstall",
      });

    this.installBtn = this.div.getChildById(install_btn_id);
    this.uninstallBtn = this.div.getChildById(uninstall_btn_id);
    this.updateBtn = this.div.getChildById(update_btn_id);
    this.content = this.div.getChildById("content");
    this.btnGroup = this.div.getChildById("btn_group");
    this.idInput = this.div.getChildById(id_input);
    this.idDiv = this.div.getChildById(id_div);

    let version_div_id = randomUUID();

    // Display the publisher id.
    this.content
      .appendElement({ tag: "div", class: "row" })
      .down()
      .appendElement({
        tag: "div",
        class: "col s12 m6",
        style: "height: 100%",
        innerHtml: "Publisher",
      })
      .appendElement({
        tag: "div",
        id: "publisher_div",
        class: "col s12 m6",
        innerHtml: descriptor.getPublisherid(),
      })
      .down();

    this.versionDiv = this.content
      .appendElement({ tag: "div", class: "row" })
      .down()
      .appendElement({
        tag: "div",
        class: "col s12 m6",
        style: "height: 100%",
        innerHtml: "Version",
      })
      .appendElement({
        tag: "div",
        id: version_div_id,
        class: "col s12 m6",
        innerHtml: descriptor.getVersion(),
      })
      .down();

    this.content
      .appendElement({ tag: "div", class: "row" })
      .down()
      .appendElement({
        tag: "div",
        class: "col s12 m6",
        style: "height: 100%",
        innerHtml: "Description",
      })
      .appendElement({
        tag: "div",
        id: "description_div",
        class: "col s12 m6",
        innerHtml: descriptor.getDescription(),
      })
      .down();

    // Now actions...
    this.installBtn.element.onclick = () => {
      // get the service descriptor.
      let descriptor = this.getServiceDescriptor();

      installService(
        Model.globular,
        descriptor.getDiscoveriesList()[0],
        descriptor.getId(),
        descriptor.getPublisherid(),
        descriptor.getVersion(),
        () => {
          // here I will refresh the token and set the full config...
          Model.eventHub.publish("install_service_event", descriptor.getId(), true);
          M.toast({
            html: "Service " + descriptor.getId() + " installed successfully!",
            displayLength: 3000,
          });
          // refresh the panel again to set the new service to admin mode.
          Model.eventHub.publish("onlogin", Model.globular.config, true);
        },
        (err: any) => {
          M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
        }
      );
    };

    this.idInput.element.onkeyup = (evt: any) => {
      let value = this.idInput.element.value.replace(/\s/g, "");

      if (value.length > 0) {
        this.installBtn.element.classList.remove("disabled");
      } else {
        this.installBtn.element.classList.add("disabled");
      }

      // get the service descriptor.
      let descriptor = this.getServiceDescriptor();

      if (evt.keyCode == 13) {
        installService(
          Model.globular,
          descriptor.getDiscoveriesList()[0],
          descriptor.getId(),
          descriptor.getPublisherid(),
          descriptor.getVersion(),
          () => {
            Model.eventHub.publish("install_service_event", descriptor.getId(), true);
            M.toast({
              html:
                "Service " + descriptor.getId() + " installed successfully!",
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
      }
    };
  }

  setCurrentIndex() {
    // Set the index to install service version if any...
    for (var i = 0; i < this.descriptors.length; i++) {
      if (Model.globular.config.Services[this.descriptors[i].getId()] != undefined) {
        if (
          Model.globular.config.Services[this.descriptors[i].getId()].PublisherId ==
          this.descriptors[i].getPublisherid()
        ) {
          if (
            Model.globular.config.Services[this.descriptors[i].getId()].Version ==
            this.descriptors[i].getVersion()
          ) {
            this.index = i;
            break;
          }
        }
      }
    }
  }

  getServiceDescriptor(): ServiceDescriptor {
    let descriptor: ServiceDescriptor;
    descriptor = this.descriptors[this.index]; // get the last element.
    return descriptor;
  }

  setButtons() {
    // Display textual input
    this.btnGroup.element.style.display = "flex";

    // look better without it... uncomment if necessary.
    M.updateTextFields();
    this.idInput.element.value = this.getServiceDescriptor().getId();

    if (
      Model.globular.config.Services[this.getServiceDescriptor().getId()] != undefined
    ) {
      // if the service is already install.
      let service =
        Model.globular.config.Services[this.getServiceDescriptor().getId()];
      this.uninstallBtn.element.style.display = "block";

      if (this.getServiceDescriptor().getVersion() != service.Version) {
        this.updateBtn.element.style.display = "block";
      } else {
        this.updateBtn.element.style.display = "none";
      }

      this.installBtn.element.style.display = "none";
      this.idDiv.element.style.display = "none";

      // The unistall action.
      this.uninstallBtn.element.onclick = (evt: any) => {
        evt.stopPropagation();
        uninstallService(
          Model.globular,
          service,
          true,
          () => {
            Model.eventHub.publish(
              "uninstall_service_event",
              this.getServiceDescriptor().getId(),
              true
            );
            M.toast({
              html:
                "Service " +
                this.getServiceDescriptor().getId() +
                " was uninstalled successfully!",
              displayLength: 3000,
            });
          },
          (err: any) => {
            M.toast({
              html: getErrorMessage(err.message),
              displayLength: 2000,
            });
          }
        );
      };

      // The update action.
      this.updateBtn.element.onclick = (evt: any) => {
        evt.stopPropagation();
        uninstallService(
          Model.globular,
          service,
          false,
          () => {
            // Now I will simply install the service.
            this.installBtn.element.click();
            this.updateBtn.element.style.display = "none";
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
      this.installBtn.element.style.display = "";
      this.idDiv.element.style.display = "";
      this.uninstallBtn.element.style.display = "none";
      this.updateBtn.element.style.display = "none";
    }

    // So here I will get the list of available verisons and diplay it in a select element.
    if (this.descriptors.length > 0) {
      this.versionDiv.removeAllChilds();
      this.versionDiv.element.innerHTML = "";
      let versionSelector = this.versionDiv
        .appendElement({ tag: "select", style: "display: block;" })
        .down();
      this.descriptors.forEach((descriptor: ServiceDescriptor, index) => {
        versionSelector.appendElement({
          tag: "option",
          value: index,
          innerHtml: descriptor.getVersion(),
        });
      });

      // Set the value to current version...
      versionSelector.element.value = this.index;

      versionSelector.element.onchange = () => {
        this.index = versionSelector.element.value;
        this.setButtons();
      };

      versionSelector.element.onclick = (evt: any) => {
        evt.stopPropagation();
      };
    }
  }

  onlogin(data: any) {
    // keep a pointer to the full configuration.
    this.setButtons();
  }

  onlogout() {
    // display values.
    this.btnGroup.element.style.display = "none";
    this.setCurrentIndex();
    this.versionDiv.element.innerHTML = this.getServiceDescriptor().getVersion(); // set back the actual version.
  }
}
