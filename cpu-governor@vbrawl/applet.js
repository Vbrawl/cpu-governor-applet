const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const SignalManager = imports.misc.signalManager;


const GovernorSection = class GovernorSection extends PopupMenu.PopupMenuSection {
    constructor(owner, available_governors, on_option_click) {
        super();
        this._signalManager = new SignalManager.SignalManager(null);

        this._governor_label = new PopupMenu.PopupIndicatorMenuItem("CPU Governor: ");
        this.addMenuItem(this._governor_label);

        this.governor_options = [];
        for (let i = 0; i < available_governors.length; i++) {
            const governor = available_governors[i];
            const governor_label = new PopupMenu.PopupIndicatorMenuItem(governor);
            this._signalManager.connect(governor_label, "activate", function() {on_option_click(this, governor);}, owner);
            this.addMenuItem(governor_label);
            this.governor_options.push(governor_label);
        }
    }

    update_governor_label(new_governor) {
        this._governor_label.setAccel(new_governor);
    }
}




const CPUGovernor = class CPUGovernor extends Applet.IconApplet {
    constructor(orientation, panel_height, instance_id) {
        super(orientation, panel_height, instance_id);

        this._cpu_governor_path = "/sys/devices/system/cpu/cpufreq/policy0/scaling_governor";
        this._cpu_available_governors_path = "/sys/devices/system/cpu/cpufreq/policy0/scaling_available_governors";
        this.available_governors = this.get_available_governors();

        /********************
         * Setup Popup Menu *
         ********************/
        this._menu_manager = new PopupMenu.PopupMenuManager(this);
        this._menu = new Applet.AppletPopupMenu(this, orientation);
        this._menu_governor_section = new GovernorSection(this, this.available_governors, this.set_governor);
        this._menu.addMenuItem(this._menu_governor_section);
        this._menu_manager.addMenu(this._menu);

        this.set_applet_icon_name("logo");
        this.set_applet_tooltip("Change CPU Governor");
    }

    get_governor() {
        return String(GLib.file_get_contents(this._cpu_governor_path)[1]).trim();
    }

    set_governor(_this, governor) {
        try {
            GLib.file_set_contents_full(_this._cpu_governor_path, governor, GLib.FileSetContentsFlags.NONE, 0o0660);
        }
        catch(e) { global.log(e); }
    }

    get_available_governors() {
        return String(GLib.file_get_contents(this._cpu_available_governors_path)[1]).trim().split(' ');
    }

    check_governor_update() {
        const governor = this.get_governor();
        this._menu_governor_section.update_governor_label(governor);
        return governor;
    }

    on_applet_clicked() {
        this._menu.toggle();
        this.check_governor_update();
    }
}


function main(metadata, orientation, panel_height, instance_id) {
    return new CPUGovernor(orientation, panel_height, instance_id);
}