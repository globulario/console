import { ServicePanel } from "../servicePanel"
import { IServiceConfig } from "../../../../globular-mvc/node_modules/globular-web-client"
import { ConfigurationPanel } from "../configurationPanel";

/**
 * The sql service admin configuration interface.
 */
export class PlcLinkConfigPanel extends ServicePanel {
    private links: Array<ConfigurationPanel>;
    private plcServices: Map<string, any>;
    private plcServicesIds: Array<string>;

    constructor(service: IServiceConfig, id: string, name: string) {
        super(service, id, name)
        this.links = new Array<any>()
    }

    onlogin(data: any) {
        super.onlogin(data);

        // Do nothing in case the tags are ready exist.
        if (this.content.getChildById("lnks_div") != undefined) {
            return;
        }
        console.log(this.config)
        // set the full config.
        this.config = data.Services[this.config.Id]

        this.plcServices = new Map<string, any>()
        this.plcServicesIds = new Array<string>()

        for (var id in data.Services) {
            if (id.startsWith("plc.PlcService")) {
                this.plcServices.set(id, data.Services[id])
                this.plcServicesIds.push(id)
            }
        }

        // Here i will initialyse specifig configurations option.
        let lnksLine = this.appendEmptyConfig("Links")
        lnksLine.content.element.firstChild.className = "col s11 m3"
        lnksLine.content.appendElement({ tag: "i", class: "material-icons col s1", id: "append_new_Tag", innerHtml: "add" })

        let ul = lnksLine.content
            .appendElement({ tag: "div", class: "switch col s12 m8", id: "links_div" }).down()
            .appendElement({ tag: "ul", class: "collapsible", style: "box-shadow: none;" }).down()

        for (var id in this.config.Links) {
            this.createLinkConfigPanel(ul, this.config.Links[id])
        }

        M.Collapsible.init(ul.element)

        // The Tag id.
        let newLnkBtn = lnksLine.content.getChildById("append_new_Tag")
        newLnkBtn.element.onmouseover = function () {
            this.style.cursor = "pointer"
        }

        newLnkBtn.element.onmouseout = function () {
            this.style.cursor = "default"
        }

        newLnkBtn.element.onclick = () => {

            let Lnk = {
                Id: "", Frequency: 500,
                Target: { ServiceId: "", ConnectionId: "", Domain: "", Name: "", TypeName: "INT", Offset: 0, Length: 0 },
                Source: { ServiceId: "", ConnectionId: "", Domain: "", Name: "", TypeName: "INT", Offset: 0, Length: 0 }
            }

            let li = this.createLinkConfigPanel(ul, Lnk)

            let idInput = li.getChildById("id_input")
            idInput.element.setSelectionRange(0, idInput.element.value.length)
            idInput.element.style.display = ""
            idInput.element.focus()
            idInput.element.onclick = (evt: any) => {
                evt.stopPropagation()
            }

            let idSpan = li.getChildById("id_span")
            idSpan.element.style.display = "none"
        }

    }

