import { Panel } from "./panel";
// User interface section.

import * as M from "materialize-css";
import "materialize-css/sass/materialize.scss";

import {
  getErrorMessage,
  getAllActions,
  readLogs,
  clearAllLog,
  deleteLogEntry,
} from "../../../globular-mvc/node_modules/globular-web-client/api";
import { LogInfo, LogType } from "../../../globular-mvc/node_modules/globular-web-client/ressource/ressource_pb";
import { fireResize } from "./utility.js";
import "@davecourtois/elementui/components/table/table.js";
import { Model } from "../../../globular-mvc/Model";

/**
 * Display log informations
 */
export class LogsPanel extends Panel {
  private editable: boolean;
  private ul: any;

  constructor(parent: any) {
    super("logs_panel");
    this.setParent(parent);
  }

  displayLogs(logs: Array<LogInfo>) {
    this.div.removeAllChilds();
    this.ul = this.div
      .appendElement({ tag: "ul", class: "collapsible" })
      .down();
    let logs_ = new Map<string, Array<LogInfo>>();
    for (var i = 0; i < logs.length; i++) {
      let header: any;
      let log = logs[i];
      if (!logs_.has(log.getMethod())) {
        logs_.set(log.getMethod(), new Array<LogInfo>());
        let li: any;
        if (log.getMethod().startsWith("/")) {
          li = this.ul.appendElement({ tag: "li" }).down();
        } else {
          // all service at top
          li = this.ul.prependElement({ tag: "li" }).down();
        }

        header = li
          .appendElement({
            tag: "div",
            class: "collapsible-header",
            id: log.getMethod() + "_header",
          })
          .down();
        header
          .appendElement({
            tag: "span",
            class: "col s12",
            innerHtml: log.getMethod(),
          })
          .up()
          .appendElement({
            tag: "div",
            class: "collapsible-body",
            id: log.getMethod() + "_body",
          })
          .down();

        if (this.editable) {
          header.element.firstChild.className = "col s11";
          let deleteBtn = header
            .appendElement({
              tag: "i",
              class: "material-icons col s1",
              style: "text-align: right;",
              innerHtml: "delete",
            })
            .down();
          deleteBtn.element.onclick = (evt: any) => {
            evt.stopPropagation();
            // Here I will
            let logs = logs_.get(log.getMethod()); // I will get the list of logs.
            for (var i = 0; i < logs.length; i++) {
              deleteLogEntry(
                Model.globular,
                logs[i],
                () => {
                  /** nothing to do here. */
                },
                (err: any) => {
                  M.toast({
                    html: getErrorMessage(err.message),
                    displayLength: 2000,
                  });
                }
              );
            }
            li.delete();
          };
        }
      }

      logs_.get(log.getMethod()).push(log);
      this.displayLog(log);
    }

    M.Collapsible.init(this.ul.element);
  }

  displayLog(info: LogInfo) {
    let body = this.ul.getChildById(info.getMethod() + "_body");
    if (body != undefined) {
      let msg = info.getMessage().replace(new RegExp("\r?\n", "g"), "<br />");
      if (msg.length == 0) {
        return;
      }

      let row = body
        .appendElement({
          tag: "div",
          class: "row ",
          style: "margin: 0px; border-bottom: solid 1px rgba(51,51,51,0.12);",
        })
        .down();
      let p: any;

      if (info.getMethod().startsWith("/")) {
        let time =
          new Date(info.getDate() * 1000).toDateString() +
          " " +
          new Date(info.getDate() * 1000).toLocaleTimeString();
        p = row
          .appendElement({ tag: "span", class: "col s3", innerHtml: time })
          .appendElement({
            tag: "p",
            class: "col s9",
            style: "overflow-y: scroll; margin-top: 0px;",
            innerHtml: msg,
          })
          .down();
      } else {
        p = row
          .appendElement({
            tag: "p",
            class: "col s12",
            style: "overflow-y: scroll; margin-top: 4px; margin-bottom: 4px;",
            innerHtml: msg,
          })
          .down();
      }

      if (this.editable == true) {
        let deleteBtn = row
          .appendElement({
            tag: "i",
            class: "material-icons col s1",
            style: "text-align: right;",
            innerHtml: "delete",
          })
          .down();

        deleteBtn.element.onmouseenter = function () {
          this.style.cursor = "pointer";
        };

        deleteBtn.element.onmouseout = function () {
          this.style.cursor = "default";
        };

        p.element.className = "col s11";
        deleteBtn.element.onclick = (evt: any) => {
          evt.stopPropagation();
          // Here I will
          deleteLogEntry(
            Model.globular,
            info,
            () => {
              /** nothing to do here. */
            },
            (err: any) => {
              M.toast({
                html: getErrorMessage(err.message),
                displayLength: 2000,
              });
            }
          );
          row.delete();
        };
      }
    }
  }

