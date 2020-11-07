import { ServicePanel } from "../servicePanel"
import { IServiceConfig } from "../../../../globular-mvc/node_modules/globular-web-client"
import { ConfigurationPanel } from "../configurationPanel";

/**
 * The sql service admin configuration interface.
 */
export class PersistenceServicePanel extends ServicePanel {
    private connections: Array<ConfigurationPanel>;

    constructor(service: IServiceConfig, id: string, name: string) {
        super(service, id, name)
        this.connections = new Array<any>()
    }

    onlogin(data: any) {
        super.onlogin(data);

        // Do nothing in case the connections are ready exist.
        if (this.content.getChildById("connections_div") != undefined) {
            return;
        }

        // Here i will initialyse specifig configurations option.
        let connectionsLine = this.appendEmptyConfig("Connections")
        connectionsLine.content.element.firstChild.className = "col s11 m3"
        connectionsLine.content.appendElement({ tag: "i", class: "material-icons col s1", id: "append_new_connection", innerHtml: "add" })

        let ul = connectionsLine.content
            .appendElement({ tag: "div", class: "switch col s12 m8", id: "connections_div" }).down()
            .appendElement({ tag: "ul", class: "collapsible", style: "box-shadow: none;" }).down()

        for (var id in this.config.Connections) {
            this.createConnectionConfigPanel(ul, this.config.Connections[id])
        }

        M.Collapsible.init(ul.element)

        // The connection id.
        let newConnectionBtn = connectionsLine.content.getChildById("append_new_connection")
        newConnectionBtn.element.onmouseover = function () {
            this.style.cursor = "pointer"
        }

        newConnectionBtn.element.onmouseout = function () {
            this.style.cursor = "default"
        }

        newConnectionBtn.element.onclick =  ()=> {
            let connection = {Id:"newConnection", Name:"newConnection", Host:"", StoreType:0, User:"", Password:"", Port:0, Timeout:0, Options:""}
            let li = this.createConnectionConfigPanel(ul, connection)
            
            let idInput = li.getChildById("id_input")
            idInput.element.setSelectionRange(0, idInput.element.value.length)
            idInput.element.style.display = ""
            idInput.element.focus()
            idInput.element.onclick = (evt:any) => {
                evt.stopPropagation()
            }

            let idSpan = li.getChildById("id_span")
            idSpan.element.style.display = "none"
        }
    }

    createConnectionConfigPanel(ul:any, connection: any ): any{
        
        // Here I will create the connections.
        let li = ul.prependElement({ tag: "li" }).down()

        let deleteBtn = li.appendElement({ tag: "div", class: "collapsible-header", style: "display: flex; align-items: center;" }).down()
            .appendElement({ tag: "span", id:"id_span", class: "col s6", innerHtml: connection.Id })
            .appendElement({ tag: "input", id:"id_input", class: "col s6", value: connection.Name, style:"display:none;" })
            .appendElement({ tag: "div", class: "col s6 right-align" }).down()
            .appendElement({ tag: "i", class: "Small material-icons", style: "cursor: default;", innerHtml: "delete" }).down()

        let idInput =  li.getChildById("id_input")
        let idSpan = li.getChildById("id_span")

        idInput.element.onchange = ()=>{
            // Set the value...
            idSpan.element.innerHTML = idInput.element.value;
            connection.Id = idInput.element.value;
        }

        idInput.element.onkeyup = (evt: any)=>{
            // Set the value...
            idSpan.element.innerHTML = idInput.element.value;
            if(evt.keyCode == 13){
                idSpan.element.style.display = ""
                idInput.element.style.display = "none"
            }
        }

        deleteBtn.element.onmouseover = function () {
            this.style.cursor = "pointer"
        }

        deleteBtn.element.onmouseout = function () {
            this.style.cursor = "default"
        }

        let connectionDiv = li.appendElement({ tag: "div", class: "collapsible-body" }).down()
            .appendElement({ tag: "div", id: "content" }).down()

        // Now I will create a new coniguration panel.
        let configPanel = new ConfigurationPanel(connection, "", "")
        configPanel.appendTextualConfig("Name")
        configPanel.appendTextualConfig("Host")
        configPanel.appendEnumConfig("StoreType", ["MongoDB"/*, "Couch", "Arango"*/], true)
        configPanel.appendTextualConfig("User")
        configPanel.appendTextualConfig("Password", "Password", "password")
        configPanel.appendTextualConfig("Port", "Port", "number", 1, 0, 65535)
        configPanel.appendTextualConfig("Timeout", "Timeout", "number", 1, 0, 65535)
        configPanel.appendTextualConfig("Options")

        connectionDiv.appendElement(configPanel.content);
        configPanel.onlogin(connection)

        // redirect the config event...
        configPanel.hasChange = ()=>{
            this.hasChange()
        }

        deleteBtn.element.onclick = (evt:any) => {
            evt.stopPropagation()
            let index = this.connections.indexOf(configPanel)
            this.connections.splice(index, 1)
            delete this.config.Connections[connection.Id]
            // Delete the connection div.
            li.delete()
            this.hasChange()
        }

        // keep the connction config panel.
        this.connections.push(configPanel)
        return li;
    }

    onlogout() {
        super.onlogout();
    }

    cancel(){
        super.cancel();
        for(var i=0; i < this.connections.length; i++){
            // cancel each modifictions made on connections.
            this.connections[i].cancel()
        }
    }

    save(){
        for(var i=0; i < this.connections.length; i++){
            // Set the configuration values.
            this.connections[i].save()

            // Set the connection in the config.
            this.config.Connections[this.connections[i].config.Id] = this.connections[i].config
        }

        // save it...
        super.save();
    }
}