    createLinkConfigPanel(ul: any, Lnk: any): any {
        // Here I will create the tags.
        let li = ul.prependElement({ tag: "li" }).down()

        let deleteBtn = li.appendElement({ tag: "div", class: "collapsible-header", style: "display: flex; align-items: center;" }).down()
            .appendElement({ tag: "span", id: "id_span", class: "col s6", innerHtml: Lnk.Id })
            .appendElement({ tag: "input", id: "id_input", class: "col s6", value: Lnk.Id, style: "display:none;" })
            .appendElement({ tag: "div", class: "col s6 right-align" }).down()
            .appendElement({ tag: "i", class: "Small material-icons", style: "cursor: default;", innerHtml: "delete" }).down()

        let idInput = li.getChildById("id_input")
        let idSpan = li.getChildById("id_span")

        idInput.element.onchange = () => {
            // Set the value...
            idSpan.element.innerHTML = idInput.element.value;
            Lnk.Id = idInput.element.value;
        }

        idInput.element.onkeyup = (evt: any) => {
            // Set the value...
            idSpan.element.innerHTML = idInput.element.value;
            if (evt.keyCode == 13) {
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

        deleteBtn.element.onclick = (evt: any) => {
            evt.stopPropagation()

            // Delete the link here 

            /*let index = this.tags.indexOf(configPanel)
            for(var j=0; j < this.config.Tags.length; j++){
                if(this.config.Tags[j].Label == this.tags[index].config.Label){
                    this.config.Tags.splice(j, 1);
                    break;
                }
            }
            
            // remove the panel from Tag.
            this.tags.splice(index, 1)
            */

            // Delete the Tag div.
            li.delete()
            this.hasChange()
        }

        let content = li.appendElement({ tag: "div", class: "collapsible-body" }).down()
            .appendElement({ tag: "div", id: "content" }).down()

        let configPanel = new ConfigurationPanel(Lnk, "", "");
        configPanel.appendTextualConfig("Frequency", "Frequency", "number", 1, 500, 65535).unlock();

        // append the link config panel to the collapsible body.
        content.appendElement(configPanel.content);

        // Now I will create the source and the target panel tabs.
        let tabs = content
            .appendElement({ tag: "div", class: "row" }).down()
            .appendElement({ tag: "div", class: "col s12" }).down()
            .appendElement({ tag: "ul", class: "tabs" }).down()

        let tabsDiv = content.appendElement({ tag: "div", class: "row" }).down()

        // Create the source tag panel
        let sourceTab = tabs.appendElement({ tag: "li", id: "source_tab", class: "tab col s6" }).down()
            .appendElement({ tag: "a", href: "javascript:void(0)", class: "active", innerHtml: "Source" }).down()

        let sourceTabDiv = tabsDiv.appendElement({ tag: "div", id: "source_tab_div" }).down()
        let sourceTabPanel = this.createTagConfigPanel(sourceTabDiv, Lnk.Source)

        // Create the target source panel
        let targetTab = tabs.appendElement({ tag: "li", id: "target_tab", class: "tab col s6" }).down()
            .appendElement({ tag: "a", href: "javascript:void(0)", innerHtml: "Target" }).down()

        let targetTabDiv = tabsDiv.appendElement({ tag: "div", id: "target_tab_div", style: "display:none;" }).down()
        let targetTabPanel = this.createTagConfigPanel(targetTabDiv, Lnk.Target)

        // Init the tabs.
        M.Tabs.init(tabs.element);

        // keep the connction config panel.
        sourceTab.element.onclick = () => {
            targetTabDiv.element.style.display = "none";
            sourceTabDiv.element.style.display = "block";
        }

        targetTab.element.onclick = () => {
            targetTabDiv.element.style.display = "block";
            sourceTabDiv.element.style.display = "none";
        }

        this.links.push(configPanel)

        configPanel.save = () => {
            super.save()
            // set the link source and the target from the panel.
            sourceTabPanel.save()
            // this.config.Source = sourceTabPanel.config
            targetTabPanel.save()
            // this.config.Target = sourceTabPanel.config

            console.log("-----> configuation must be save: ", this.config)
        }

        return li;
    }

    createTagConfigPanel(TagDiv: any, Tag: any): any {

        let connectionIds = new Array<string>();

        if (Tag.ServiceId != "") {
            for (var i = 0; i < this.plcServices.get(Tag.ServiceId).Connections.length; i++) {
                connectionIds.push(this.plcServices.get(Tag.ServiceId).Connections[i].Id)
            }
            Tag.Domain = this.plcServices.get(Tag.ServiceId).Domain;
        }

        // Now I will create a new coniguration panel.
        let configPanel = new ConfigurationPanel(Tag, "", "");
        let serviceIdSelect = configPanel.appendEnumConfig("ServiceId", this.plcServicesIds, false); // enum 
        let connectionIdSelect = configPanel.appendEnumConfig("ConnectionId", connectionIds, false); // enum
        configPanel.appendTextualConfig("Name");
        configPanel.appendEnumConfig("TypeName", ["BOOL", "SINT", "INT", "DINT", "REAL"], false);
        configPanel.appendTextualConfig("Offset", "Offset", "number", 1, 0, 65535);
        configPanel.appendTextualConfig("Length", "Length", "number", 1, 0, 65535);

        // Connect event on serviceId select change.
        let onChange_ = serviceIdSelect.getValueEditor().element.onchange
        serviceIdSelect.getValueEditor().element.onchange = () => {
            onChange_();
            // get the services with the select id.
            let service = this.plcServices.get(serviceIdSelect.getValueEditor().getValue())
            Tag.Domain = service.Domain;
            // remove the actual values.
            connectionIdSelect.getValueEditor().removeAllChilds()
            for (var i = 0; i < service.Connections.length; i++) {
                connectionIdSelect.getValueEditor().appendElement({ tag: "option", value: service.Connections[i].Id, innerHtml: service.Connections[i].Id }).down()
            }
        }

        TagDiv.appendElement(configPanel.content);
        configPanel.onlogin(Tag)

        // redirect the config event...
        configPanel.hasChange = () => {
            this.hasChange()
        }

        return configPanel;
    }

    onlogout() {
        super.onlogout();
    }


    cancel() {
        super.cancel();

    }

    save() {
        // save it...
        for (let i = 0; i < this.links.length; i++) {
            // Save the configuation.
            this.links[i].save()
            this.config.Links[this.links[i].config.Id] = this.links[i].config
        }

        super.save();

        console.log(this.config)
    }
}