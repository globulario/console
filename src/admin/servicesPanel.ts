import { Panel } from "./panel";

import * as M from "materialize-css";
import "materialize-css/sass/materialize.scss";
import { ServiceDescriptor } from "../../../globular-mvc/node_modules/globular-web-client/services/services_pb";
import {
  getErrorMessage,
  getServicesDescriptor,
  setServicesDescriptor,
  getServiceBundles,
} from "../../../globular-mvc/node_modules/globular-web-client/api";

import {
  ConfigurationPanel,
  ConfigurationStringListLine,
  ConfigurationLongTextLine,
} from "./configurationPanel";

import {Model} from  "../../../globular-mvc/Model"
/**
 * This class is use to manage file on the server.
 */
export class ServiceManager extends Panel {
  private editable: boolean;
  private decriptors: Map<string, Map<string, Array<ServiceDescriptor>>>;

  // File panel constructor.
  constructor(id: string) {
    super(id);
    this.decriptors = new Map<string, Map<string, Array<ServiceDescriptor>>>();
    this.displayServices();
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
    this.editable = true;
  }

  onlogout() {
    // overide...
    this.editable = false;
  }

  displayServices() {
    // clear the panel before recreate information inside it.
    this.div.removeAllChilds();
    let content = this.div.appendElement({ tag: "div", class: "row" }).down();
    getServicesDescriptor(
      Model.globular,
      (descriptors: Array<ServiceDescriptor>) => {
        // Return if the ul is already define.
        if (document.getElementById("services_descriptors_ul") != undefined) {
          return;
        }

        this.decriptors = new Map<
          string,
          Map<string, Array<ServiceDescriptor>>
        >();
        descriptors.forEach((descriptor: ServiceDescriptor) => {
          if (!this.decriptors.has(descriptor.getPublisherid())) {
            this.decriptors.set(
              descriptor.getPublisherid(),
              new Map<string, Array<ServiceDescriptor>>()
            );
          }
          if (
            !this.decriptors
              .get(descriptor.getPublisherid())
              .has(descriptor.getId())
          ) {
            this.decriptors
              .get(descriptor.getPublisherid())
              .set(descriptor.getId(), new Array<ServiceDescriptor>());
          }
          this.decriptors
            .get(descriptor.getPublisherid())
            .get(descriptor.getId())
            .push(descriptor);
        });

        let ul = content
          .appendElement({
            tag: "ul",
            class: "collapsible",
            id: "services_descriptors_ul",
          })
          .down();
        this.decriptors.forEach(
          (descriptors: Map<string, Array<ServiceDescriptor>>, key: string) => {
            let li = ul.appendElement({ tag: "li" }).down();
            let header = li
              .appendElement({ tag: "div", class: "collapsible-header" })
              .down();
            header.appendElement({
              tag: "span",
              class: "col s12",
              innerHtml: key,
            });
            let body = li
              .appendElement({ tag: "div", class: "collapsible-body" })
              .down();
            this.displayService(body, descriptors);
          }
        );
        M.Collapsible.init(ul.element);
      },
      (err: any) => {
        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      }
    );
  }

  /**
   * Display the Service.
   * @param content
   * @param Service
   */
  displayService(
    content: any,
    descriptors: Map<string, Array<ServiceDescriptor>>
  ) {
    let ul = content
      .appendElement({
        tag: "ul",
        class: "collapsible",
        style: "box-shadow: none;",
      })
      .down();

    // reset the interface.
    descriptors.forEach(
      (descriptors: Array<ServiceDescriptor>, serviceId: string) => {
        // sort the descriptor and display on.

        descriptors.sort((a, b) =>
          a.getVersion() > b.getVersion()
            ? 1
            : b.getVersion() > a.getVersion()
            ? -1
            : 0
        );
        let li = ul.appendElement({ tag: "li" }).down();
        let header = li
          .appendElement({
            tag: "div",
            class: "collapsible-header",
            style: "align-items: center; padding: 0px;",
          })
          .down();
        header.appendElement({
          tag: "span",
          class: "col s8 m10",
          innerHtml: serviceId,
        });
        let versionSelector = header
          .appendElement({
            tag: "select",
            class: "col s4 m2",
            style: "display: inline;",
          })
          .down();

        let body = li
          .appendElement({ tag: "div", class: "collapsible-body" })
          .down();
        let editors = new Array<ServiceDescriptorEditor>();
        for (var i = 0; i < descriptors.length; i++) {
          let serviceDescriptor = new ServiceDescriptorEditor(descriptors[i]);
          let id =
            descriptors[i].getPublisherid() +
            "_" +
            descriptors[i].getId() +
            "_" +
            descriptors[i].getVersion() +
            "_descriptor_editor";
          serviceDescriptor.cardContent.element.id = id;

          versionSelector.appendElement({
            tag: "option",
            value: i,
            innerHtml: descriptors[i].getVersion(),
          });
          // set at moste recent version...
          serviceDescriptor.cardContent.element.style.display = "none"; // hide it from the begining
          if (document.getElementById(id) == undefined) {
            body.appendElement(serviceDescriptor.cardContent);
            editors.push(serviceDescriptor);
            if (this.editable) {
              // call on login in that case.
              serviceDescriptor.onlogin(Model.globular.config);
            }
          }
        }

        // display the last element.
        if (editors.length > 0) {
          editors[descriptors.length - 1].cardContent.element.style.display =
            "";
        }
        versionSelector.element.value = descriptors.length - 1;

        versionSelector.element.onclick = (evt: any) => {
          evt.stopPropagation();
        };

        versionSelector.element.onchange = (evt: any) => {
          for (var i = 0; i < editors.length; i++) {
            editors[i].cardContent.element.style.display = "none";
          }
          editors[
            versionSelector.element.selectedIndex
          ].cardContent.element.style.display = "";
        };
      }
    );
    M.Collapsible.init(ul.element);
  }

