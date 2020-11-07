/**
 * This class is use to manage file on the server.
 */
import { Panel } from "./panel";
import * as M from "materialize-css";
import "materialize-css/sass/materialize.scss";
import { randomUUID } from "./utility";
import {
  getAllRoles,
  updateAccountEmail,
  updateAccountPassword,
  appendRoleToAccount,
  removeRoleFromAccount,
  registerAccount,
  getAllAccountsInfo,
  deleteAccount,
  getErrorMessage,
} from "../../../globular-mvc/node_modules/globular-web-client/api";
import { Model } from "../../../globular-mvc/Model";

/**
 * This class is use to manage file on the server.
 */
export class AccountManager extends Panel {
  private editable: boolean;
  private roles: any; // contain the list of roles.

  // File panel constructor.
  constructor(id: string) {
    super(id);
    this.roles = {};
    getAllRoles(
      Model.globular,
      (roles: any) => {
        for (var i = 0; i < roles.length; i++) {
          this.roles[roles[i]._id] = roles[i];
        }
        this.displayAccounts();
      },
      (err: any) => {
        console.log(err);
      }
    );

    // Emit when user click on the path
    Model.eventHub.subscribe(
      "update_role_event",
      (uuid: string) => {},
      (evt: any) => {
        // Set the dir to display.
        // Here I must retreive the directory from the given path.
        getAllRoles(
          Model.globular,
          (roles: any) => {
            for (var i = 0; i < roles.length; i++) {
              this.roles[roles[i]._id] = roles[i];
            }
            this.displayAccounts();
          },
          (err: any) => {
            console.log(err);
          }
        );
      },
      true
    );
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
    this.editable = true;
    this.displayAccounts();
  }

  onlogout() {
    // overide...
    this.editable = false;
    this.displayAccounts();
  }

