import { Panel } from "./panel";
import { getAllApplicationsInfo, getAllActions, getErrorMessage, appendActionToApplication, removeActionFromApplication, deleteApplication, saveApplication } from "../../../globular-mvc/node_modules/globular-web-client/api";
import * as M from "materialize-css";
import "materialize-css/sass/materialize.scss";
import { randomUUID } from "./utility";
import { Model } from "../../../globular-mvc/Model";
import { Globular } from "globular-web-client";

/**
 * This class is use to manage file on the server.
 */
export class ApplicationManager extends Panel {
  private editable: boolean;

  // File panel constructor.
  constructor(id: string) {
    super(id);
    this.displayApplications()
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
    this.editable = true;
    this.displayApplications()
  }

  onlogout() {
    // overide...
    this.editable = false;
    this.displayApplications()
  }

  /**
   * Display the application.
   * @param content 
   * @param application 
   */
  displayApplication(content: any, application: any) {
    // reset the interface.
    content.removeAllChilds();

    // The start and end time.
    let startTime = new Date(application.creation_date * 1000)
    let releasedTime = new Date(application.last_deployed * 1000)
    let path: string = application.path
    let url: string = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + path
    content.appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s2", innerHtml: "path" })
      .appendElement({ tag: "div", class: "col s10", innerHtml: path }).up()
      .appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s2", innerHtml: "created the" })
      .appendElement({ tag: "div", class: "col s10", innerHtml: startTime.toLocaleDateString() + " " + startTime.toLocaleTimeString() }).up()
      .appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s2", innerHtml: "released the" })
      .appendElement({ tag: "div", class: "col s10", innerHtml: releasedTime.toLocaleDateString() + " " + releasedTime.toLocaleTimeString() }).up()
      .appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s2", innerHtml: "link" })
      .appendElement({ tag: "a", class: "col s10", href: url, innerHtml: url }).up()
      .appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "input", id: "icon_selector", type: "file", style: "display: none;" })
      .appendElement({ tag: "div", class: "col s2", innerHtml: "icon" })
      .appendElement({ tag: "div", id: "icon_div", class: "col s10" }).down()
      .appendElement({ tag: "i", id: "icon_lnk", class: "material-icons", innerHtml: "image" })
      .appendElement({ tag: "img", id: "icon_img", style: "display: none;" }).up().up()
      .appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s2", innerHtml: "actions" })
      .appendElement({ tag: "div", id: "actions_div", class: "col s10" }).down()
      .appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", id: "actions_ul", class: "collection col s12" })


    let imageBtn = content.getChildById("icon_img")
    if (application.icon != undefined) {
      imageBtn.element.src = application.icon
      imageBtn.element.style.display = "";
      content.getChildById("icon_lnk").element.style.display = "none"
    }

    // So here I will 
    let actions_div = content.getChildById("actions_div")
    let actions_ul = content.getChildById("actions_ul")

    // append the actions list.
    if (!this.editable) {
      // Now the actions...
      if (application.actions != undefined) {
        for (var j = 0; j < application.actions.length; j++) {
          actions_ul.appendElement({ tag: "li", class: "collection-item", innerHtml: application.actions[j] })
        }
      }
    } else {

    // Display the file selection window.
    imageBtn.element.onclick = content.getChildById("icon_lnk").element.onclick = (evt: any) => {
      evt.stopPropagation()
      content.getChildById("icon_selector").element.click()
    }

    imageBtn.element.onmouseover = content.getChildById("icon_lnk").element.onmouseover = (evt: any) => {
      content.getChildById("icon_lnk").element.style.cursor = "pointer"
      imageBtn.element.style.cursor = "pointer"
    }

    imageBtn.element.onmouseleave = content.getChildById("icon_lnk").element.onmouseleave = (evt: any) => {
      content.getChildById("icon_lnk").element.style.cursor = "default"
      imageBtn.element.style.cursor = "default"
    }

    // The profile image selection.
    content.getChildById("icon_selector").element.onchange = (evt: any) => {
      var r = new FileReader();
      var file = evt.target.files[0];
      r.onload = () => {
        // Here I will set the image to a size of 64x64 pixel instead of keep the original size.
        var img = new Image();
        img.onload = () => {
          var thumbSize = 64;
          var canvas = document.createElement("canvas");
          canvas.width = thumbSize;
          canvas.height = thumbSize;
          var c = canvas.getContext("2d");
          c.drawImage(img, 0, 0, thumbSize, thumbSize);

          application.icon = canvas.toDataURL("image/png");
          imageBtn.element.src = application.icon;
          imageBtn.element.style.display = "";
          content.getChildById("icon_lnk").element.style.display = "none"

          saveApplication(
            Model.globular,
            Model.eventHub,
            application,
            () => {
              M.toast({ html: "applicaition ico was saved!", displayLength: 2000 });
            },
            (err: any) => {
              M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
            })
        };
        img.src = r.result.toString();
      };

      try {
        r.readAsDataURL(file); // read as BASE64 format
      } catch (err) {
        console.log(err)
      }
    };

      // Here I will append the actions list.
      let action_input = actions_div.prependElement({ tag: "div", class: "row" }).down()
        .appendElement({ tag: "div", class: "input-field col s12" }).down()
        .appendElement({ tag: "input", id: randomUUID(), class: "autocomplete", placeholder: "New Action" }).down()

      getAllActions(
        Model.globular,
        (actions: any) => {
          // console.log(actions)
          let data: any;
          data = {};
          if (application.actions != undefined) {
            for (var i = 0; i < actions.length; i++) {
              if (application.actions.indexOf(actions[i]) == -1) {
                data[actions[i]] = null
              }
            }
          } else {
            for (var i = 0; i < actions.length; i++) {
              data[actions[i]] = null
            }
          }
          // The action call on auto complete...
          let onAutocomplete = () => {
            let action = action_input.element.value;
            let applicationId = application._id;

            // save the action in the role.
            appendActionToApplication(
              Model.globular,
              applicationId,
              action,
              () => {
                M.toast({
                  html: "Action " + action + "has been added!",
                  displayLength: 2000
                });

                // re-init the display.
                content.removeAllChilds()
                if (application.actions == null) {
                  application.actions = []
                }

                application.actions.push(action)
                this.displayApplication(content, application)
              },
              (err: any) => {

                M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
              }
            );

          }
          M.Autocomplete.init(document.getElementById(action_input.element.id), { data: data, onAutocomplete: onAutocomplete })

        },
        (err: any) => {

          M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
        })

      // Now the actions...
      if (application.actions != undefined) {
        for (var j = 0; j < application.actions.length; j++) {
          let action = application.actions[j]
          let deleteBtn = actions_ul.appendElement({ tag: "li", class: "collection-item" }).down()
            .appendElement({ tag: "div", class: "row", style: "margin-bottom: 0px;" }).down()
            .appendElement({ tag: "div", class: "col s11", innerHtml: action })
            .appendElement({ tag: "i", class: "tiny material-icons col s1", innerHtml: "remove" }).down()

          deleteBtn.element.onmouseenter = function () {
            this.style.cursor = "pointer"
          }

          deleteBtn.element.onmouseleave = function () {
            this.style.cursor = "default"
          }

          // Here I will remove the action from the application.
          deleteBtn.element.onclick = () => {
            removeActionFromApplication(
              Model.globular, 
              action,
              () => {
                M.toast({
                  html: "Action " + action + "has been remove!",
                  displayLength: 2000
                });

                // remove the action from the actions list
                application.actions.splice(application.actions.indexOf(action), 1);

                // refresh the panel.
                this.displayApplication(content, application)
              },
              (err: any) => {

                M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
              })
          }
        }
      }
    }
  }

  // Redisplay the roles.
  refresh() {
    this.displayApplications()
  }

  displayApplications() {
    // clear the panel before recreate information inside it.
    this.div.removeAllChilds()
    this.div.element.className = "row"

    getAllApplicationsInfo(Model.globular, (applications: Array<any>) => {
      // must be one in the page.
      if (document.getElementById("applications_content_div") != undefined) {
        return
      }

      let ul = this.div
        .appendElement({ tag: "div", class: "col s12 /*m10 offset-m1*/", id: "applications_content_div" }).down()
        .appendElement({ tag: "ul", class: "collapsible" }).down()

      for (var i = 0; i < applications.length; i++) {
        let application = applications[i]
        if (document.getElementById(application._id + "_li") == undefined) {
          let li = ul.appendElement({ tag: "li", id: application._id + "_li" }).down()
          let header = li.appendElement({ tag: "div", class: "collapsible-header" }).down()
          let content = li.appendElement({ tag: "div", class: "collapsible-body" }).down()

          if (this.editable) {

            // Here I will display button to edit applications...
            // The delete icon.
            // the application header.
            header.appendElement({ tag: "span", class: "col s11", innerHtml: application._id })
            let deleteBtn = header.appendElement({ tag: "i", class: "material-icons col s1", innerHtml: "delete" }).down()

            // Now the remove application action.
            deleteBtn.element.onclick = () => {
              deleteApplication(Model.globular, application._id,
                () => {
                  M.toast({ html: "Application " + application._id + " have been removed!", displayLength: 2000 });
                  // refresh the interface.
                  this.displayApplications()
                },
                (err: any) => {

                  M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
                })
            }

          } else {
            header.appendElement({ tag: "span", class: "col s12", innerHtml: application._id })
          }

          // Display the application.
          this.displayApplication(content, application)
        }
      }

      // init all collapsible panels...
      M.Collapsible.init(ul.element)
    },
      (err: any) => {

        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      });
  }

}