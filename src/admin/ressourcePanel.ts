import { Panel } from "./panel";
import { PermissionExplorer, PermissionPanel } from "./permissionPanel";
import {
  getAllActions,
  getErrorMessage,
  readAllActionPermissions,
  setActionPermission,
  removeActionPermission,
  getRessources,
  removeRessource,
} from "../../../globular-mvc/node_modules/globular-web-client/api";
import { randomUUID, rgbToHsl } from "./utility";
import { Ressource } from "../../../globular-mvc/node_modules/globular-web-client/ressource/ressource_pb";
import { Model } from "../../../globular-mvc/Model";

let emptyPath = "...";
/**
 * Panel to be use to manage ressource access other than files.
 * A ressource is somthing with a path. A path is a string with hierachy
 * where the symbol '/' is use as level marquer.
 */
export class RessourceManager extends Panel {
  private actionPermissionManager: ActionPermissionManager;
  private pathNavigator: RessourcePathNavigator;
  private ressourcePanel: RessourcesPanel;
  private permissionExplorer: PermissionExplorer;

  constructor() {
    super("ressource_manager");

    // create the ressource action permission manager.
    this.actionPermissionManager = new ActionPermissionManager();
    this.actionPermissionManager.setParent(this.div);

    // Create the ressource path navigator.
    this.pathNavigator = new RessourcePathNavigator();
    this.pathNavigator.setParent(this.div);

    // Create the ressource panel.
    this.ressourcePanel = new RessourcesPanel();
    this.ressourcePanel.setParent(this.div);

    // Create the permission explorer.
    this.permissionExplorer = new PermissionExplorer(
      "ressource_permission_explorer",
      this.div
    );

    // Emit when user click on the path
    Model.eventHub.subscribe(
      "set_ressource_path_event",
      (uuid: string) => {},
      (evt: any) => {
        // Set the dir to display.
        // Here I must retreive the directory from the given path.
        let dir = this.ressourcePanel.getRessourceDir(evt.path);

        this.pathNavigator.setPath(evt.path);
        this.permissionExplorer.setRessource(dir);
      },
      true
    );

    Model.eventHub.subscribe(
      "delete_ressource_event",
      (uuid: string) => {},
      (evt: any) => {
        // Set the dir to display.
        this.pathNavigator.setPath("");
        this.permissionExplorer.setRessource(null);
      },
      true
    );

    // Emit when user change the ressource directory.
    Model.eventHub.subscribe(
      "set_ressource_event",
      (uuid: string) => {},
      (evt: any) => {
        // Set the dir to display.
        // Here I must retreive the directory from the given path.
        let dir = this.ressourcePanel.getRessourceDir(evt.ressource.path);
        if (dir != undefined) {
          this.pathNavigator.setPath(evt.ressource.path);
        }
      },
      true
    );
  }
}

/**
 * That panel is use to set ressource action permission.
 * The action permission can be READ | WRITE | DELETE or any combination of those permission.
 */
class ActionPermissionManager extends Panel {
  // Set editable.
  private editable: boolean;

  // The ressource manager
  constructor() {
    super("ressource_action_permission_manager");
    this.editable = false;
    this.displayPermissions();
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
    this.editable = true;
    this.displayPermissions();
  }

  onlogout() {
    // overide...
    this.editable = false;
    this.displayPermissions();
  }

