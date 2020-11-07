import { Panel } from "./panel";

import {
  getAllActions,
  getAllPeersInfo,
  removeActionFromPeer,
  appendActionToPeer,
  createPeer,
  deletePeer,
  getErrorMessage,
} from "../../../globular-mvc/node_modules/globular-web-client/api";

import { randomUUID } from "./utility";
import { Peer } from "../../../globular-mvc/node_modules/globular-web-client/ressource/ressource_pb";
import { Model } from "../../../globular-mvc/Model";

export class PeerManager extends Panel {
  private editable: boolean;
  private actions: Array<string>;

  /** The constructor. */
  constructor(id: string) {
    super(id);

    getAllActions(
      Model.globular,
      (actions: any) => {
        this.actions = actions;
        this.displayPeers();
      },
      (err: any) => {
        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      }
    );
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
    this.editable = true;
    this.displayPeers();
  }

  onlogout() {
    // overide...
    this.editable = false;
    this.displayPeers();
  }

  /**
   * Display the p.
   * @param content
   * @param Peer
   */
  displayPeer(content: any, p: Peer) {
    // reset the interface.
    content.removeAllChilds();

    // The start and end time.
    content
      .appendElement({ tag: "div", id: "actions_div" })
      .down()
      .appendElement({ tag: "div", class: "row" })
      .down()
      .appendElement({
        tag: "div",
        id: "actions_ul",
        class: "collection col s12",
      });

    let actions_div = content.getChildById("actions_div");
    let actions_ul = content.getChildById("actions_ul");

    // append the actions list.
    if (!this.editable) {
      // Now the actions...
      p.getActionsList().forEach((a: any) => {
        actions_ul.appendElement({
          tag: "li",
          class: "collection-item",
          innerHtml: a,
        });
      });
    } else {
      // Here I will append the actions list.
      let action_input = actions_div
        .prependElement({ tag: "div", class: "row" })
        .down()
        .appendElement({ tag: "div", class: "input-field col s12" })
        .down()
        .appendElement({
          tag: "input",
          class: "autocomplete",
          placeholder: "New Action",
          id: randomUUID(),
        })
        .down();

      // console.log(actions)
      let data: any;
      data = {};
      if (p.getActionsList() != undefined) {
        for (var i = 0; i < this.actions.length; i++) {
          if (p.getDomain().indexOf(this.actions[i]) == -1) {
            data[this.actions[i]] = null;
          }
        }
      } else {
        for (var i = 0; i < this.actions.length; i++) {
          data[this.actions[i]] = null;
        }
      }
      // The action call on auto complete...
      let onAutocomplete = () => {
        let action = action_input.element.value;

        // save the action in the p.
        appendActionToPeer(
          Model.globular,
          p.getDomain(),
          action,
          () => {
            M.toast({
              html: "Action " + action + "has been added!",
              displayLength: 2000,
            });

            // re-init the display.
            content.removeAllChilds();

            p.getActionsList().push(action);
            this.displayPeer(content, p);
          },
          (err: any) => {
            M.toast({
              html: getErrorMessage(err.message),
              displayLength: 2000,
            });
          }
        );
      };

      M.Autocomplete.init(document.getElementById(action_input.element.id), {
        data: data,
        onAutocomplete: onAutocomplete,
      });

      // Now the actions...
      for (var j = 0; j < p.getActionsList().length; j++) {
        let action = p.getActionsList()[j];
        let deleteBtn = actions_ul
          .appendElement({ tag: "li", class: "collection-item" })
          .down()
          .appendElement({
            tag: "div",
            class: "row",
            style: "margin-bottom: 0px;",
          })
          .down()
          .appendElement({ tag: "div", class: "col s11", innerHtml: action })
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

        // Here I will remove the action from the application.
        deleteBtn.element.onclick = () => {
          removeActionFromPeer(
            Model.globular,
            p.getDomain(),
            action,
            () => {
              M.toast({
                html: "Action " + action + "has been remove!",
                displayLength: 2000,
              });

              // remove the action from the actions list
              p.getActionsList().splice(p.getActionsList().indexOf(action), 1)


              // refresh the panel.
              this.displayPeer(content, p);
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

  // Redisplay the Peers.
  refresh() {
    this.displayPeers();
  }

  displayPeers() {
    // clear the panel before recreate information inside it.
    this.div.removeAllChilds();
    this.div.element.className = "row";

    getAllPeersInfo(
      Model.globular, 
      (peers: Array<Peer>) => {
        // must be only one in the page.
        if (document.getElementById("Peers_content_div") != undefined) {
          return;
        }

        let ul = this.div
          .appendElement({
            tag: "div",
            class: "col s11",
            id: "Peers_content_div",
          })
          .down()
          .appendElement({ tag: "ul", class: "collapsible" })
          .down();

        if (this.editable) {
          let newPeerBtn = this.div
            .prependElement({
              tag: "i",
              id: "append_Peer_btn",
              class: "material-icons col s1",
              title: "Append new Peer",
              innerHtml: "add",
              style: "margin-top: 10px; text-align: end;",
            })
            .down();

          newPeerBtn.element.onmouseenter = function () {
            this.style.cursor = "pointer";
          };

          newPeerBtn.element.onmouseout = function () {
            this.style.cursor = "default";
          };

          // Append a new p.
          newPeerBtn.element.onclick = () => {
            let PeerId = "new_Peer";
            if (document.getElementById(PeerId) != undefined) {
              document.getElementById("Peer_id_input_" + PeerId).focus();
              return;
            }

            let li = ul.appendElement({ tag: "li" }).down();
            let header = li
              .appendElement({ tag: "div", class: "collapsible-header" })
              .down();

            let input = header
              .appendElement({
                tag: "input",
                id: "Peer_id_input_" + PeerId,
                class: "col s12",
                placeholder: "Peer",
              })
              .down();

            // Set interface element states.
            input.element.focus();
            input.element.onkeyup = (evt: any) => {
              if (evt.keyCode == 13) {
                let PeerId = (<HTMLInputElement>input.element).value;
                // Try to create the p.
                createPeer(
                  Model.globular,
                  PeerId,
                  () => {
                    // summit event.
                    this.displayPeers();
                    // Now I will save the p.
                    M.toast({
                      html: "Peer " + PeerId + " created with success!",
                      displayLength: 2000,
                    });

                    // I will also puplish event here.
                    Model.eventHub.publish(
                      "update_Peer_event",
                      { name: PeerId },
                      true
                    );
                  },
                  (err: any) => {
                    M.toast({
                      html: getErrorMessage(err.message),
                      displayLength: 3500,
                    });
                    this.displayPeers();
                  }
                );
              } else if (evt.keyCode == 27) {
                // Cancel event.
                this.div.parentNode.parentNode.removeChild(this.div.parentNode);
              }
            };
          };
        }

        for (var i = 0; i < peers.length; i++) {
          let li = ul.appendElement({ tag: "li" }).down();
          let header = li
            .appendElement({ tag: "div", class: "collapsible-header" })
            .down();
          let content = li
            .appendElement({ tag: "div", class: "collapsible-body" })
            .down();
          let p = peers[i];

          if (this.editable) {
            // Here I will display button to edit applications...
            // The delete icon.
            // the application header.
            header.appendElement({
              tag: "span",
              class: "col s11",
              innerHtml: p.getDomain(),
            });
            let deleteBtn = header
              .appendElement({
                tag: "i",
                class: "material-icons col s1",
                innerHtml: "delete",
              })
              .down();

            // Remove btn action
            deleteBtn.element.onclick = (evt: any) => {
              evt.stopPropagation();
              deletePeer(
                Model.globular,
                p,
                () => {
                  // simply redisplay the whole Peers.
                  this.displayPeers();

                  M.toast({
                    html: "Peer " + p.getDomain() + " has been removed!",
                    displayLength: 2000,
                  });

                  Model.eventHub.publish(
                    "update_Peer_event",
                    { name: p.getDomain() },
                    true
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
            header.appendElement({
              tag: "span",
              class: "col s12",
              innerHtml: p.getDomain(),
            });
          }
          // Display the application.
          this.displayPeer(content, p);
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
