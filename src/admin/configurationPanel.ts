import { Panel } from './panel';
import { randomUUID } from './utility';

/**
 * That represent a single configuration information ex.
 * Domain -> globular3.globular.app
 */
export class ConfigurationLine {
    protected id: string;

    // The panel inside where the line is display
    protected panel: ConfigurationPanel;

    // Must the name in the IConfig.
    private name: string;

    // The div that contain the line.
    private _content: any;

    public get content(): any {
        return this._content;
    }

    public set content(value: any) {
        this._content = value;
    }

    // The div that display non-editable values.
    protected valueDiv: any;

    // The div that play editable values.
    protected valueEditor: any;

    private _label: any;
    public get label(): any {
        return this._label;
    }
    public set label(value: any) {
        this._label = value;
    }

    getValueEditor(): any {
        return this.valueEditor;
    }

    constructor(panel: ConfigurationPanel, name: string, label: string, content: any) {
        this.id = randomUUID()
        this.name = name;
        this.content = content;
        this.panel = panel;

        // Name will be use if no label was given.
        if (label == undefined) {
            label = this.name
        }

        // Now I will create the part label of the interface.
        this.content = content.appendElement({ "tag": "div", "class": "row" }).down()
        this.label = this.content.appendElement({ "tag": "div", "class": "col s12 m4", "style": "height: 100%", "innerHtml": label }).down()
    }

    // Return the configuration values.
    public getValue(): any {
        return this.panel.config[this.name]
    }

    // Set the configuration values.
    public setValue(v: any) {
        this.panel.config[this.name] = v
    }

    /**
     * Set the value of the configuration with the value contain in the editor.
     */
    public set() {
        this.setValue(this.valueEditor.getValue())
        this.valueDiv.setValue(this.valueEditor.getValue())
    }

    /**
     * Reset the value of the configuration with it initial value.
     */
    public reset() {
        this.valueEditor.setValue(this.getValue())
        this.valueDiv.setValue(this.getValue())
    }

    /**
     * Non editable mode
     */
    lock() {
        this.valueEditor.element.style.display = "none"
        this.valueDiv.element.style.display = ""
    }

    /**
     * Editable mode.
     */
    unlock() {
        if (this.valueEditor != undefined) {
            this.valueEditor.element.style.display = ""
            this.valueDiv.element.style.display = "none"
        }
    }

    /**
     * Hide the line
     */
    hide() {
        this.content.element.style.display = "none";
    }

    /**
     * Show the line.
     */
    show() {
        this.content.element.style.display = "";
    }
}

export class ConfigurationEnum extends ConfigurationLine {

    constructor(panel: ConfigurationPanel, name: string, options: Array<string>, label: string, content: any, numericIndex: boolean) {
        super(panel, name, label, content);
        let value = this.getValue()
        if (value == null) {
            return
        }

        // Set the value div.
        this.valueDiv = this.content.appendElement({ "tag": "div", "id": this.id + "_" + name + "_div", class: "col s12 m8", "innerHtml": value.toString() }).down()

        // Set the value editor.
        this.valueEditor = this.content.appendElement({ "tag": "select", "id": this.id + "_" + name + "_select", "style": "display: none;", class: "browser-default col s12 m8" }).down()

        this.valueEditor.isNumeric = numericIndex;
        let i: number;
        for (i = 0; i < options.length; i++) {
            if (!numericIndex) {
                this.valueEditor.appendElement({ tag: "option", value: options[i], innerHtml: options[i] }).down()
            } else {
                this.valueEditor.appendElement({ tag: "option", value: i, innerHtml: options[i] }).down()
            }
        }

        M.FormSelect.init(this.valueEditor.element)
        if (numericIndex == true) {
            this.valueEditor.element.selectedIndex = value
        } else {
            this.valueEditor.element.selectedIndex = options.indexOf(value)
        }

        this.valueEditor.element.onchange = () => {
            // set the value in the interface.
            let value = this.valueEditor.getValue()
            this.valueDiv.setValue(value)
            this.panel.hasChange()
        }

        // Return the value of the input.
        this.valueEditor.getValue = () => {
            let value = this.valueEditor.element.value
            if (this.valueEditor.isNumeric == true) {
                value = parseInt(value)
            }
            return value
        }

        // Return the value of the input.
        this.valueEditor.setValue = function (v: any) {
            this.element.value = v
        }

        // Return the value of the input.
        this.valueDiv.setValue = function (v: any) {
            this.element.innerHTML = v
        }
    }
}

