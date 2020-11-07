import { ServicePanel } from "../servicePanel"
import { IServiceConfig } from "../../../../globular-mvc/node_modules/globular-web-client"
import { ConfigurationPanel } from "../configurationPanel";

/**
 * The sql service admin configuration interface.
 */
export class PlcExporterConfigPanel extends ServicePanel {
    private tags: Array<ConfigurationPanel>;
    private plcServices: Map<string, any>;
    private plcServicesIds: Array<string>;

    constructor(service: IServiceConfig, id: string, name: string) {
        super(service, id, name)
        this.tags = new Array<any>()
    }

    onlogin(data: any) {
        super.onlogin(data);

        // Do nothing in case the tags are ready exist.
        if (this.content.getChildById("tags_div") != undefined) {
            return;
        }

        this.plcServices = new Map<string, any>()
        this.plcServicesIds = new Array<string>()

        for(var id in data.Services){
            if(id.startsWith("plc.PlcService")){
                this.plcServices.set(id, data.Services[id])
                this.plcServicesIds.push(id)
            }
        }

        // Here i will initialyse specifig configurations option.
        let tagsLine = this.appendEmptyConfig("tags")
        tagsLine.content.element.firstChild.className = "col s11 m3"
        tagsLine.content.appendElement({ tag: "i", class: "material-icons col s1", id: "append_new_Tag", innerHtml: "add" })

        let ul = tagsLine.content
            .appendElement({ tag: "div", class: "switch col s12 m8", id: "tags_div" }).down()
            .appendElement({ tag: "ul", class: "collapsible", style: "box-shadow: none;" }).down()

        for (var i = 0; i < this.config.Tags.length; i++) {
            this.createTagConfigPanel(ul, this.config.Tags[i])
        }

        M.Collapsible.init(ul.element)

        // The Tag id.
        let newTagBtn = tagsLine.content.getChildById("append_new_Tag")
        newTagBtn.element.onmouseover = function () {
            this.style.cursor = "pointer"
        }

        newTagBtn.element.onmouseout = function () {
            this.style.cursor = "default"
        }

        newTagBtn.element.onclick =  ()=> {
            let Tag = {ServiceId:"", ConnectionId:"", Description:"", Domain:"", Label:"", Name:"", TypeName:"INT", Offset:0, Length:0, Unit:"NA"}
            let li = this.createTagConfigPanel(ul, Tag)
            
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

    createTagConfigPanel(ul:any, Tag: any ): any{
        
        // Here I will create the tags.
        let li = ul.prependElement({ tag: "li" }).down()

        let deleteBtn = li.appendElement({ tag: "div", class: "collapsible-header", style: "display: flex; align-items: center;" }).down()
            .appendElement({ tag: "span", id:"id_span", class: "col s6", innerHtml: Tag.Label })
            .appendElement({ tag: "input", id:"id_input", class: "col s6", value: Tag.Name, style:"display:none;" })
            .appendElement({ tag: "div", class: "col s6 right-align" }).down()
            .appendElement({ tag: "i", class: "Small material-icons", style: "cursor: default;", innerHtml: "delete" }).down()

        let idInput =  li.getChildById("id_input")
        let idSpan = li.getChildById("id_span")

        idInput.element.onchange = ()=>{
            // Set the value...
            idSpan.element.innerHTML = idInput.element.value;
            Tag.Label = idInput.element.value;
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

        let TagDiv = li.appendElement({ tag: "div", class: "collapsible-body" }).down()
            .appendElement({ tag: "div", id: "content" }).down()

        let connectionIds = new Array<string>();

        if(Tag.ServiceId != ""){
            for(var i=0; i < this.plcServices.get(Tag.ServiceId).Connections.length; i++){
                connectionIds.push(this.plcServices.get(Tag.ServiceId).Connections[i].Id)
            }
            Tag.Domain = this.plcServices.get(Tag.ServiceId).Domain;
        }

        // Now I will create a new coniguration panel.
        let configPanel = new ConfigurationPanel(Tag, "", "");
        let serviceIdSelect = configPanel.appendEnumConfig("ServiceId", this.plcServicesIds, false); // enum 
        let connectionIdSelect = configPanel.appendEnumConfig("ConnectionId", connectionIds, false); // enum
        configPanel.appendTextualConfig("Name");
        configPanel.appendTextualConfig("Description");
        configPanel.appendTextualConfig("Unit");
        configPanel.appendEnumConfig("TypeName", ["BOOL", "SINT", "INT", "DINT", "REAL"], false);
        configPanel.appendTextualConfig("Offset", "Offset", "number", 1, 0, 65535);
        configPanel.appendTextualConfig("Length", "Length", "number", 1, 0, 65535);

        // Connect event on serviceId select change.
        let onChange_ = serviceIdSelect.getValueEditor().element.onchange
        serviceIdSelect.getValueEditor().element.onchange = ()=>{
            onChange_();
            // get the services with the select id.
            let service = this.plcServices.get(serviceIdSelect.getValueEditor().getValue())
            Tag.Domain = service.Domain;
            // remove the actual values.
            connectionIdSelect.getValueEditor().removeAllChilds()

            for(var i=0; i < service.Connections.length; i++){
                connectionIdSelect.getValueEditor().appendElement({ tag: "option", value: service.Connections[i].Id, innerHtml:  service.Connections[i].Id }).down()
            }
        }

        TagDiv.appendElement(configPanel.content);
        configPanel.onlogin(Tag)

        // redirect the config event...
        configPanel.hasChange = ()=>{
            this.hasChange()
        }

        deleteBtn.element.onclick = (evt:any) => {
            evt.stopPropagation()
            let index = this.tags.indexOf(configPanel)
            for(var j=0; j < this.config.Tags.length; j++){
                if(this.config.Tags[j].Label == this.tags[index].config.Label){
                    this.config.Tags.splice(j, 1);
                    break;
                }
            }
            
            // remove the panel from Tag.
            this.tags.splice(index, 1)

            // Delete the Tag div.
            li.delete()
            this.hasChange()
        }

        // keep the connction config panel.
        this.tags.push(configPanel)
        return li;
    }

    onlogout() {
        super.onlogout();
    }


    cancel(){
        super.cancel();
        for(var i=0; i < this.tags.length; i++){
            // cancel each modifictions made on tags.
            this.tags[i].cancel()
        }
    }

    save(){
        for(var i=0; i < this.tags.length; i++){
            // Set the configuration values.
            this.tags[i].save()

            // Set the Tag in the config.
            let index = -1;
            for(var j=0; j < this.config.Tags.length; j++){
                if(this.config.Tags[j].Label == this.tags[i].config.Label){
                    index = j;
                    break;
                }
            }

            if(index == -1){
                this.config.Tags.push(this.tags[i].config);
            }else{
                this.config.Tags[index] = this.tags[i].config;
            }
        }

        // save it...
        super.save();
    }
}