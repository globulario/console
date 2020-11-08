import { Panel } from "./panel";
import {
  getErrorMessage,
  getRessourcePermissions,
  getAllAccountsInfo,
  setRessourcePermission,
  OwnerType,
  getAllRoles,
  getAllApplicationsInfo,
  deleteRessourcePermissions,
  getRessourceOwners,
  setRessourceOwners,
  deleteRessourceOwners,
} from "../../../globular-mvc/node_modules/globular-web-client/api";
import { randomUUID } from "./utility";
import { RessourcePermission } from "../../../globular-mvc/node_modules/globular-web-client/ressource/ressource_pb";
import { Model } from "../../../globular-mvc/Model";

/**
 * Control permission.
 */
export class PermissionExplorer extends Panel {
  // The file information.
  private ressourceInfo: any;
  private editable: boolean;

  private _content: any;
  public get content(): any {
    return this._content;
  }
  public set content(value: any) {
    this._content = value;
  }

  private _usersPermissionSection: any;
  public get usersPermissionSection(): any {
    return this._usersPermissionSection;
  }
  public set usersPermissionSection(value: any) {
    this._usersPermissionSection = value;
  }

  private _applciationsPermissionSection: any;
  public get applciationsPermissionSection(): any {
    return this._applciationsPermissionSection;
  }
  public set applciationsPermissionSection(value: any) {
    this._applciationsPermissionSection = value;
  }

  private _rolesPermissionSection: any;
  public get rolesPermissionSection(): any {
    return this._rolesPermissionSection;
  }
  public set rolesPermissionSection(value: any) {
    this._rolesPermissionSection = value;
  }

  private owners: Array<string>;
  private path: string;

  // values localy...
  private accounts: any;
  private roles: any;
  private permissions: any; // contain the list of permission.
  private applications: any; // Contain the list of application

  constructor(id: string, parent?: any) {
    super(id);
    if (parent != undefined) {
      parent.appendElement(this.div);
    }

    this.div.element.className = "card col s12 /*m10 offset-m1*/";
    this.div.element.style.display = "none";

    this.accounts = {};
    this.roles = {};
    this.applications = {};
    this.owners = new Array<string>();

    // Initilalyse roles
    getAllRoles(
      Model.globular,
      (roles: any) => {
        for (var i = 0; i < roles.length; i++) {
          this.roles[roles[i]._id] = roles[i];
        }
      },
      () => {}
    );

    getAllApplicationsInfo(
      Model.globular,
      (applications: any) => {
        for (var i = 0; i < applications.length; i++) {
          this.applications[applications[i]._id] = applications[i];
        }
      },
      () => {}
    );

    // Initilalyse accounts
    getAllAccountsInfo(
      Model.globular,
      (accounts: any) => {
        for (var i = 0; i < accounts.length; i++) {
          this.accounts[accounts[i]._id] = accounts[i];
        }
      },
      () => {}
    );

    // event to react to.
    Model.eventHub.subscribe(
      "set_ressource_event",
      (uuid: string) => {},
      (evt: any) => {
        if (evt.id != this.id) {
          return;
        }

        // Set the dir to display.
        // Here I must retreive the directory from the given path.
        getRessourcePermissions(
          Model.globular,
          evt.ressource.path,
          (permissions: Array<RessourcePermission>) => {
            this.path = evt.ressource.path;
            this.permissions = permissions;
            this.setRessource(evt.ressource);
          },
          (err: any) => {
            console.log(err);
            M.toast({
              html: getErrorMessage(err.message),
              displayLength: 2000,
            });
          }
        );
      },
      true
    );

    Model.eventHub.subscribe(
      "set_file_event",
      (uuid: string) => {},
      (evt: any) => {
        if (evt.id != this.id) {
          return;
        }

        // Set the dir to display.
        // Here I must retreive the directory from the given path.
        getRessourcePermissions(
          Model.globular,
          evt.file.path,
          (permissions: Array<RessourcePermission>) => {
            this.path = evt.file.path;
            this.permissions = permissions;
            this.setRessource(evt.file);
          },
          (err: any) => {
            console.log(err);
            M.toast({
              html: getErrorMessage(err.message),
              displayLength: 2000,
            });
          }
        );
      },
      true
    );
  }