export class ConfigurationTextLine extends ConfigurationLine {

    constructor(panel: ConfigurationPanel, name: string, label: string, content: any, type?: string, step?: number, min?: number, max?: number) {
        super(panel, name, label, content);
        let value = this.getValue()
        if (value == null) {
            return
        }

        // Type can be any type that input box can support.
        if (type == undefined) {
            type = "text"
        }

        if (value == undefined) {
            return
        }

        // Set the value div.
        this.valueDiv = this.content.appendElement({ "tag": "div", "id": this.id + "_div", "class": "col s12 m8", "innerHtml": value.toString() }).down()

        // Set the value editor.
        this.valueEditor = this.content.appendElement({ "tag": "input", "id": this.id + "_input", "style": "display: none;", "class": "col s12 m8", "type": type, "value": value }).down()

        this.valueEditor.element.onchange = () => {
            // set the value in the interface.
            this.valueDiv.setValue(this.valueEditor.getValue())
            this.panel.hasChange()
        }

        // Return the value of the input.
        this.valueEditor.getValue = function () {
            if (type == "number") {
                return parseFloat(this.element.value)
            }
            return this.element.value
        }

        // Return the value of the input.
        this.valueEditor.setValue = function (v: any) {
            this.element.value = v
        }

        // Return the value of the input.
        this.valueDiv.setValue = function (v: any) {
            this.element.innerHTML = v
        }
    }
}

export class ConfigurationLongTextLine extends ConfigurationLine {

    constructor(panel: ConfigurationPanel, name: string, label: string, content: any) {
        super(panel, name, label, content);
        let value = this.getValue()
        if (value == null) {
            return
        }

        if (value == undefined) {
            return
        }

        // Set the value div.
        this.valueDiv = this.content.appendElement({ tag: "div", "id": this.id + "_div", class: "col s12 m8", innerHtml: value.toString() }).down()

        // Set the value editor.
        this.valueEditor = this.content.appendElement({ tag: "textarea", "id": this.id + "_input", style: "display: none; padding: 5px; height: 100px;", rows: "9", type: "text", class: "col s12 m8", innerHtml: value }).down()

        this.valueEditor.element.onchange = () => {
            // set the value in the interface.
            this.valueDiv.setValue(this.valueEditor.getValue())
            this.panel.hasChange()
        }

        // Return the value of the input.
        this.valueEditor.getValue = function () {
            return this.element.value
        }

        // Return the value of the input.
        this.valueEditor.setValue = function (v: any) {
            this.element.value = v
        }

        // Return the value of the input.
        this.valueDiv.setValue = function (v: any) {
            this.element.innerHTML = v
        }
    }
}

export class ConfigurationToggleLine extends ConfigurationLine {

    constructor(panel: ConfigurationPanel, name: string, label: string, content: any, labels: Array<string>) {
        super(panel, name, label, content);
        let value = this.getValue()
        if (value == null) {
            return
        }

        // Set the value div.
        this.valueDiv = this.content.appendElement({ "tag": "div", "id": this.id + "_" + name + "_div", "class": "col s12 m8", "innerHtml": value.toString() }).down()

        // Set the value editor.
        this.valueEditor = this.content
            .appendElement({ "tag": "div", "class": "switch col s12 m8", "style": "display: none;" }).down()

        let uuid = randomUUID()

        this.valueEditor.appendElement({ "tag": "label" }).down()
            .appendElement({ "tag": "span", "innerHtml": labels[1] })
            .appendElement({ "tag": "input", "id": uuid, "type": "checkbox" })
            .appendElement({ "tag": "span", "class": "lever" })
            .appendElement({ "tag": "span", "innerHtml": labels[0] })

        if (value == true) {
            this.valueEditor.getChildById(uuid).element.click()
        }

        this.valueEditor.element.onchange = () => {
            // set the value in the interface.
            this.valueDiv.setValue(this.valueEditor.getValue())
            this.panel.hasChange()
        }

        // Return the value of the input.
        this.valueEditor.getValue = function () {
            return this.getChildById(uuid).element.checked
        }

        // Return the value of the input.
        this.valueEditor.setValue = function (v: any) {
            this.getChildById(uuid).element.checked = v
        }

        // Return the value of the input.
        this.valueDiv.setValue = function (v: any) {
            this.element.innerHTML = v
        }
    }
}