  displayPermissions() {
    this.div.removeAllChilds();

    // Display the header.
    let content = this.div
      .appendElement({
        tag: "div",
        class: "card col s12",
        style: "padding:10px;",
      })
      .down();

    content
      .appendElement({ tag: "div", class: "row hide-on-small-only" })
      .down()
      .appendElement({
        tag: "div",
        class: "col m6 l8",
        style: "border-right: 1px solid lightgray;",
        innerHtml: "Action(s)",
      })
      .appendElement({
        tag: "div",
        class: "col m6 l4",
        innerHtml: "Permission(s)",
      });

    if (this.editable) {
      // In that case I will append the action selector.
      getAllActions(
        Model.globular,
        (actions: Array<string>) => {
          // In that case I wil get the list of all operations.
          // Here I will append the actions list.
          let uuid = randomUUID();
          let action_input = content
            .prependElement({ tag: "div", class: "row" })
            .down()
            .appendElement({ tag: "div", class: "input-field col s8" })
            .down()
            .appendElement({
              tag: "input",
              class: "autocomplete",
              placeholder: "New Action",
              id: uuid,
            })
            .down();

          let data: any;
          data = {};
          for (var i = 0; i < actions.length; i++) {
            data[actions[i]] = null;
          }

          // The action call on auto complete...
          let onAutocomplete = () => {
            let action = action_input.element.value;
            setActionPermission(
              Model.globular,
              action,
              0,
              () => {
                M.toast({
                  html: "Action pemission " + action + " has been added!",
                  displayLength: 2000,
                });
                this.displayPermissions();
              },
              (err: any) => {
                M.toast({
                  html: getErrorMessage(err.message),
                  displayLength: 2000,
                });
              }
            );
          };

          // call after the ressource actions are retreived.
          let callback = () => {
            M.Autocomplete.init(document.getElementById(uuid), {
              data: data,
              onAutocomplete: onAutocomplete,
            });
          };

          readAllActionPermissions(
            Model.globular,
            (actionPermission: Array<any>) => {
              // remove existing permission...
              for (var i = 0; i < actionPermission.length; i++) {
                delete data[actionPermission[i].action];
              }
              callback(); // done remove already existing values.
            },
            (err: any) => {
              callback(); // simply go to callback.
            }
          );
        },
        (err: any) => {
          M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
        }
      );
    }

    // Display all permissions.
    readAllActionPermissions(
      Model.globular,
      (actionPermission: Array<any>) => {
        // remove existing permission...
        for (var i = 0; i < actionPermission.length; i++) {
          let action = actionPermission[i].action;
          let permission = actionPermission[i].permission;
          let div = content
            .appendElement({
              tag: "div",
              class: "row",
              style: "padding: 5px 10px 5px 10px; margin: 0px;",
            })
            .down();
          div.appendElement({
            tag: "div",
            id: "permission_div_0",
            class: "input-field col s12 m6 l8",
            style: "padding: 0px; margin-left: 10px; margin: 0px;",
            innerHtml: action,
          });
          let permissionDiv = div
            .appendElement({
              tag: "div",
              id: "permission_div_1",
              class: "input-field col s12 m6 l4",
              style:
                "padding: 0px; margin: 0px; display: flex; margin-bottom: 5px;",
            })
            .down();

          // Mouse over to make reading little easier.
          div.getChildById(
            "permission_div_0"
          ).element.onmouseenter = div.getChildById(
            "permission_div_1"
          ).element.onmouseenter = () => {
            div.getChildById("permission_div_0").element.style.backgroundColor =
              "#fafafa";
            div.getChildById("permission_div_1").element.style.backgroundColor =
              "#fafafa";
          };

          div.getChildById(
            "permission_div_0"
          ).element.onmouseleave = div.getChildById(
            "permission_div_1"
          ).element.onmouseleave = () => {
            div.getChildById("permission_div_0").element.style.backgroundColor =
              "";
            div.getChildById("permission_div_1").element.style.backgroundColor =
              "";
          };

          // Set the permission panel.
          new PermissionPanel(
            randomUUID(),
            permissionDiv,
            permission,
            // on change permission
            (permission_number: number) => {
              setActionPermission(
                Model.globular,
                action,
                permission_number,
                () => {
                  this.displayPermissions();
                  M.toast({
                    html: action + " permission was change!",
                    displayLength: 2000,
                  });
                },
                (err: any) => {
                  M.toast({
                    html: getErrorMessage(err.message),
                    displayLength: 2000,
                  });
                }
              );
            },
            // On delete callback
            () => {
              removeActionPermission(
                Model.globular,
                action,
                () => {
                  this.displayPermissions();
                  M.toast({
                    html: action + " permission was deleted!",
                    displayLength: 2000,
                  });
                },
                (err: any) => {
                  M.toast({
                    html: getErrorMessage(err.message),
                    displayLength: 2000,
                  });
                }
              );
            },
            this.editable
          );
        }
      },
      (err: any) => {
        /** nothing to do here... */
      }
    );
  }
}

/**
 *
 */
class RessourcePathNavigator extends Panel {
  private content: any;
  private path: string;

  constructor() {
    super(randomUUID());

    // Set the div style.

    // Set the content.
    this.content = this.div
      .appendElement({
        tag: "nav",
        class: "row card col s12 /*m10 offset-m1*/ indigo darken-4",
      })
      .down()
      .appendElement({ tag: "div", class: "nav-wrapper" })
      .down()
      .appendElement({ tag: "div" })
      .down()
      .appendElement({ tag: "div", class: "col s12" })
      .down();

    // Set root path...
    this.setPath("");
  }

