
import { createElement } from "./element";
import {Model} from "../../../globular-mvc/Model"

export class Panel {
  private _div: any;

  public get div(): any {
    return this._div;
  }

  public set div(div: any) {
    this._div=div;
  }

  protected uuid: string;
  protected id: string;

  constructor(id: string) {
    // Div is the html element div.
    this._div = createElement(null, {
      tag: "div",
      id: id
    });
    this.id = id;

    Model.eventHub.subscribe(
      "onlogin",
      (uuid: string) => {
        this.uuid = uuid;
      },
      (data: any) => {
        this.onlogin(data);
      },
      true
    );

    Model.eventHub.subscribe(
      "onlogout",
      (uuid: string) => {
        this.uuid = uuid;
      },
      (data: any) => {
        this.onlogout();
      },
      true
    );
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
  }

  onlogout() {
    // overide...
    
  }

  close() {
    // disconnect the subscriber from the event channel...
    Model.eventHub.unSubscribe("onlogin", this.uuid);
  }

  setParent(parent: any) {
    parent.appendElement(this.div);
  }

  hide(){
    this.div.style.display = "none"
  }

  show(){
    this.div.style.display = ""
  }

  // that function is use to refresh a panel content.
  refresh(){
     // overide...
  }
}