/**
 * That class implement multiple options single choice configuration line.
 */
export class ConfigurationMultipleOptionsSingleChoiceLine extends ConfigurationLine {

    constructor(panel: ConfigurationPanel, name: string, options: Array<string>, label: string, content: any) {
        super(panel, name, label, content);
        this.valueDiv = this.content.appendElement({ "tag": "div", "id": this.id + "_" + name + "_div", "class": "col s12 m8", "innerHtml": this.getValue() }).down()
        this.valueEditor = this.content.appendElement({ "tag": "div", "class": "col s12 m8", "style": "display: none; justify-content: flex-start;" }).down()

        // Set the choice from options...
        for (var i = 0; i < options.length; i++) {
            this.valueEditor
                .appendElement({ "tag": "label", "id": this.id + "_" + options[i] + "_label", "style": "padding-right: 15px;" }).down()
                .appendElement({ "tag": "input", "id": this.id + "_" + options[i] + "_input", "name": this.id + "_" + name + "_group", "type": "radio" })
                .appendElement({ "tag": "span", "innerHtml": options[i] }).up()

            let input = this.content.getChildById(this.id + "_" + options[i] + "_input")
            input.element.onchange = () => {
                // set the value in the interface.
                this.valueDiv.setValue(this.valueEditor.getValue())
                this.panel.hasChange()
            }
        }

        // Return the value of the input.
        this.valueEditor.getValue = () => {
            // That function will return the actual checked value.
            for (var i = 0; i < options.length; i++) {
                let input = this.valueEditor.getChildById(this.id + "_" + options[i] + "_input")
                if (input.element.checked == true) {
                    return options[i]
                }
            }
        }

        // Return the value of the input.
        this.valueEditor.setValue = (v: any) => {
            for (var i = 0; i < options.length; i++) {
                let input = this.content.getChildById(this.id + "_" + options[i] + "_input")
                input.element.checked = false
            }
            let input = this.valueEditor.getChildById(this.id + "_" + v + "_input")
            input.element.checked = true;
        }

        // Return the value of the input.
        this.valueDiv.setValue = function (v: any) {
            this.element.innerHTML = v
        }

        // Set the value of the editor...
        this.valueEditor.setValue(this.getValue())
    }
}

/**
 * Use to display a liste of string values in a configuration.
 */