  // The the path nivagator path.
  setPath(path: string) {
    this.content.removeAllChilds();

    this.path = "path";
    let values = path.split("/");
    values.unshift(emptyPath);

    let div = this.content
      .appendElement({ tag: "div", class: "col s12" })
      .down();

    for (var i = 0; i < values.length; i++) {
      if (values[i].length > 0) {
        let lnk = div
          .appendElement({
            tag: "a",
            innerHtml: values[i],
            class: "breadcrumb",
          })
          .down();

        lnk.element.onmouseenter = function () {
          this.style.cursor = "pointer";
        };
        lnk.element.onmouseleave = function () {
          this.style.cursor = "default";
        };
        let index = i + 1;

        lnk.element.onclick = () => {
          let path_ = "";
          for (var j = 1; j < index; j++) {
            path_ += values[j];
            if (j < index - 1) {
              path_ += "/";
            }
          }
          Model.eventHub.publish(
            "set_ressource_path_event",
            { path: path_ },
            true
          );
        };
      }
    }
  }
}

/**
 * A recursive tree structure to display and and manage ressource as tree.
 */
class RessourceDir {
  // Keep sub ressource dir.
  private _ressourceDirs: Map<string, RessourceDir>;
  public get ressourceDirs(): Map<string, RessourceDir> {
    return this._ressourceDirs;
  }

  // The list of ressource contain in the dir.
  private _ressources: Map<string, Ressource>;
  public get ressources(): Map<string, Ressource> {
    return this._ressources;
  }

  private _parent: RessourceDir;
  public get parent(): RessourceDir {
    return this._parent;
  }
  public set parent(value: RessourceDir) {
    this._parent = value;
  }

  // Return the name of the Ressource dir
  public get name(): string {
    return this.path.split("/")[this.path.split("/").length - 1];
  }

  // Keep ressource tree.
  constructor(public path: string) {
    // initialyse internal structure.
    this._ressourceDirs = new Map<string, RessourceDir>();
    this._ressources = new Map<string, Ressource>();
    this.parent = null;
  }

  appendRessource(ressource: Ressource) {
    // set the ressource.
    this._ressources.set(ressource.getName(), ressource);
  }

  appendRessourceDir(dir: RessourceDir) {
    dir.parent = this;
    this._ressourceDirs.set(dir.path, dir);
  }
}

/**
 * Ressource panel is use to display and manage ressources. A ressource can be anything
 * that has a name propertie and a path.
 */
class RessourcesPanel extends Panel {
  // The list of ressources...
  private ressources: Map<string, RessourceDir>;
  private editable: boolean;

  constructor() {
    super(randomUUID());

    // That will contain all ressource dir by path.
    this.ressources = new Map<string, RessourceDir>();

    // init the ressources and display it after.
    this.initRessources(() => {
      // Set the editable parameter.
      this.displayRessources(null);
    });

    // Display the div.
    Model.eventHub.subscribe(
      "delete_ressource_event",
      (uuid: string) => {},
      (evt: any) => {
        // Set the dir to display.
        this.initRessources(() => {
          // Set the editable parameter.
          this.displayRessources(null);
        });
      },
      true
    );

    // Display the div.
    Model.eventHub.subscribe(
      "set_ressource_event",
      (uuid: string) => {},
      (evt: any) => {
        // Set the dir to display.
        if (this.ressources.has(evt.ressource.path)) {
          this.displayRessources(this.ressources.get(evt.ressource.path));
        }
      },
      true
    );

    // Emit when user click on the path
    Model.eventHub.subscribe(
      "set_ressource_path_event",
      (uuid: string) => {},
      (evt: any) => {
        this.displayRessources(this.ressources.get(evt.path));
      },
      true
    );
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
    this.editable = true;
    let titleDiv = this.div.getChildById("name_title");
    if (titleDiv != undefined) {
      titleDiv.element.className = "col m6";
    }
  }

  onlogout() {
    // overide...
    this.editable = false;
    let titleDiv = this.div.getChildById("name_title");
    if (titleDiv != undefined) {
      titleDiv.element.className = "col m7";
    }
  }