  onlogin(data: any) {
    // overide...
    this.editable = true;
  }

  onlogout() {
    // overide...
    this.editable = false;
  }
}

/**
 * This class is use to manage file on the server.
 */
export class LogManager extends Panel {
  // if true it means the log is editable.
  private logsDiv: any;
  private errorsDiv: any;
  private errorsPanel: LogsPanel;
  private servicesConsole: LogsPanel;
  private servicesConsoleDiv: any;
  private listeners: Map<string, string>;
  private logs: Array<LogInfo>;
  private errors: Array<LogInfo>;
  private consoles: Array<LogInfo>;

  // File panel constructor.
  constructor(id: string) {
    super(id);

    // Keep track of listeners.
    this.listeners = new Map<string, string>();
    this.logs = new Array<LogInfo>();
    this.errors = new Array<LogInfo>();
    this.consoles = new Array<LogInfo>();

    let ul = this.div
      .appendElement({ tag: "div", class: "row", style: "margin: 0px" })
      .down()
      .appendElement({ tag: "div", class: "col s12", style: "padding: 10px;" })
      .down()
      .appendElement({ tag: "ul", class: "tabs", id: "logs_tabs" })
      .down();

    // The log's table tab
    let logTab = ul
      .appendElement({ tag: "li", class: "tab col s4" })
      .down()
      .appendElement({
        tag: "a",
        href: "javascript:void(0)",
        innerHtml: "Log(s)",
        class: "grey-text text-darken-3 active",
        title: "table of gRPC actions activity.",
      })
      .down();

    this.logsDiv = this.div
      .appendElement({ tag: "div", class: "row" })
      .down()
      .appendElement({ tag: "div", class: "col s12" })
      .down();

    // The error's tab
    let errorTab = ul
      .appendElement({ tag: "li", class: "tab col s4" })
      .down()
      .appendElement({
        tag: "a",
        href: "javascript:void(0)",
        innerHtml: "Errors(s)",
        class: "grey-text text-darken-3",
        title: "error's information",
      })
      .down();

    this.errorsDiv = this.div
      .appendElement({ tag: "div", class: "row", style: "display: none;" })
      .down();
    let errorsPanel = this.errorsDiv
      .appendElement({ tag: "div", class: "col s12" })
      .down();
    this.errorsPanel = new LogsPanel(errorsPanel);

    // The services console tab.
    let servicesConsoleTab = ul
      .appendElement({ tag: "li", class: "tab col s4" })
      .down()
      .appendElement({
        tag: "a",
        href: "javascript:void(0)",
        innerHtml: "Services(s)",
        class: "grey-text text-darken-3",
        title: "sevices console output.",
      })
      .down();

    this.servicesConsoleDiv = this.div
      .appendElement({ tag: "div", class: "row", style: "display: none;" })
      .down();
    let servicesConsolePanel = this.servicesConsoleDiv
      .appendElement({ tag: "div", class: "col s12" })
      .down();
    this.servicesConsole = new LogsPanel(servicesConsolePanel);

    // Connect the event listener.
    let connectListener = (channel: string) => {
      Model.eventHub.subscribe(
        channel,
        (uuid: string) => {
          this.listeners.set(channel, uuid);
        },
        (evt: any) => {
          // When log about user is created.
          evt = JSON.parse(evt);
          let info = new LogInfo();

          info.setApplication(evt.application);
          info.setDate(parseInt(evt.date));
          info.setMethod(evt.method);
          info.setUserid(evt.userId);
          info.setUsername(evt.userName);
          info.setMessage(evt.message);

          // If the method start with / it's a grpc action log
          if (evt.method.startsWith("/")) {
            if (evt.message != undefined) {
              info.setType(LogType.ERROR_MESSAGE);
              this.errors.push(info);
              this.errorsPanel.displayLogs(this.errors);
              // diplay the message in the toast to get attention of the admin.
              M.toast({
                html: evt.message.replace(new RegExp("\r?\n", "g"), "<br />"),
                displayLength: 4000,
              });
            } else {
              info.setType(LogType.INFO_MESSAGE);
              this.logs.push(info);
              let row = new Array<any>();
              row.push(info.getMethod());
              row.push(info.getApplication());
              row.push(info.getUsername());
              row.push(new Date(info.getDate() * 1000));
              let table = <any>document.getElementById("log_table");
              if (table != undefined) {
                table.data.unshift(row);
                table.sort();
                table.refresh();
              }
              fireResize();
            }
          } else {
            // It's a services console log.
            info.setType(LogType.INFO_MESSAGE);
            this.consoles.push(info);
            this.servicesConsole.displayLogs(this.consoles);
            // diplay the message in the toast to get attention of the admin.
            if (evt.message != undefined) {
              M.toast({
                html: evt.message.replace(new RegExp("\r?\n", "g"), "<br />"),
                displayLength: 4000,
              });
            }
          }
        },
        false
      );
    };

    // Connect listeners.
    getAllActions(
      Model.globular,
      (actions) => {
        // Here I will connect a listener to each action....
        for (var i = 0; i < actions.length; i++) {
          connectListener(actions[i]);
        }

        // I will also connect the listener to each services.
        for (let serviceId in Model.globular.config.Services) {
          connectListener(serviceId);
        }
      },
      (err: any) => {
        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      }
    );

    // Here I will set the tabs logics.
    errorTab.element.onclick = () => {
      this.logsDiv.element.style.display = "none";
      this.errorsDiv.element.style.display = "block";
      this.servicesConsoleDiv.element.style.display = "none";
    };

    logTab.element.onclick = () => {
      this.errorsDiv.element.style.display = "none";
      this.logsDiv.element.style.display = "block";
      this.servicesConsoleDiv.element.style.display = "none";
    };

    servicesConsoleTab.element.onclick = () => {
      this.logsDiv.element.style.display = "none";
      this.errorsDiv.element.style.display = "none";
      this.servicesConsoleDiv.element.style.display = "block";
    };

    // overide...
    readLogs(
      Model.globular,
      "",
      (logs: Array<LogInfo>) => {
        for (var i = 0; i < logs.length; i++) {
          let info = logs[i];
          // if method start with / it's a gRpc action log
          if (info.getMethod().startsWith("/")) {
            if (info.getMessage().length > 0) {
              this.errors.push(info);
            } else {
              this.logs.push(info);
            }
          } else {
            // its a services console
            this.consoles.push(info);
          }
        }

        // display errors
        this.errorsPanel.displayLogs(this.errors);

        // display services console logs
        this.servicesConsole.displayLogs(this.consoles);

        // display the table.
        this.initLogTable();
      },
      (err: any) => {
        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      }
    );
  }

