
import {
  ConfigurationPanel,
  ConfigurationTextLine,
  ConfigurationMultipleOptionsSingleChoiceLine,
  ConfigurationStringListLine,
} from "./configurationPanel";
import {
  saveConfig,
  getErrorMessage,
} from "../../../globular-mvc/node_modules/globular-web-client/api";
import {IConfig} from "../../../globular-mvc/node_modules/globular-web-client"
import { LdapSyncServicePanel } from "./services/ldapSyncServicePanel";
import { Model } from "../../../globular-mvc/Model";

/**
 * That class will contain the general server information.
 */
export class GeneralInfoPanel extends ConfigurationPanel {
  private ldapSyncInfosLine: any;
  private ldapSyncPanels: Array<LdapSyncServicePanel>;
  private ldapServices: any;

  // Various configuration lines.
  private nameConfigLine: ConfigurationTextLine;
  private domainConfigLine: ConfigurationTextLine;
  private protocolConfigLine: ConfigurationMultipleOptionsSingleChoiceLine;
  private httpPortConfigLine: ConfigurationTextLine;
  private httpsPortConfigLine: ConfigurationTextLine;
  private discoveriesConfigLine: ConfigurationStringListLine;
  private domainsConfigLine: ConfigurationStringListLine;

  constructor(config: IConfig) {
    // Init the configuration panel informations.
    super(config, "General Server Informations", "general_info_panel");

    // Set the name propertie.
    this.nameConfigLine = this.appendTextualConfig("Name");

    // Set the domain propertie.
    this.domainConfigLine = this.appendTextualConfig("Domain");

    // Set the general server informations.
    this.protocolConfigLine = this.appendMultipleOptionsSingleChoiceConfig(
      "Protocol",
      ["http", "https"]
    );

    // Set the Ports..
    this.httpPortConfigLine = this.appendTextualConfig(
      "PortHttp",
      "Http Port",
      "number",
      1,
      0,
      65535
    );

    // Set the Ports..
    this.httpsPortConfigLine = this.appendTextualConfig(
      "PortHttps",
      "Https Port",
      "number",
      1,
      0,
      65535
    );

    // Display list of domains
    this.discoveriesConfigLine = this.appendStringListConfig(
      "Discoveries",
      "Services Discorvery"
    );

    // Display the list nameserver.
    this.domainsConfigLine = this.appendStringListConfig(
      "DNS",
      "Domain Name Servers"
    );

    this.ldapSyncPanels = new Array<any>();
    this.ldapServices = {};
  }

  createLdapSynInfoPanel(ul: any, info: any): any {
    // Here I will create the connections.
    let li = ul.prependElement({ tag: "li" }).down();

    // The ldap service object.
    let ldap = this.ldapServices[info.ldapSeriveId];

    if (ldap == undefined) {
      // Set to the first element.
      ldap = this.ldapServices[Object.keys(this.ldapServices)[0]];
      info.ldapSeriveId = ldap.Id;
    }

    let deleteBtn = li
      .appendElement({
        tag: "div",
        class: "collapsible-header",
        style: "display: flex; align-items: center;",
      })
      .down()
      .appendElement({
        tag: "span",
        id: "id_span",
        class: "col s6",
        innerHtml: ldap.Id,
      })
      .appendElement({
        tag: "select",
        id: "id_select",
        class: "col s6 browser-default col",
        value: ldap.Id,
        style: "display:none;",
      })
      .appendElement({ tag: "div", class: "col s6 right-align" })
      .down()
      .appendElement({
        tag: "i",
        class: "Small material-icons",
        style: "cursor: default;",
        innerHtml: "delete",
      })
      .down();

    // Here I will create the list of option from the list of ldap services.
    let idSelect = li.getChildById("id_select");
    let idSpan = li.getChildById("id_span");

    for (let id in this.ldapServices) {
      idSelect.appendElement({ tag: "option", value: id, innerHtml: id });
    }

    // display the span or the select box...
    if (this.ldapServices[info.ldapSeriveId] == undefined) {
      idSelect.element.style.display = "";
      idSpan.element.style.display = "none";
    }

    // init the select.
    M.FormSelect.init(idSelect);

    idSelect.element.onkeyup = (evt: any) => {
      // Set the value...
      idSpan.element.innerHTML = idSelect.element.value;
      if (evt.keyCode == 13) {
        idSpan.element.style.display = "";
        idSelect.element.style.display = "none";
      }
    };

    idSelect.element.onclick = (evt: any) => {
      evt.stopPropagation();
    };

    deleteBtn.element.onmouseover = function () {
      this.style.cursor = "pointer";
    };

    deleteBtn.element.onmouseout = function () {
      this.style.cursor = "default";
    };

    let syncInfoDiv = li
      .appendElement({ tag: "div", class: "collapsible-body" })
      .down()
      .appendElement({ tag: "div", id: "content" })
      .down();

    // Now I will create a new coniguration panel.
    let synInfoPanel = new LdapSyncServicePanel(info, "", "");
    synInfoPanel.setLdap(ldap);

    idSelect.element.onchange = () => {
      // Set the value...
      idSpan.element.innerHTML = idSelect.element.value;
      info.ldapSeriveId = idSelect.element.value;
      synInfoPanel.setLdap(this.ldapServices[info.ldapSeriveId]);
    };

    syncInfoDiv.appendElement(synInfoPanel.content);

    // keep the connction config panel.
    this.ldapSyncPanels.push(synInfoPanel);

    // Set the panel editable.
    synInfoPanel.onlogin(info);

    // redirect the config event...
    synInfoPanel.hasChange = () => {
      this.hasChange();
    };

    deleteBtn.element.onclick = (evt: any) => {
      evt.stopPropagation();
      let index = this.ldapSyncPanels.indexOf(synInfoPanel);
      this.ldapSyncPanels.splice(index, 1);
      delete this.config.ldapSyncPanels[info.Id];
      // Delete the connection div.
      li.delete();
      this.hasChange();
    };

    return li;
  }