  /**
   * Init a ressource and create it dir if not already exist.
   * @param ressource
   */
  initRessource(ressource: Ressource) {
    // I will create ressource dir from path and append it to it parent if it exist...
    let path = ressource.getPath();

    // Remove leading and trailling / symbols.
    if (path.startsWith("/")) {
      path = path.substr(1);
    }
    if (path.endsWith("/")) {
      path = path.substr(0, path.length - 1);
    }

    let paths = path.split("/");
    let path_ = "";
    let parent = "";
    for (var j = 0; j < paths.length; j++) {
      parent = path_;
      path_ += "/" + paths[j];
      if (!this.ressources.has(path_)) {
        let dir = new RessourceDir(path_);
        this.ressources.set(path_, dir);
      }

      // append the dir.
      if (this.ressources.has(parent)) {
        this.ressources
          .get(parent)
          .appendRessourceDir(this.ressources.get(path_));
      }
    }
    // append the ressource
    if (this.ressources.has(ressource.getPath())) {
      this.ressources.get(ressource.getPath()).appendRessource(ressource);
    }
  }

  initRessources(callback: () => void) {
    this.ressources.clear();
    this.div.removeAllChilds();
    getRessources(
      Model.globular,
      "",
      "",
      (ressources: Array<Ressource>) => {
        // So here I will inialyse the ressources.
        for (var i = 0; i < ressources.length; i++) {
          this.initRessource(ressources[i]);
        }

        callback(); // end of ressource initialisation.
      },
      (err: any) => {
        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      }
    );
  }

  getRessourceDir(dir: string) {
    return this.ressources.get(dir);
  }

  /**
   * display a ressources from a given path.
   * @param path
   */
  displayRessources(dir: RessourceDir) {
    // I will retreive all ressources.
    this.div.removeAllChilds(); // remove all childs...
    let content = this.div
      .appendElement({
        tag: "div",
        class: "card col s12",
        style: "padding: 10px;",
      })
      .down();

    content
      .appendElement({ tag: "div", class: "row hide-on-small-only" })
      .down()
      .appendElement({
        tag: "div",
        id: "name_title",
        class: "col m7",
        style: "border-right: 1px solid lightgray;",
        innerHtml: "Name",
      })
      .appendElement({
        tag: "div",
        id: "date_title",
        class: "col m3",
        style: "border-right: 1px solid lightgray;",
        innerHtml: "Date modified",
      })
      .appendElement({
        tag: "div",
        id: "size_title",
        class: "col m2",
        innerHtml: "Size",
      });

    if (this.editable) {
      this.div.getChildById("name_title").element.className = "col m6";
    } else {
      this.div.getChildById("name_title").element.className = "col m7";
    }

    // Now I will retreive all ressources from the server.
    if (dir == undefined) {
      // Here I will display all dir with not parent...
      this.ressources.forEach((dir: RessourceDir) => {
        if (dir.parent == null) {
          let ressourcePanel = new RessourcePanel(content, this.editable);
          ressourcePanel.setRessourceDir(dir);
        }
      });
    } else {
      // Set dir
      dir.ressourceDirs.forEach((dir: RessourceDir) => {
        let ressourcePanel = new RessourcePanel(content, this.editable);
        ressourcePanel.setRessourceDir(dir);
      });

      // Set ressource
      dir.ressources.forEach((r: Ressource) => {
        let ressourcePanel = new RessourcePanel(content, this.editable);
        ressourcePanel.setRessource(r);
      });
    }
  }
}

class RessourcePanel extends Panel {
  private dir: RessourceDir;
  private ressource: Ressource;
  private ico: any;
  private editable: boolean;

  constructor(parent: any, editable: boolean) {
    super(randomUUID());
    this.editable = editable;

    this.div = parent
      .appendElement({
        tag: "div",
        class: "row",
        style: "margin: 0px; padding: 5px;",
      })
      .down();

    Model.eventHub.subscribe(
      "set_ressource_dir_event",
      (uuid: string) => {},
      (evt: any) => {
        // Set the dir to display.
        this.setRessourceDir(evt.dir);
      },
      true
    );
  }