  // Create the table element that will be use to display log's
  initLogTable() {
    var table = <any>document.createElement("table-element");
    var header = <any>document.createElement("table-header-element");
    table.id = "log_table";
    header.fixed = true;

    // Create the dom table element
    table.appendChild(header);
    table.rowheight = 35;
    table.width = 1200;
    table.style.maxHeight = screen.height - 235 + "px"; // use the screen to calculate the table heigth.
    table.data = [];
    for (var i = 0; i < this.logs.length; i++) {
      let row = new Array<any>();
      row.push(this.logs[i].getMethod());
      row.push(this.logs[i].getApplication());
      row.push(this.logs[i].getUsername());
      row.push(new Date(this.logs[i].getDate() * 1000));
      table.data.push(row);
    }

    // Create the column headers.
    // The method
    var methodHeaderCell = <any>(
      document.createElement("table-header-cell-element")
    );
    methodHeaderCell.innerHTML =
      "<table-sorter-element></table-sorter-element><div>Method</div> <table-filter-element></table-filter-element>";
    methodHeaderCell.width = 400;
    header.appendChild(methodHeaderCell);

    // The application
    var applicationHeaderCell = <any>(
      document.createElement("table-header-cell-element")
    );
    applicationHeaderCell.innerHTML =
      "<table-sorter-element></table-sorter-element><div>Application</div> <table-filter-element></table-filter-element>";
    header.appendChild(applicationHeaderCell);

    // The application
    var userHeaderCell = <any>(
      document.createElement("table-header-cell-element")
    );
    userHeaderCell.innerHTML =
      "<table-sorter-element></table-sorter-element><div>User</div> <table-filter-element></table-filter-element>";
    header.appendChild(userHeaderCell);

    // The creation date
    var dateHeaderCell = <any>(
      document.createElement("table-header-cell-element")
    );
    dateHeaderCell.innerHTML =
      "<table-sorter-element></table-sorter-element><div>Date</div> <table-filter-element></table-filter-element>";
    dateHeaderCell.width = 300;
    dateHeaderCell.onrender = function (div: any, value: any) {
      if (value != undefined) {
        div.innerHTML = value.toDateString() + " " + value.toLocaleTimeString();
      }
    };
    header.appendChild(dateHeaderCell);

    this.logsDiv.element.appendChild(table);
    if (table.menu != null) {
      table.menu.getChildById(
        "delete-filtere-menu-item"
      ).element.action = () => {
        let values = table.getFilteredData();
        // Now I will reset the table data.
        table.data = [];
        let logs = new Array<LogInfo>();
        for (var i = 0; i < this.logs.length; i++) {
          // if the value is in filtered data I will not keep it...
          if (values.find((e: any) => e.index == i) == undefined) {
            let row = new Array<any>();
            row.push(this.logs[i].getMethod());
            row.push(this.logs[i].getApplication());
            row.push(this.logs[i].getUsername());
            row.push(new Date(this.logs[i].getDate() * 1000));
            table.data.push(row);
            logs.push(this.logs[i]);
          } else {
            // delete log from the logs.
            deleteLogEntry(
              Model.globular,
              this.logs[i],
              () => {},
              (err: any) => {
                M.toast({
                  html: getErrorMessage(err.message),
                  displayLength: 2000,
                });
              }
            );
          }
        }

        // Set back logs and refresh the table.
        this.logs = logs;
        table.filtered = [];
        table.sorted = [];
        table.sort();
        table.refresh();
        fireResize();
      };

      table.menu.getChildById(
        "delete-all-data-menu-item"
      ).element.action = () => {
        clearAllLog(
          Model.globular,
          LogType.INFO_MESSAGE,
          () => {
            M.toast({ html: "All logs are deleted!", displayLength: 2000 });
            table.data = [];
            table.filtered = [];
            table.sorted = [];
            table.refresh();
            fireResize();
          },
          (err: any) => {
            M.toast({
              html: getErrorMessage(err.message),
              displayLength: 2000,
            });
          }
        );
      };
    }
  }

  onlogin(data: any) {
    this.errorsPanel.onlogin(null); // be sure the editable variable is set.
    this.errorsPanel.displayLogs(this.errors);

    this.servicesConsole.onlogin(null);
    this.servicesConsole.displayLogs(this.consoles);

    document.getElementById("delete-filtere-menu-item").style.display = "block";
    document.getElementById("delete-all-data-menu-item").style.display =
      "block";
  }

  onlogout() {
    this.errorsPanel.onlogin(null); // be sure the editable variable is set.
    this.errorsPanel.displayLogs(this.errors);

    this.servicesConsole.onlogin(null);
    this.servicesConsole.displayLogs(this.consoles);

    document.getElementById("delete-filtere-menu-item").style.display = "none";
    document.getElementById("delete-all-data-menu-item").style.display = "none";
  }
}