export class ConfigurationStringListLine extends ConfigurationLine {
    constructor(panel: ConfigurationPanel, name: string, label: string, content: any) {
        super(panel, name, label, content);

        // The value div.
        this.valueDiv = this.content.appendElement({ "tag": "ul", "id": this.id + "_" + name + "_div", "class": "collection col s12 m8" }).down()

        // The editor div.
        this.valueEditor = this.content.appendElement({ "tag": "div", "id": this.id + "_" + name + "_editor", "class": "col s12 m8", "style": "display: none; padding: 0px; margin: 0px; position: relative;" }).down()

        // Return the value of the input.
        this.valueEditor.getValue = () => {
            let inputs = document.getElementsByName(this.id + "_" + name + "_group")
            let values = new Array<string>()
            for (var i = 0; i < inputs.length; i++) {
                values.push((<any>inputs[i]).value)
            }
            return values;
        }

        // Return the value of the input.
        this.valueEditor.setValue = (values: any) => {
            if (values == undefined) {
                return;
            }
            let appendEditor = (index: number, value: string) => {
                let li = ul.appendElement({ "tag": "li", "class": "collection-item", "style": "padding: 0px;" }).down()
                let removeBtn = li.appendElement({ "tag": "label", "id": this.id + "_" + index + "_label", "style": "display: flex; align-items: center;" }).down()
                    .appendElement({ "tag": "input", "id": this.id + "_" + index + "_input", "name": this.id + "_" + name + "_group", "type": "text", "value": value })
                    .appendElement({ "tag": "i", "class": "tiny material-icons", "innerHtml": "remove", "style": "z-index: 10;" }).down()
                removeBtn.element.onmouseover = () => {
                    removeBtn.element.style.cursor = "pointer"
                }
                removeBtn.element.onmouseout = () => {
                    removeBtn.element.style.cursor = "default"
                }
                removeBtn.element.onclick = () => {
                    this.panel.hasChange()
                    li.element.parentNode.removeChild(li.element)
                }
                let input = this.content.getChildById(this.id + "_" + index + "_input")
                input.element.onchange = () => {
                    // set the value in the interface.
                    this.valueDiv.setValue(this.valueEditor.getValue())
                    this.panel.hasChange()
                }
            }

            this.valueEditor.removeAllChilds()
            let newLineBtn = this.valueEditor.appendElement({ "tag": "i", "class": "tiny material-icons", "innerHtml": "add_circle_outline", "style": "position: absolute; top: 12px; left: 4px; z-index: 10;" }).down()
            newLineBtn.element.onmouseover = () => {
                newLineBtn.element.style.cursor = "pointer"
            }
            newLineBtn.element.onmouseout = () => {
                newLineBtn.element.style.cursor = "default"
            }

            // Here I will set the list of control to edit the values.
            var ul = this.valueEditor.appendElement({ "tag": "ul", "id": this.id + "_" + name + "_editor", "class": "collection", "style": "padding: 15px;" }).down()

            // Apppend values.
            for (var i = 0; i < values.length; i++) {
                appendEditor(i, values[i])
            }

            newLineBtn.element.onclick = () => {
                // append a new line element.
                appendEditor(this.getValue().length, "")
                this.valueEditor.getChildById(this.id + "_" + this.getValue().length + "_input").element.focus()
                this.panel.hasChange()
            }

        }

        // Return the value of the input.
        this.valueDiv.setValue = (values: any) => {
            if (values == undefined) {
                return;
            }
            // Clear the content.
            this.valueDiv.removeAllChilds()
            // Apppend values.
            for (var i = 0; i < values.length; i++) {
                this.valueDiv.appendElement({ "tag": "li", "class": "collection-item", "id": this.id + "_" + name + "_div_" + i, "innerHtml": values[i] })
            }
        }

        // Set the actual configuration values.
        this.valueDiv.setValue(this.getValue())
        this.valueEditor.setValue(this.getValue())
    }
}

/**
 * That class will contain the general server information.
 */
export class ConfigurationPanel extends Panel {

    public set config(val: any) {
        this.config_ = val;
    }

    public get config(): any {
        return this.config_;
    }

    public config_: any;
    public content: any;
    public btnGroup: any;
    private saveBtn: any;
    private cancelBtn: any;
    private configurationLines: Array<ConfigurationLine>

    constructor(config: any, title: string, id: string, private config_id= "") {
        
        super(id);

        // Keep a pointer to the config.
        if (config.Id != undefined) {
            this.config_id = config.Id;
        }

        this.config_ = config;

        // Keep textual control
        this.configurationLines = new Array<ConfigurationLine>()

        // Display general information.
        this.div.appendElement({ "tag": "div", "class": "row configuration_panel" }).down()
            .appendElement({ "tag": "div", "class": "col s12 /*m10 offset-m1*/" }).down()
            .appendElement({ "tag": "div", "class": "card" }).down()
            .appendElement({ "tag": "div", "class": "card-content" }).down()
            .appendElement({ "tag": "span", "class": "card-title", "style": "font-size: medium; font-weight: inherit;", "innerHtml": title })
            .appendElement({ "tag": "div", "id": "content" })

            // The action buttons.
            .appendElement({ "tag": "div", "class": "card-action", "id": "btn_group", "style": "text-align: right; display: none;" }).down()
            .appendElement({ "tag": "a", "id": "save_btn", "href": "javascript:void(0)", "class": "waves-effect waves-light btn disabled", "innerHtml": "Save" })
            .appendElement({ "tag": "a", "id": "cancel_btn", "href": "javascript:void(0)", "class": "waves-effect waves-light btn disabled", "innerHtml": "Cancel" })

        // The save button
        this.saveBtn = this.div.getChildById("save_btn")
        this.saveBtn.element.onclick = () => {
            this.save()
        }

        // The cancel button
        this.cancelBtn = this.div.getChildById("cancel_btn")
        this.cancelBtn.element.onclick = () => {
            this.cancel()
        }

        // The group of button.
        this.btnGroup = this.div.getChildById("btn_group")

        // get the content.
        this.content = this.div.getChildById("content")
    }