  // Here I will display a ressource dir...
  setRessourceDir(dir: RessourceDir) {
    // clear the div.
    this.div.removeAllChilds();

    this.dir = dir;
    this.ico = this.div
      .appendElement({
        tag: "i",
        class: "Small material-icons col s1",
        innerHtml: "folder",
      })
      .down();

    this.ico.element.onclick = () => {
      Model.eventHub.publish(
        "set_ressource_event",
        {
          id: "ressource_permission_explorer",
          ressource: { path: dir.path, name: dir.name },
        },
        true
      );
    };

    this.ico.element.onmouseenter = function () {
      this.style.cursor = "pointer";
    };

    this.ico.element.onmouseleave = function () {
      this.style.cursor = "default";
    };

    // The file name link...
    if (this.editable) {
      this.div
        .appendElement({
          tag: "span",
          innerHtml: dir.name,
          class: "col s10",
        })
        .down();

      // I will append a delete button in that particular case.
      let deleteFileBtn = this.div
        .appendElement({
          tag: "i",
          class: "Small material-icons col s1",
          innerHtml: "delete",
          style: "text-align: right;",
        })
        .down();

      deleteFileBtn.element.onmouseenter = function () {
        this.style.cursor = "pointer";
      };

      deleteFileBtn.element.onmouseleave = function () {
        this.style.cursor = "default";
      };

      deleteFileBtn.element.onclick = () => {
        removeRessource(
          Model.globular,
          dir.path,
          "",
          () => {
            Model.eventHub.publish("delete_ressource_event", {}, true);
            M.toast({
              html: "ressource for " + dir.path + " have been deleted!",
              displayLength: 2000,
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
    } else {
      this.div
        .appendElement({
          tag: "span",
          innerHtml: dir.name,
          class: "col s11",
        })
        .down();
    }
  }

  // Here I will display a ressource.
  setRessource(ressource: Ressource) {
    this.ressource = ressource;
    this.div.removeAllChilds();

    this.ico = this.div
      .appendElement({
        tag: "i",
        class: "Small material-icons col s1",
        innerHtml: "insert_drive_file",
      })
      .down();

    this.ico.element.onclick = () => {
      Model.eventHub.publish(
        "set_ressource_event",
        {
          id: "ressource_permission_explorer",
          ressource: {
            path: ressource.getPath() + "/" + ressource.getName(),
            name: ressource.getName(),
          },
        },
        true
      );
    };

    this.ico.element.onmouseenter = function () {
      this.style.cursor = "pointer";
    };

    this.ico.element.onmouseleave = function () {
      this.style.cursor = "default";
    };

    let nameSpan = this.div
      .appendElement({
        tag: "span",
        innerHtml: ressource.getName(),
        class: "col s11 m6",
      })
      .down();

    let lastModified = new Date(ressource.getModified() * 1000);
    this.div.appendElement({
      tag: "div",
      class: "col s6 m3",
      innerHtml:
        lastModified.toLocaleDateString() +
        " " +
        lastModified.toLocaleTimeString(),
    });

    let ressourceSizeDiv = this.div
      .appendElement({
        tag: "div",
        class: "col s6 m2",
      })
      .down();

    if (ressource.getSize() > 1024) {
      if (ressource.getSize() > 1024 * 1024) {
        if (ressource.getSize() > 1024 * 1024 * 1024) {
          let fileSize = ressource.getSize() / (1024 * 1024 * 1024);
          ressourceSizeDiv.element.innerHTML = fileSize.toFixed(0) + " Gb";
        } else {
          let fileSize = ressource.getSize() / (1024 * 1024);
          ressourceSizeDiv.element.innerHTML = fileSize.toFixed(0) + " Mb";
        }
      } else {
        let fileSize = ressource.getSize() / 1024;
        ressourceSizeDiv.element.innerHTML = fileSize.toFixed(0) + " Kb";
      }
    } else {
      ressourceSizeDiv.element.innerHTML = ressource.getSize() + " bytes";
    }

    if (this.editable) {
      // give space to delete button.
      nameSpan.element.className = "col s10 m5";

      // I will append a delete button in that particular case.
      let deleteFileBtn = this.div
        .appendElement({
          tag: "i",
          class: "Small material-icons col s1",
          innerHtml: "delete",
          style: "text-align: right;",
        })
        .down();

      deleteFileBtn.element.onmouseenter = function () {
        this.style.cursor = "pointer";
      };

      deleteFileBtn.element.onmouseleave = function () {
        this.style.cursor = "default";
      };

      deleteFileBtn.element.onclick = () => {
        // removeActionPermission
        removeRessource(
          Model.globular,
          ressource.getPath(),
          ressource.getName(),
          () => {
            Model.eventHub.publish("delete_ressource_event", {}, true);
            M.toast({
              html:
                "ressource for " + ressource.getName() + " have been deleted!",
              displayLength: 2000,
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
    }
  }

  onlogin(data: any) {
    // overide...
    this.editable = true;
    if (this.ressource != undefined) {
      this.setRessource(this.ressource);
    } else {
      this.setRessourceDir(this.dir);
    }
  }

  onlogout() {
    // overide...
    this.editable = false;
    if (this.ressource != undefined) {
      this.setRessource(this.ressource);
    } else {
      this.setRessourceDir(this.dir);
    }
  }
}