  /**
   * Display the account.
   * @param content
   * @param account
   */
  displayAccount(content: any, account: any) {
    // reset the interface.
    content.removeAllChilds();

    // The start and end time.
    content
      .appendElement({ tag: "div", class: "row" })
      .down()
      .appendElement({ tag: "div", class: "col s2", innerHtml: "email" })
      .appendElement({
        tag: "div",
        class: "col s10",
        id: "email_div",
        innerHtml: account.email,
      })
      .up()
      .appendElement({ tag: "div", id: "password_div" })
      .appendElement({ tag: "div", id: "new_password_div" })
      .appendElement({ tag: "div", id: "confirm_password_div" })
      .appendElement({ tag: "div", class: "row" })
      .down()
      .appendElement({ tag: "div", class: "col s2", innerHtml: "roles" })
      .appendElement({ tag: "div", id: "roles_div", class: "col s10" })
      .down()
      .appendElement({ tag: "div", class: "row" })
      .down()
      .appendElement({
        tag: "div",
        id: "roles_ul",
        class: "collection col s12",
      });

    let email_div = content.getChildById("email_div");
    let password_div = content.getChildById("password_div");
    let new_password_div = content.getChildById("new_password_div");
    let confirm_password_div = content.getChildById("confirm_password_div");
    let roles_div = content.getChildById("roles_div");
    let roles_ul = content.getChildById("roles_ul");

    if (this.editable) {
      // Here i will set the email input...
      email_div.removeAllChilds();
      email_div.element.innerHTML = "";

      let email_input_id = randomUUID();

      email_div
        .appendElement({ tag: "input-field" })
        .down()
        .appendElement({
          tag: "input",
          id: email_input_id,
          value: account.email,
          type: "email",
          class: "validate",
        })
        .appendElement({ tag: "span" });

      // Set the password change button.
      new_password_div.element.className = confirm_password_div.element.className = password_div.element.className =
        "row";

      let password_input_id = randomUUID();

      // The password div
      password_div
        .appendElement({ tag: "input-field" })
        .down()
        .appendElement({ tag: "div", class: "col s2", innerHtml: "password" })
        .appendElement({ tag: "div", class: "col s10" })
        .down()
        .appendElement({
          tag: "input",
          type: "password",
          id: password_input_id,
          class: "validate",
        })
        .appendElement({ tag: "span" });

      let new_password_input_id = randomUUID();
      new_password_div
        .appendElement({ tag: "input-field" })
        .down()
        .appendElement({
          tag: "div",
          class: "col s2",
          innerHtml: "new password",
        })
        .appendElement({ tag: "div", class: "col s10" })
        .down()
        .appendElement({
          tag: "input",
          type: "password",
          id: new_password_input_id,
          class: "validate",
        })
        .appendElement({ tag: "span" });

      // The confirmation password
      let confirm_password_input_id = randomUUID();
      confirm_password_div
        .appendElement({
          tag: "div",
          class: "col s2",
          innerHtml: "confirm password",
        })
        .appendElement({ tag: "div", class: "col s10" })
        .down()
        .appendElement({ tag: "input-field" })
        .down()
        .appendElement({
          tag: "input",
          type: "password",
          id: confirm_password_input_id,
          class: "validate",
        })
        .appendElement({ tag: "span" });

      // Now  i will set the action.

      email_div.getChildById(email_input_id).element.onkeyup = (evt: any) => {
        if (evt.keyCode == 13) {
          // here the user want to change it email.
          updateAccountEmail(
            Model.globular,
            account._id,
            account.email,
            email_div.getChildById(email_input_id).element.value,
            () => {
              // keep the email in the account!
              account.email = email_div.getChildById(
                email_input_id
              ).element.value;
              M.toast({ html: "your email was updated!", displayLength: 2000 });
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

      // Now the update password...
      confirm_password_div.getChildById(
        confirm_password_input_id
      ).element.onkeyup = (evt: any) => {
        if (evt.keyCode == 13) {
          // here the user want to change it email.
          let confirm_pwd = confirm_password_div.getChildById(
            confirm_password_input_id
          ).element.value;
          let old_pwd = password_div.getChildById(password_input_id).element
            .value;
          let new_pwd = new_password_div.getChildById(new_password_input_id)
            .element.value;

          // Update the account password.
          updateAccountPassword(
            Model.globular,
            account._id,
            old_pwd,
            new_pwd,
            confirm_pwd,
            () => {
              // keep the email in the account!
              M.toast({
                html: "your password was updated!",
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
        }
      };
    }

    // append the roles list.
    if (!this.editable) {
      // Now the roles...
      if (account.roles != undefined) {
        for (var j = 0; j < account.roles.length; j++) {
          if (this.roles[account.roles[j].$id] != undefined) {
            roles_ul.appendElement({
              tag: "li",
              class: "collection-item",
              innerHtml: this.roles[account.roles[j].$id].name,
            });
          }
        }
      }
    } else {
      // generate an id for the autocomplete

      // Here I will append the roles list.
      let role_input = roles_div
        .prependElement({ tag: "div", class: "row" })
        .down()
        .appendElement({ tag: "div", class: "input-field col s12" })
        .down()
        .appendElement({
          tag: "input",
          class: "autocomplete",
          placeholder: "Append Role",
          id: randomUUID(),
        })
        .down();

      getAllRoles(
        Model.globular,
        (roles: any) => {
          let data: any;
          data = {};
          if (account.roles != undefined) {
            for (var i = 0; i < roles.length; i++) {
              let exist = false;
              for (var j = 0; j < account.roles.length; j++) {
                if (account.roles[j].$id == roles[i]._id) {
                  exist = true;
                  break;
                }
              }
              if (!exist) {
                data[roles[i]._id] = null;
              }
            }
          } else {
            for (var i = 0; i < roles.length; i++) {
              data[roles[i]._id] = null;
            }
          }
          // The action call on auto complete...
          let onAutocomplete = () => {
            let role = role_input.element.value;
            let accountId = account._id;

            // save the action in the role.
            appendRoleToAccount(
              Model.globular,
              accountId,
              role,
              () => {
                M.toast({
                  html: "Role " + role + " has been added!",
                  displayLength: 2000,
                });

                // re-init the display.
                content.removeAllChilds();
                if (account.roles == null) {
                  account.roles = [];
                }

                account.roles.push({
                  $id: role,
                  $db: "local_ressource",
                  $ref: "local_ressource",
                });
                this.displayAccount(content, account);
              },
              (err: any) => {
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
          M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
        }
      );

      // Now the roles...
      if (account.roles != undefined) {
        for (var j = 0; j < account.roles.length; j++) {
          let role = account.roles[j];
          if (this.roles[role.$id] != undefined) {
            let deleteBtn = roles_ul
              .appendElement({ tag: "li", class: "collection-item" })
              .down()
              .appendElement({
                tag: "div",
                class: "row",
                style: "margin-bottom: 0px;",
              })
              .down()
              .appendElement({
                tag: "div",
                class: "col s11",
                innerHtml: this.roles[role.$id].name,
              })
              .appendElement({
                tag: "i",
                class: "tiny material-icons col s1",
                innerHtml: "remove",
              })
              .down();

            deleteBtn.element.onmouseenter = function () {
              this.style.cursor = "pointer";
            };

            deleteBtn.element.onmouseleave = function () {
              this.style.cursor = "default";
            };

            // Here I will remove the role from the account.
            deleteBtn.element.onclick = () => {
              removeRoleFromAccount(
                Model.globular,
                account._id,
                role.$id,
                () => {
                  M.toast({
                    html:
                      "Role " + this.roles[role.$id].name + " has been remove!",
                    displayLength: 2000,
                  });

                  // remove the role from the roles list
                  let roles = new Array<any>();
                  for (var i = 0; i < account.roles.length; i++) {
                    if (account.roles[i].$id != role.$id) {
                      roles.push(account.roles[i]);
                    }
                  }

                  // set back the roles.
                  account.roles = roles;

                  // refresh the panel.
                  this.displayAccount(content, account);
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
      }
    }
  }

  /**
   *
   */
  refresh() {
    this.displayAccounts();
  }

  displayAccounts() {
    // clear the panel before recreate information inside it.
    this.div.removeAllChilds();
    let div = this.div
      .appendElement({ tag: "div", class: "row", id: "accounts_content_div" })
      .down();

    let newAccountBtn = div
      .appendElement({ tag: "a", class: "modal-trigger", href: "#modal1" })
      .down()
      .appendElement({
        tag: "i",
        id: "append_role_btn",
        class: "material-icons col s1",
        title: "Create new account",
        innerHtml: "person_add",
        style: "margin-top: 10px; text-align: end;",
      })
      .down();

    newAccountBtn.element.onmouseenter = function () {
      this.style.cursor = "pointer";
    };

    newAccountBtn.element.onmouseout = function () {
      this.style.cursor = "default";
    };

    // Append a new role.
    newAccountBtn.element.onclick = () => {
      // Here I will create a modal dialog where the user will create a new account.
      let modal = this.div
        .appendElement({ tag: "div", class: "modal", id: "modal1" })
        .down();

      modal
        .appendElement({ tag: "div", class: "modal-content" })
        .down()
        .appendElement({ tag: "h5", innerHtml: "Create Account" })
        .appendElement({ tag: "div", id: "content" })
        .up()
        .appendElement({ tag: "div", class: "modal-footer" })
        .down()
        .appendElement({
          tag: "a",
          class: "modal-close waves-effect waves-green btn-flat",
          id: "create_account_btn",
          innerHtml: "Save",
        });

      let content = modal.getChildById("content");

      let user_name_id = randomUUID();
      let user_email_id = randomUUID();
      let user_password_id = randomUUID();
      let user_password_validate_id = randomUUID();

      // Here I will set the account values.
      content
        .appendElement({ tag: "div", class: "row" })
        .down()
        .appendElement({ tag: "div", class: "input-field col s12" })
        .down()
        .appendElement({
          tag: "input",
          placeholder: "",
          id: user_name_id,
          type: "text",
          class: "validate",
        })
        .appendElement({
          tag: "label",
          for: user_name_id,
          innerHtml: "Username",
        })
        .up()
        .appendElement({ tag: "div", class: "input-field col s12" })
        .down()
        .appendElement({
          tag: "input",
          placeholder: "",
          id: user_email_id,
          type: "email",
          class: "validate",
        })
        .appendElement({ tag: "label", for: "user_email", innerHtml: "Email" })
        .up()
        .appendElement({ tag: "div", class: "input-field col s12" })
        .down()
        .appendElement({
          tag: "input",
          placeholder: "",
          id: user_password_id,
          type: "password",
        })
        .appendElement({
          tag: "label",
          for: user_password_id,
          innerHtml: "Password",
        })
        .up()
        .appendElement({ tag: "div", class: "input-field col s12" })
        .down()
        .appendElement({
          tag: "input",
          placeholder: "",
          id: user_password_validate_id,
          type: "password",
        })
        .appendElement({
          tag: "label",
          for: user_password_validate_id,
          innerHtml: "Password validate",
        })
        .up();

      let createAccountBtn = modal.getChildById("create_account_btn");
      createAccountBtn.element.onclick = () => {
        let username = modal.getChildById(user_name_id).element.value;
        let email = modal.getChildById(user_email_id).element.value;
        let pwd = modal.getChildById(user_password_id).element.value;
        let pwd_ = modal.getChildById(user_password_validate_id).element.value;

        // Here I will register the account.
        registerAccount(
          Model.globular,
          username,
          email,
          pwd,
          pwd_,
          (result: any) => {
            this.displayAccounts();
          },
          (err: any) => {
            M.toast({
              html: getErrorMessage(err.message),
              displayLength: 2000,
            });
          }
        );
      };
      M.Modal.init(modal.element, {});
    };

    getAllAccountsInfo(
      Model.globular,
      (accounts: Array<any>) => {
        // Here I will get the list of all accounts.
        let ul = div
          .appendElement({
            tag: "div",
            class: "col s11",
            style: "padding: 0px;",
          })
          .down()
          .appendElement({ tag: "ul", class: "collapsible" })
          .down();

        for (var i = 0; i < accounts.length; i++) {
          let li = ul.appendElement({ tag: "li" }).down();
          let header = li
            .appendElement({ tag: "div", class: "collapsible-header" })
            .down();
          let content = li
            .appendElement({ tag: "div", class: "collapsible-body" })
            .down();
          let account = accounts[i];
          if (this.editable) {
            // Here I will display button to edit accounts...
            // The delete icon.
            // the account header.
            header.appendElement({
              tag: "span",
              class: "col s11",
              innerHtml: account.name,
            });
            let deleteBtn = header
              .appendElement({
                tag: "i",
                class: "material-icons col s1",
                innerHtml: "delete",
              })
              .down();

            // Now the remove account action.
            deleteBtn.element.onclick = () => {
              deleteAccount(
                Model.globular,
                account._id,
                () => {
                  M.toast({
                    html: "account " + account._id + " have been removed!",
                    displayLength: 2000,
                  });
                  // refresh the interface.
                  this.displayAccounts();
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
            header.appendElement({
              tag: "span",
              class: "col s12",
              innerHtml: account.name,
            });
          }
          // Display the account.
          this.displayAccount(content, account);
        }

        // init all collapsible panels...
        M.Collapsible.init(ul.element);
      },
      (err: any) => {
        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      }
    );
  }
}