    /**
     * 
     * @param name 
     * @param label 
     */
    appendEmptyConfig(name: string, label?: string): any {
        let configLine = new ConfigurationLine(this, name, label, this.content)
        return configLine;
    }

    /**
     * Append the textual configuration
     * @param name The name of the property in the configuration object.
     * @param label The value to display as label.
     */
    appendTextualConfig(name: string, label?: string, type?: string, step?: number, min?: number, max?: number): any {
        let configLine = new ConfigurationTextLine(this, name, label, this.content, type, step, min, max)
        this.configurationLines.push(configLine)
        return configLine
    }

    /**
     * Append the textual configuarion.
     * @param name The name of the field in the config.
     * @param label The name to display beside the text area.
     */
    appendLongTextualConfig(name: string, label?: string): any {
        let configLine = new ConfigurationLongTextLine(this, name, label, this.content)
        this.configurationLines.push(configLine)
        return configLine
    }

    /**
     * Append a boolean configuration (on/off true/false male/female...)
     * @param name The name of the property
     * @param labels The labels to display beside the switch
     * @param label Alternative property name in case the property name is a compose name.
     */
    appendBooleanConfig(name: string, labels: Array<string>, label?: string): any {
        let configLine = new ConfigurationToggleLine(this, name, label, this.content, labels)
        this.configurationLines.push(configLine)
        return configLine
    }

    /**
     * Append a multiple line configuration
     * @param name The name of the configuration
     * @param label The display name
     */
    appendStringListConfig(name: string, label?: string): any {
        let configLine = new ConfigurationStringListLine(this, name, label, this.content)
        this.configurationLines.push(configLine)
        return configLine
    }

    /**
     * Append multiple options single choice configuration line.
     * @param name The name of the configuration to display
     * @param options The list of possible values.
     * @param label The name to display in the interface.
     */
    appendMultipleOptionsSingleChoiceConfig(name: string, options: Array<string>, label?: string): any {
        let configLine = new ConfigurationMultipleOptionsSingleChoiceLine(this, name, options, label, this.content)
        this.configurationLines.push(configLine)
        return configLine
    }

    appendEnumConfig(name: string, options: Array<string>, numericalIndex: boolean, label?: string) {
        let configLine = new ConfigurationEnum(this, name, options, label, this.content, numericalIndex)
        this.configurationLines.push(configLine)
        return configLine
    }

    // create control...
    onlogin(data: any) {
        if (this.config_id.length == 0) {
            return // nothing that we can do here.
        }
        super.onlogin(data)

        // set the config with the full values.
        let config: any;
        if (data.Services != undefined) {
            config = data.Services[this.config_id]
        } else {
            config = data
        }

        if (config != undefined) {
            // Display textual input
            for (var i = 0; i < this.configurationLines.length; i++) {
                this.configurationLines[i].unlock()
            }
            this.btnGroup.element.style.display = ""
        } else {
            this.close() // disconnect listners.
            this.config_id = "";
            console.log(this.id, " has null config!")
        }
    }

    onlogout() {
        if (this.config_id.length == 0) {
            return // nothing that we can do here.
        }

        super.onlogout()

        // display values.
        for (var i = 0; i < this.configurationLines.length; i++) {
            this.configurationLines[i].lock()
        }

        this.btnGroup.element.style.display = "none"
        this.cancel()
    }

    // That function is the same for all configuration panels.
    save() {
        for (var i = 0; i < this.configurationLines.length; i++) {
            this.configurationLines[i].set()
        }

        this.cancelBtn.element.classList.add("disabled")
        this.saveBtn.element.classList.add("disabled")
    }

    // must be overide by each panel.
    cancel() {
        for (var i = 0; i < this.configurationLines.length; i++) {
            this.configurationLines[i].reset()
        }

        this.cancelBtn.element.classList.add("disabled")
        this.saveBtn.element.classList.add("disabled")
    }

    hasChange() {
        this.btnGroup.element.style.display = "" // display it if is not visible.
        this.cancelBtn.element.classList.remove("disabled")
        this.saveBtn.element.classList.remove("disabled")
    }
}