  onlogout() {
    super.onlogout();
    if (this.ldapSyncInfosLine != null) {
      this.ldapSyncInfosLine.hide();
    }

    this.nameConfigLine.lock();
    this.domainConfigLine.lock();
    this.protocolConfigLine.lock();
    this.httpPortConfigLine.lock();
    this.httpsPortConfigLine.lock();
    this.discoveriesConfigLine.lock();
    this.domainsConfigLine.lock();
  }

  // create control...
  onlogin(config: any) {
    this.nameConfigLine.unlock();
    this.domainConfigLine.unlock();
    this.protocolConfigLine.unlock();
    this.httpPortConfigLine.unlock();
    this.httpsPortConfigLine.unlock();
    this.discoveriesConfigLine.unlock();
    this.domainsConfigLine.unlock();

    // set the config with the data.

    // Here I will try to get the ldap information to synchronise user/group
    for (var serviceId in config.Services) {
      if (config.Services[serviceId].Name == "ldap.LdapService") {
        this.ldapServices[serviceId] = config.Services[serviceId];
      }
    }

    // The ldap synchronization interface.
    if (
      Object.keys(this.ldapServices).length > 0 &&
      this.ldapSyncInfosLine == null
    ) {
      // Create an empty panel.
      this.ldapSyncInfosLine = this.appendEmptyConfig(
        "LdapSyncInfos",
        "LDAP Sync infos"
      );

      // So here I will get the list of synchronization informations.
      this.ldapSyncInfosLine.content.element.firstChild.className =
        "col s11 m3";
      this.ldapSyncInfosLine.content.appendElement({
        tag: "i",
        class: "material-icons col s1",
        id: "append_new_connection",
        innerHtml: "add",
      });

      let ul = this.ldapSyncInfosLine.content
        .appendElement({
          tag: "div",
          class: "switch col s12 m8",
          id: "connections_div",
        })
        .down()
        .appendElement({
          tag: "ul",
          class: "collapsible",
          style: "box-shadow: none;",
        })
        .down();

      // Now in each ul I will append the synchronization panel.
      for (var id in config.LdapSyncInfos) {
        let syncInfos = config.LdapSyncInfos[id];
        for (var i = 0; i < syncInfos.length; i++) {
          this.createLdapSynInfoPanel(ul, syncInfos[i]);
        }
      }

      M.Collapsible.init(ul.element);

      // The connection id.
      let newSyncInfoBtn = this.ldapSyncInfosLine.content.getChildById(
        "append_new_connection"
      );
      newSyncInfoBtn.element.onmouseover = function () {
        this.style.cursor = "pointer";
      };

      newSyncInfoBtn.element.onmouseout = function () {
        this.style.cursor = "default";
      };

      newSyncInfoBtn.element.onclick = () => {
        let connection = {
          ldapSeriveId: "",
          connectionId: "",
          refresh: 1,
          userSyncInfos: { base: "", query: "", id: "", email: "" },
          groupSyncInfos: { base: "", query: "", id: "" },
        };
        let li = this.createLdapSynInfoPanel(ul, connection);
      };
    } else {
      // display the panel
      if (this.ldapSyncInfosLine != null) {
        this.ldapSyncInfosLine.show();
      }
    }
  }

  // That function is the same for all configuration panels.
  save() {
    super.save();
    // Now I will save the configuration.
    saveConfig(
      Model.globular,
      this.config,
      (config: IConfig) => {
        M.toast({ html: "The configuration was saved!" });
        this.config = config; // set back the config...

        // Save the services.
        for (let i = 0; i < this.ldapSyncPanels.length; i++) {
          this.ldapSyncPanels[i].save();
        }
      },
      (err: any) => {
        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      }
    );
  }
}