  // Set the file or the directory.
  setRessource(ressourceInfo: any, callback?: () => void) {
    if (ressourceInfo == undefined) {
      this.div.element.style.display = "none";
      this.div.element.innerHTML = "";
      return;
    }

    if (ressourceInfo.name == "webroot") {
      this.div.element.style.display = "none";
      this.div.element.innerHTML = "";
      return;
    }

    this.ressourceInfo = ressourceInfo;
    this.div.element.style.display = "";
    this.div.element.innerHTML = "";

    // The name of the file.
    this.content = this.div
      .appendElement({ tag: "div", class: "row" })
      .down()
      .appendElement({ tag: "div", class: "card-content" })
      .down()
      .appendElement({
        tag: "span",
        id: "card-title",
        style: "font-size: medium; font-weight: inherit;",
        innerHtml: ressourceInfo.name,
        class: "card-title",
      })
      .appendElement({ tag: "div" })
      .down();

    // Now I will get the permission for the file/folder... and diplay it.
    // Here I must retreive the directory from the given path.
    getRessourcePermissions(
      Model.globular,
      this.ressourceInfo.path,
      (permissions: Array<RessourcePermission>) => {
        this.path = this.ressourceInfo.path;
        this.permissions = permissions;

        // I will set the owner information here.
        getRessourceOwners(
          Model.globular,
          this.ressourceInfo.path,
          (owners: Array<string>) => {
            this.owners = owners;
            this.displayPermissions();
          },
          () => {
            this.owners = new Array<string>();
            this.displayPermissions();
            if (callback != undefined) {
              callback(); // the ressource is now set.
            }
          }
        );
      },
      (err: any) => {
        console.log(err);
        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      }
    );
  }