  refresh() {
    this.displayServices();
  }
}

class ServiceDescriptorEditor extends ConfigurationPanel {
  private descriptionConfigLine: ConfigurationLongTextLine;
  private dicoveriesConfigLine: ConfigurationStringListLine;
  private repositoriesConfigLine: ConfigurationStringListLine;
  private keywordsConfigLine: ConfigurationStringListLine;
  private descriptor: ServiceDescriptor;

  public get cardContent(): any {
    return this.div.getChildsByClassName("card-content")[0];
  }

  constructor(descriptor: ServiceDescriptor) {
    // empty configuration here.
    super(
      {
        Description: descriptor.getDescription(),
        Keywords: descriptor.getKeywordsList(),
        Discoveries: descriptor.getDiscoveriesList(),
        Repositories: descriptor.getRepositoriesList(),
      },
      descriptor.getId(),
      descriptor.getPublisherid() + "_" + descriptor.getId()
    );

    // keep descriptor in memory for save.
    this.descriptor = descriptor;

    // The The textual description.
    this.descriptionConfigLine = this.appendLongTextualConfig(
      "Description",
      "Description"
    );

    // Where the service information can be found.
    this.dicoveriesConfigLine = this.appendStringListConfig(
      "Discoveries",
      "Discoveries"
    );

    // Where the service bundle can be download.
    this.repositoriesConfigLine = this.appendStringListConfig(
      "Repositories",
      "Repositories"
    );

    // Display the list nameserver.
    this.keywordsConfigLine = this.appendStringListConfig(
      "Keywords",
      "Keywords"
    );

    this.div.getChildsByClassName("card-title")[0].element.style.display =
      "none";

    // Now I will retreive the list of bundle associated with this service.
    getServiceBundles(
      Model.globular,
      descriptor.getPublisherid(),
      descriptor.getName(),
      descriptor.getId(),
      descriptor.getVersion(),
      (bundles: Array<any>) => {
        // set table.
        let table = this.cardContent
          .appendElement({ tag: "div", class: "row" })
          .down()
          .appendElement({
            tag: "table",
            class: "responsive-table col s12 m8 offset-m2",
          })
          .down();

        // Set the table header.
        table
          .appendElement({ tag: "thead" })
          .down()
          .appendElement({ tag: "tr" })
          .down()
          .appendElement({ tag: "th", innerHtml: "Platform" })
          .appendElement({ tag: "th", innerHtml: "realased" })
          .appendElement({ tag: "th", innerHtml: "size" });

        let body = table.appendElement({ tag: "tbody" }).down();
        for (var i = 0; i < bundles.length; i++) {
          let row = table.appendElement({ tag: "tr" }).down();
          row.appendElement({ tag: "td", innerHtml: bundles[i].platform });

          // Set the file date
          let time =
            new Date(bundles[i].modified * 1000).toDateString() +
            " " +
            new Date(bundles[i].modified * 1000).toLocaleTimeString();
          row.appendElement({ tag: "td", innerHtml: time });

          // Set the file size of the bundle.
          let fileSizeDiv = row.appendElement({ tag: "td" }).down();
          if (bundles[i].size > 1024) {
            if (bundles[i].size > 1024 * 1024) {
              if (bundles[i].size > 1024 * 1024 * 1024) {
                let fileSize = bundles[i].size / (1024 * 1024 * 1024);
                fileSizeDiv.element.innerHTML = fileSize.toFixed(0) + " Gb";
              } else {
                let fileSize = bundles[i].size / (1024 * 1024);
                fileSizeDiv.element.innerHTML = fileSize.toFixed(0) + " Mb";
              }
            } else {
              let fileSize = bundles[i].size / 1024;
              fileSizeDiv.element.innerHTML = fileSize.toFixed(0) + " Kb";
            }
          } else {
            fileSizeDiv.element.innerHTML = bundles[i].size + " bytes";
          }
        }

        console.log(bundles);
      },
      (err: any) => {
        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      }
    );
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
    this.descriptionConfigLine.unlock();
    this.dicoveriesConfigLine.unlock();
    this.repositoriesConfigLine.unlock();
    this.keywordsConfigLine.unlock();
  }

  onlogout() {
    // overide...
    this.descriptionConfigLine.lock();
    this.dicoveriesConfigLine.lock();
    this.repositoriesConfigLine.lock();
    this.keywordsConfigLine.lock();
  }

  // That function is the same for all configuration panels.
  save() {
    super.save();
    // so here I will take the config object and set it back to a descriptor object...
    this.descriptor.setDescription(this.descriptionConfigLine.getValue());
    this.descriptor.setDiscoveriesList(this.dicoveriesConfigLine.getValue());
    this.descriptor.setRepositoriesList(this.repositoriesConfigLine.getValue());
    this.descriptor.setKeywordsList(this.keywordsConfigLine.getValue());

    setServicesDescriptor(
      Model.globular,
      this.descriptor,
      () => {
        M.toast({
          html: "Service " + this.descriptor.getId() + " was saved!",
          displayLength: 2000,
        });
      },
      (err: any) => {
        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      }
    );
  }

  // must be overide by each panel.
  cancel() {
    super.cancel();
  }
}