  // Display the list of owners.
  displayOwner(content: any, owner: any) {
    let div = content.appendElement({ tag: "div" }).down();
    if (!this.editable) {
      // Here I will set icons...
      let div_ = div
        .appendElement({
          tag: "div",
          class: "col s12",
          style: "display: flex; margin-bottom: 5px;",
          innerHtml: owner.name,
        })
        .down();
      div_.element.onmouseenter = function () {
        this.style.backgroundColor = "#fafafa";
      };
      div_.element.onmouseleave = function () {
        this.style.backgroundColor = "";
      };
    } else {
      let div_ = div
        .appendElement({
          tag: "div",
          class: "col s11",
          style: "display: flex; margin-bottom: 5px;",
          innerHtml: owner.name,
        })
        .down();
      let deleteBtn = div
        .appendElement({
          tag: "i",
          class: "tiny material-icons col s1",
          innerHtml: "remove",
        })
        .down();

      div_.element.onmouseenter = function () {
        this.style.backgroundColor = "#fafafa";
      };

      div_.element.onmouseleave = function () {
        this.style.backgroundColor = "";
      };

      deleteBtn.element.onmouseenter = () => {
        div_.element.style.backgroundColor = "#fafafa";
        deleteBtn.element.style.backgroundColor = "#fafafa";
        deleteBtn.element.style.cursor = "pointer";
      };

      deleteBtn.element.onmouseleave = () => {
        div_.element.style.backgroundColor = "";
        deleteBtn.element.style.backgroundColor = "";
        deleteBtn.element.style.cursor = "default";
      };

      deleteBtn.element.onclick = () => {
        // Delete the display.
        deleteRessourceOwners(
          Model.globular,
          this.path,
          owner._id,
          () => {
            this.owners.splice(this.owners.indexOf(owner._id), 1);
            div.delete();
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
    }
  }

  // Display ressource permission
  displayPermission(
    content: any,
    permission: any,
    owner: any,
    ownerType: OwnerType
  ) {
    let div = content.appendElement({ tag: "div" }).down();
    let ownerName = "";
    if (ownerType == OwnerType.Application) {
      ownerName = owner._id;
    } else {
      ownerName = owner.name;
    }

    let permissionDiv = div
      .appendElement({
        tag: "div",
        id: "permission_div_0",
        class: "col s12 m8",
        style: "display: flex; margin-bottom: 5px;",
      })
      .down()
      .appendElement({ tag: "span", innerHtml: ownerName })
      .appendElement({
        tag: "span",
        innerHtml: permission.path,
        style: "flex-grow: 1; margin-left: 15px;",
      })
      .up()
      .appendElement({
        tag: "div",
        id: "permission_div_1",
        class: "col s12 m4",
        style: "display: flex; margin-bottom: 5px;",
      })
      .down(); // Now the permission itself.

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
      div.getChildById("permission_div_0").element.style.backgroundColor = "";
      div.getChildById("permission_div_1").element.style.backgroundColor = "";
    };

    // Create the permission panel.
    new PermissionPanel(
      randomUUID(),
      permissionDiv,
      permission.number,
      (permission_number: number) => {
        setRessourcePermission(
          Model.globular,
          permission.path,
          owner._id,
          ownerType,
          permission_number,
          () => {
            getRessourcePermissions(
              Model.globular,
              this.ressourceInfo.path,
              (permissions: Array<RessourcePermission>) => {
                this.path = this.ressourceInfo.path;
                this.permissions = permissions;
                this.displayPermissions();
              },
              (err: any) => {
                M.toast({
                  html: getErrorMessage(err.message),
                  displayLength: 2000,
                });
              }
            );
            M.toast({
              html: "File permission was saved!",
              displayLength: 2000,
            });
          },
          (err: any) => {
            console.log(err);

            M.toast({
              html: getErrorMessage(err.message),
              displayLength: 2000,
            });
          }
        );
      },
      () => {
        deleteRessourcePermissions(
          Model.globular,
          permission.path,
          owner._id,
          () => {
            getRessourcePermissions(
              Model.globular,
              this.ressourceInfo.path,
              (permissions: Array<RessourcePermission>) => {
                this.path = this.ressourceInfo.path;
                this.permissions = permissions;
                this.displayPermissions();
              },
              (err: any) => {
                M.toast({
                  html: getErrorMessage(err.message),
                  displayLength: 2000,
                });
              }
            );
            M.toast({
              html: "File permission was deleted!",
              displayLength: 2000,
            });
          },
          (err: any) => {
            console.log(err);

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

  // Display file permissions
  displayPermissions() {
    this.content.removeAllChilds();

    let ownersPermissionSection = this.content
      .appendElement({ tag: "div", class: "row" })
      .down();
    let ownersPermissionRow = ownersPermissionSection
      .appendElement({
        tag: "h6",
        innerHtml: "Owner(s)",
        class: "col s12",
        style: "padding-bottom: 15px;",
      })
      .down()
      .appendElement({ tag: "div", class: "row", style: "margin-bottom: 0px;" })
      .down();

    // Here I will create the tree section where the permission can belong to.
    this.usersPermissionSection = this.content
      .appendElement({ tag: "div", class: "row" })
      .down();
    let inputUserRow = this.usersPermissionSection
      .appendElement({
        tag: "h6",
        innerHtml: "User(s) Permission",
        class: "col s12",
        style: "padding-bottom: 15px;",
      })
      .down()
      .appendElement({ tag: "div", class: "row", style: "margin-bottom: 0px;" })
      .down();

    if (this.editable == true) {
      // here I will append the list of all account...
      getAllAccountsInfo(
        Model.globular,
        (accounts: Array<any>) => {
          // The user permission input.
          let user_input = inputUserRow
            .appendElement({ tag: "div", class: "input-field col s4" })
            .down()
            .appendElement({
              tag: "input",
              class: "autocomplete",
              placeholder: "Append User Permission",
              id: randomUUID(),
            })
            .down();

          let data_0: any;
          data_0 = {};

          // Now I will take the data
          if (this.permissions != undefined) {
            // Here If the user already have a permission for that file I will not append it into the list.
            for (var i = 0; i < accounts.length; i++) {
              let exist = false;
              for (var j = 0; j < this.permissions.length; j++) {
                let permission = this.permissions[j];
                if (permission.user.length != null) {
                  if (permission.user == accounts[i]._id) {
                    exist = true;
                    break;
                  }
                }
              }
              // append the account if it not already exist.
              if (!exist) {
                data_0[accounts[i].name] = null;
                this.accounts[accounts[i].name] = accounts[i];
              }
            }
          } else {
            // Append all the account in that case.
            for (var i = 0; i < accounts.length; i++) {
              data_0[accounts[i].name] = null;
              this.accounts[accounts[i].name] = accounts[i];
            }
          }

          // on auto complete.
          let onAutocomplete_0 = () => {
            // create new permission for user
            let username = user_input.element.value;
            setRessourcePermission(
              Model.globular,
              this.ressourceInfo.path,
              this.accounts[username]._id,
              OwnerType.User,
              0,
              () => {
                // New permission was created...
                getRessourcePermissions(
                  Model.globular,
                  this.ressourceInfo.path,
                  (permissions: Array<RessourcePermission>) => {
                    this.path = this.ressourceInfo.path;
                    this.permissions = permissions;
                    this.displayPermissions();
                  },
                  (err: any) => {
                    console.log(err);

                    M.toast({
                      html: getErrorMessage(err.message),
                      displayLength: 2000,
                    });
                  }
                );

                M.toast({
                  html: "New permission was created!",
                  displayLength: 2000,
                });
              },
              (err: any) => {
                console.log(err);
                M.toast({
                  html: getErrorMessage(err.message),
                  displayLength: 2000,
                });
              }
            );
          };

          M.Autocomplete.init(document.getElementById(user_input.element.id), {
            data: data_0,
            onAutocomplete: onAutocomplete_0,
          });
          // The owner input.
          let owner_input = ownersPermissionRow
            .appendElement({ tag: "div", class: "input-field col s4" })
            .down()
            .appendElement({
              tag: "input",
              class: "autocomplete",
              placeholder: "Append User Permission",
              id: randomUUID(),
            })
            .down();

          let data_1: any;
          data_1 = {};

          // Here If the user already have a permission for that file I will not append it into the list.
          for (var i = 0; i < accounts.length; i++) {
            let exist = false;
            for (var j = 0; j < this.owners.length; j++) {
              if (this.owners[j] == accounts[i]._id) {
                exist = true;
                break;
              }
            }
            // append the account if it not already exist.
            if (!exist) {
              data_1[accounts[i].name] = null;
            }
          }

          // Set the owner...
          let onAutocomplete_1 = () => {
            // create new permission for user
            let username = owner_input.element.value;
            setRessourceOwners(
              Model.globular,
              this.path,
              this.accounts[username]._id,
              () => {
                // simply redraw the whole thing.
                this.owners.push(this.accounts[username]._id);
                this.displayPermissions();
              },
              (err: any) => {
                console.log(err);
                M.toast({
                  html: getErrorMessage(err.message),
                  displayLength: 2000,
                });
              }
            );
          };

          M.Autocomplete.init(document.getElementById(owner_input.element.id), {
            data: data_1,
            onAutocomplete: onAutocomplete_1,
          });
        },
        (err: any) => {
          console.log(err);

          M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
        }
      );
    }

    this.rolesPermissionSection = this.content
      .appendElement({ tag: "div", class: "row", style: "padding: 0px" })
      .down();
    let inputRoleRow = this.rolesPermissionSection
      .appendElement({
        tag: "h6",
        innerHtml: "Role(s) Permission",
        class: "col s12",
        style: "padding-bottom: 15px;",
      })
      .down()
      .appendElement({ tag: "div", class: "row", style: "margin-bottom: 0px;" })
      .down();

    if (this.editable == true) {
      // here I will append the list of all account...
      getAllRoles(
        Model.globular,
        (roles: Array<any>) => {
          let role_input = inputRoleRow
            .appendElement({ tag: "div", class: "input-field col s4" })
            .down()
            .appendElement({
              tag: "input",
              class: "autocomplete",
              placeholder: "Append Role Permission",
              id: randomUUID(),
            })
            .down();

          let data: any;
          data = {};

          // Now I will take the data
          if (this.permissions != undefined) {
            // Here If the user already have a permission for that file I will not append it into the list.
            for (var i = 0; i < roles.length; i++) {
              let exist = false;
              for (var j = 0; j < this.permissions.length; j++) {
                let permission = this.permissions[j];
                if (permission.role.length != null) {
                  if (permission.role == roles[i]._id) {
                    exist = true;
                    break;
                  }
                }
              }
              // append the account if it not already exist.
              if (!exist) {
                data[roles[i].name] = null;
                this.roles[roles[i].name] = roles[i];
              }
            }
          } else {
            // Append all the account in that case.
            for (var i = 0; i < roles.length; i++) {
              data[roles[i].name] = null;
              this.roles[roles[i].name] = roles[i];
            }
          }

          // on auto complete.
          let onAutocomplete = () => {
            // create new permission for user
            let rolename = role_input.element.value;
            setRessourcePermission(
              Model.globular,
              this.ressourceInfo.path,
              this.roles[rolename]._id,
              OwnerType.Role,
              0,
              () => {
                // New permission was created...
                getRessourcePermissions(
                  Model.globular,
                  this.ressourceInfo.path,
                  (permissions: Array<RessourcePermission>) => {
                    this.path = this.ressourceInfo.path;
                    this.permissions = permissions;
                    this.displayPermissions();
                  },
                  (err: any) => {
                    console.log(err);

                    M.toast({
                      html: getErrorMessage(err.message),
                      displayLength: 2000,
                    });
                  }
                );

                M.toast({
                  html: "New permission was created!",
                  displayLength: 2000,
                });
              },
              (err: any) => {
                console.log(err);

                M.toast({
                  html: getErrorMessage(err.message),
                  displayLength: 2000,
                });
              }
            );
          };

          M.Autocomplete.init(document.getElementById(role_input.element.id), {
            data: data,
            onAutocomplete: onAutocomplete,
          });
        },
        (err: any) => {
          console.log(err);

          M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
        }
      );
    }

    this.applciationsPermissionSection = this.content
      .appendElement({ tag: "div", class: "row", style: "padding: 0px" })
      .down();
    let inputApplicationRow = this.applciationsPermissionSection
      .appendElement({
        tag: "h6",
        innerHtml: "Application(s) Permission",
        class: "col s12",
        style: "padding-bottom: 15px;",
      })
      .down()
      .appendElement({ tag: "div", class: "row", style: "margin-bottom: 0px;" })
      .down();

    if (this.editable == true) {
      // here I will append the list of all account...
      getAllApplicationsInfo(
        Model.globular,
        (applications: Array<any>) => {
          let application_input = inputApplicationRow
            .appendElement({ tag: "div", class: "input-field col s4" })
            .down()
            .appendElement({
              tag: "input",
              class: "autocomplete",
              placeholder: "Append Application Permission",
              id: randomUUID(),
            })
            .down();

          let data: any;
          data = {};

          // Now I will take the data
          if (this.permissions != undefined) {
            // Here If the user already have a permission for that file I will not append it into the list.
            for (var i = 0; i < applications.length; i++) {
              let exist = false;
              for (var j = 0; j < this.permissions.length; j++) {
                let permission = this.permissions[j];
                if (permission.application.length != null) {
                  if (permission.application == applications[i]._id) {
                    exist = true;
                    break;
                  }
                }
              }
              // append the application if it not already exist.
              if (!exist) {
                data[applications[i]._id] = null;
              }
            }
          } else {
            // Append all the application in that case.
            for (var i = 0; i < applications.length; i++) {
              data[applications[i]._id] = null;
            }
          }

          // on auto complete.
          let onAutocomplete = () => {
            // create new permission for user
            let applicationName = application_input.element.value;
            setRessourcePermission(
              Model.globular,
              this.ressourceInfo.path,
              applicationName,
              OwnerType.Application,
              0,
              () => {
                // New permission was created...
                getRessourcePermissions(
                  Model.globular,
                  this.ressourceInfo.path,
                  (permissions: Array<RessourcePermission>) => {
                    this.path = this.ressourceInfo.path;
                    this.permissions = permissions;
                    this.displayPermissions();
                  },
                  (err: any) => {
                    console.log(err);

                    M.toast({
                      html: getErrorMessage(err.message),
                      displayLength: 2000,
                    });
                  }
                );

                M.toast({
                  html: "New permission was created!",
                  displayLength: 2000,
                });
              },
              (err: any) => {
                console.log(err);

                M.toast({
                  html: getErrorMessage(err.message),
                  displayLength: 2000,
                });
              }
            );
          };

          M.Autocomplete.init(
            document.getElementById(application_input.element.id),
            {
              data: data,
              onAutocomplete: onAutocomplete,
            }
          );
        },
        (err: any) => {
          console.log(err);

          M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
        }
      );
    }

    // display the permission in the section...
    let userPermission = new Array<any>();
    let rolePermission = new Array<any>();
    let applicationPermission = new Array<any>();

    for (var i = 0; i < this.permissions.length; i++) {
      if (this.permissions[i].user.length != 0) {
        userPermission.push(this.permissions[i]);
      } else if (this.permissions[i].role.length != 0) {
        rolePermission.push(this.permissions[i]);
      } else if (this.permissions[i].application.length != 0) {
        applicationPermission.push(this.permissions[i]);
      }
    }

    // sort the list of user.
    this.owners.sort((a: any, b: any) => (a > b ? 1 : b > a ? -1 : 0));
    for (var i = 0; i < this.owners.length; i++) {
      this.displayOwner(ownersPermissionSection, this.accounts[this.owners[i]]);
    }

    userPermission.sort((a: any, b: any) =>
      a.user > b.user ? 1 : b.user > a.user ? -1 : 0
    );
    for (var i = 0; i < userPermission.length; i++) {
      this.displayPermission(
        this.usersPermissionSection,
        userPermission[i],
        this.accounts[userPermission[i].user],
        OwnerType.User
      );
    }

    rolePermission.sort((a: any, b: any) =>
      a.role > b.role ? 1 : b.role > a.role ? -1 : 0
    );
    for (var i = 0; i < rolePermission.length; i++) {
      this.displayPermission(
        this.rolesPermissionSection,
        rolePermission[i],
        this.roles[rolePermission[i].role],
        OwnerType.Role
      );
    }

    applicationPermission.sort((a: any, b: any) =>
      a.application > b.application ? 1 : b.application > a.application ? -1 : 0
    );
    for (var i = 0; i < applicationPermission.length; i++) {
      this.displayPermission(
        this.applciationsPermissionSection,
        applicationPermission[i],
        this.applications[applicationPermission[i].application],
        OwnerType.Application
      );
    }
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
    this.editable = true;
    this.setRessource(this.ressourceInfo);
  }

  onlogout() {
    // overide...
    this.editable = false;
    this.setRessource(this.ressourceInfo);
  }
}

/**
 * Display one permission.
 */
export class PermissionPanel extends Panel {
  private editable: boolean;

  constructor(
    id: string,
    public permissionDiv: any,
    public permission: number,
    public onSetPermission: (permission: number) => void,
    public onDeletePermission: () => void,
    editable: boolean
  ) {
    super(id);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.editable = editable;

    this.setPermission();
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
    this.editable = true;
    this.setPermission();
  }

  onlogout() {
    // overide...
    this.editable = false;
    this.setPermission();
  }

  setPermission() {
    // Clear the div.
    this.permissionDiv.removeAllChilds();

    let permissionReadDiv = this.permissionDiv
      .appendElement({
        tag: "div",
        style: "flex-grow: 1; display: flex; align-items: center",
      })
      .down();
    permissionReadDiv.appendElement({
      tag: "span",
      innerHtml: "read",
      style: "margin-right: 15px; margin-left: 5px;",
    });

    if (!this.editable) {
      // Here I will set icons...
      permissionReadDiv
        .appendElement({
          tag: "i",
          id: "read_deny_ico",
          class: "tiny material-icons",
          innerHtml: "clear",
        })
        .appendElement({
          tag: "i",
          id: "read_allow_ico",
          class: "tiny material-icons",
          innerHtml: "check",
        });
    } else {
      // Here I will set checkbox.
      permissionReadDiv
        .appendElement({ tag: "label" })
        .down()
        .appendElement({
          tag: "input",
          id: "read_checkbox",
          class: "filled-in",
          type: "checkbox",
        })
        .appendElement({ tag: "span" });
    }

    let permissionWriteDiv = this.permissionDiv
      .appendElement({
        tag: "div",
        style: "flex-grow: 1; display: flex; align-items: center",
      })
      .down();
    permissionWriteDiv.appendElement({
      tag: "span",
      innerHtml: "write",
      style: "margin-right: 15px; margin-left: 5px;",
    });

    if (!this.editable) {
      // Here I will set icons...
      permissionWriteDiv
        .appendElement({
          tag: "i",
          id: "write_deny_ico",
          class: "tiny material-icons",
          innerHtml: "clear",
        })
        .appendElement({
          tag: "i",
          id: "write_allow_ico",
          class: "tiny material-icons",
          innerHtml: "check",
        });
    } else {
      // Here I will set checkbox.
      permissionWriteDiv
        .appendElement({ tag: "label" })
        .down()
        .appendElement({
          tag: "input",
          id: "write_checkbox",
          class: "filled-in",
          type: "checkbox",
        })
        .appendElement({ tag: "span" });
    }

    let permissionDeleteDiv = this.permissionDiv
      .appendElement({
        tag: "div",
        style: "flex-grow: 1; display: flex; align-items: center",
      })
      .down();
    permissionDeleteDiv.appendElement({
      tag: "span",
      innerHtml: "delete",
      style: "margin-right: 15px; margin-left: 5px;",
    });

    if (!this.editable) {
      // Here I will set icons...
      permissionDeleteDiv
        .appendElement({
          tag: "i",
          id: "delete_deny_ico",
          class: "tiny material-icons",
          innerHtml: "clear",
        })
        .appendElement({
          tag: "i",
          id: "delete_allow_ico",
          class: "tiny material-icons",
          innerHtml: "check",
        });
    } else {
      // Here I will set checkbox.
      permissionDeleteDiv
        .appendElement({ tag: "label" })
        .down()
        .appendElement({
          tag: "input",
          id: "delete_checkbox",
          class: "filled-in",
          type: "checkbox",
        })
        .appendElement({ tag: "span" });
    }

    // Now depending of the permission number I will set the permission.
    if (this.permission == 0) {
      // No permission.
      if (!this.editable) {
        this.permissionDiv.getChildById(
          "read_allow_ico"
        ).element.style.display = "none";
        this.permissionDiv.getChildById(
          "write_allow_ico"
        ).element.style.display = "none";
        this.permissionDiv.getChildById(
          "delete_allow_ico"
        ).element.style.display = "none";

        this.permissionDiv.getChildById("read_deny_ico").element.style.display =
          "";
        this.permissionDiv.getChildById(
          "write_deny_ico"
        ).element.style.display = "";
        this.permissionDiv.getChildById(
          "delete_deny_ico"
        ).element.style.display = "";
      } else {
        this.permissionDiv.getChildById(
          "read_checkbox"
        ).element.checked = false;
        this.permissionDiv.getChildById(
          "write_checkbox"
        ).element.checked = false;
        this.permissionDiv.getChildById(
          "delete_checkbox"
        ).element.checked = false;
      }
    } else if (this.permission == 1) {
      // delete
      if (!this.editable) {
        this.permissionDiv.getChildById(
          "read_allow_ico"
        ).element.style.display = "none";
        this.permissionDiv.getChildById(
          "write_allow_ico"
        ).element.style.display = "none";
        this.permissionDiv.getChildById(
          "delete_allow_ico"
        ).element.style.display = "";

        this.permissionDiv.getChildById("read_deny_ico").element.style.display =
          "";
        this.permissionDiv.getChildById(
          "write_deny_ico"
        ).element.style.display = "";
        this.permissionDiv.getChildById(
          "delete_deny_ico"
        ).element.style.display = "none";
      } else {
        this.permissionDiv.getChildById(
          "read_checkbox"
        ).element.checked = false;
        this.permissionDiv.getChildById(
          "write_checkbox"
        ).element.checked = false;
        this.permissionDiv.getChildById(
          "delete_checkbox"
        ).element.checked = true;
      }
    } else if (this.permission == 2) {
      // write
      if (!this.editable) {
        this.permissionDiv.getChildById(
          "read_allow_ico"
        ).element.style.display = "none";
        this.permissionDiv.getChildById(
          "write_allow_ico"
        ).element.style.display = "";
        this.permissionDiv.getChildById(
          "delete_allow_ico"
        ).element.style.display = "none";

        this.permissionDiv.getChildById("read_deny_ico").element.style.display =
          "";
        this.permissionDiv.getChildById(
          "write_deny_ico"
        ).element.style.display = "none";
        this.permissionDiv.getChildById(
          "delete_deny_ico"
        ).element.style.display = "";
      } else {
        this.permissionDiv.getChildById(
          "read_checkbox"
        ).element.checked = false;
        this.permissionDiv.getChildById(
          "write_checkbox"
        ).element.checked = true;
        this.permissionDiv.getChildById(
          "delete_checkbox"
        ).element.checked = false;
      }
    } else if (this.permission == 3) {
      // delete + Write.
      if (!this.editable) {
        this.permissionDiv.getChildById(
          "read_allow_ico"
        ).element.style.display = "none";
        this.permissionDiv.getChildById(
          "write_allow_ico"
        ).element.style.display = "";
        this.permissionDiv.getChildById(
          "delete_allow_ico"
        ).element.style.display = "";

        this.permissionDiv.getChildById("read_deny_ico").element.style.display =
          "";
        this.permissionDiv.getChildById(
          "write_deny_ico"
        ).element.style.display = "none";
        this.permissionDiv.getChildById(
          "delete_deny_ico"
        ).element.style.display = "none";
      } else {
        this.permissionDiv.getChildById(
          "read_checkbox"
        ).element.checked = false;
        this.permissionDiv.getChildById(
          "write_checkbox"
        ).element.checked = true;
        this.permissionDiv.getChildById(
          "delete_checkbox"
        ).element.checked = true;
      }
    } else if (this.permission == 4) {
      // Read
      if (!this.editable) {
        this.permissionDiv.getChildById(
          "read_allow_ico"
        ).element.style.display = "";
        this.permissionDiv.getChildById(
          "write_allow_ico"
        ).element.style.display = "none";
        this.permissionDiv.getChildById(
          "delete_allow_ico"
        ).element.style.display = "none";

        this.permissionDiv.getChildById("read_deny_ico").element.style.display =
          "none";
        this.permissionDiv.getChildById(
          "write_deny_ico"
        ).element.style.display = "";
        this.permissionDiv.getChildById(
          "delete_deny_ico"
        ).element.style.display = "";
      } else {
        this.permissionDiv.getChildById("read_checkbox").element.checked = true;
        this.permissionDiv.getChildById(
          "write_checkbox"
        ).element.checked = false;
        this.permissionDiv.getChildById(
          "delete_checkbox"
        ).element.checked = false;
      }
    } else if (this.permission == 5) {
      // Read + delete
      if (!this.editable) {
        this.permissionDiv.getChildById(
          "read_allow_ico"
        ).element.style.display = "";
        this.permissionDiv.getChildById(
          "write_allow_ico"
        ).element.style.display = "none";
        this.permissionDiv.getChildById(
          "delete_allow_ico"
        ).element.style.display = "";

        this.permissionDiv.getChildById("read_deny_ico").element.style.display =
          "none";
        this.permissionDiv.getChildById(
          "write_deny_ico"
        ).element.style.display = "";
        this.permissionDiv.getChildById(
          "delete_deny_ico"
        ).element.style.display = "none";
      } else {
        this.permissionDiv.getChildById("read_checkbox").element.checked = true;
        this.permissionDiv.getChildById(
          "write_checkbox"
        ).element.checked = false;
        this.permissionDiv.getChildById(
          "delete_checkbox"
        ).element.checked = true;
      }
    } else if (this.permission == 6) {
      // Read + Write
      if (!this.editable) {
        this.permissionDiv.getChildById(
          "read_allow_ico"
        ).element.style.display = "";
        this.permissionDiv.getChildById(
          "write_allow_ico"
        ).element.style.display = "";
        this.permissionDiv.getChildById(
          "delete_allow_ico"
        ).element.style.display = "none";

        this.permissionDiv.getChildById("read_deny_ico").element.style.display =
          "none";
        this.permissionDiv.getChildById(
          "write_deny_ico"
        ).element.style.display = "none";
        this.permissionDiv.getChildById(
          "delete_deny_ico"
        ).element.style.display = "";
      } else {
        this.permissionDiv.getChildById("read_checkbox").element.checked = true;
        this.permissionDiv.getChildById(
          "write_checkbox"
        ).element.checked = true;
        this.permissionDiv.getChildById(
          "delete_checkbox"
        ).element.checked = false;
      }
    } else if (this.permission == 7) {
      // Read + Write + delete
      if (!this.editable) {
        this.permissionDiv.getChildById(
          "read_allow_ico"
        ).element.style.display = "";
        this.permissionDiv.getChildById(
          "write_allow_ico"
        ).element.style.display = "";
        this.permissionDiv.getChildById(
          "delete_allow_ico"
        ).element.style.display = "";

        this.permissionDiv.getChildById("read_deny_ico").element.style.display =
          "none";
        this.permissionDiv.getChildById(
          "write_deny_ico"
        ).element.style.display = "none";
        this.permissionDiv.getChildById(
          "delete_deny_ico"
        ).element.style.display = "none";
      } else {
        this.permissionDiv.getChildById("read_checkbox").element.checked = true;
        this.permissionDiv.getChildById(
          "write_checkbox"
        ).element.checked = true;
        this.permissionDiv.getChildById(
          "delete_checkbox"
        ).element.checked = true;
      }
    }

    if (this.editable) {
      this.permissionDiv.getChildById(
        "read_checkbox"
      ).element.onchange = this.permissionDiv.getChildById(
        "delete_checkbox"
      ).element.onchange = this.permissionDiv.getChildById(
        "write_checkbox"
      ).element.onchange = () => {
        let isRead = this.permissionDiv.getChildById("read_checkbox").element
          .checked;
        let isWrite = this.permissionDiv.getChildById("write_checkbox").element
          .checked;
        let isDelete = this.permissionDiv.getChildById("delete_checkbox")
          .element.checked;
        let permission_number: number;
        if (!isRead && !isWrite && !isDelete) {
          permission_number = 0;
        } else if (!isRead && !isWrite && isDelete) {
          permission_number = 1;
        } else if (!isRead && isWrite && !isDelete) {
          permission_number = 2;
        } else if (!isRead && isWrite && isDelete) {
          permission_number = 3;
        } else if (isRead && !isWrite && !isDelete) {
          permission_number = 4;
        } else if (isRead && !isWrite && isDelete) {
          permission_number = 5;
        } else if (isRead && isWrite && !isDelete) {
          permission_number = 6;
        } else if (isRead && isWrite && isDelete) {
          permission_number = 7;
        }

        // Set the permission.
        this.onSetPermission(permission_number);
      };

      // Here I will also append the remove button.
      let removePermissionBtn = this.permissionDiv
        .appendElement({
          tag: "i",
          class: "Small material-icons col s1",
          innerHtml: "delete",
        })
        .down();
      removePermissionBtn.element.onmouseenter = function () {
        this.style.cursor = "pointer";
      };

      removePermissionBtn.element.onmouseleave = function () {
        this.style.cursor = "default";
      };

      // remove the file permission.
      removePermissionBtn.element.onclick = () => {
        this.onDeletePermission();
      };
    }
  }
}
