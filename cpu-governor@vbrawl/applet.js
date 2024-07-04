const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const FileUtils = imports.misc.fileUtils;
const SignalManager = imports.misc.signalManager;

const CPU_FREQUENCY_PATH = "/sys/devices/system/cpu/cpufreq/";


const CPUGovernorManager = class CPUGovernorManager {
    constructor(callback) {
        this._cpu_governor_paths = [];
        const cpu_governor_dir = Gio.File.new_for_path(CPU_FREQUENCY_PATH);
        FileUtils.listDirAsync(cpu_governor_dir, (paths) => {
            for (let i = 0; i < paths.length; i++) {
                const path = paths[i].get_name();
                if(path.startsWith("policy")) {
                    this._cpu_governor_paths.push(GLib.build_filenamev([CPU_FREQUENCY_PATH, path]));
                }
            }
            
            this._cpu_governor_paths.sort();
            callback();
        });
    }

    get_governor() {
        return String(GLib.file_get_contents(GLib.build_filenamev([this._cpu_governor_paths[0], "scaling_governor"]))[1]).trim();
    }

    set_governor(governor) {
        for (let i = 0; i < this._cpu_governor_paths.length; i++) {
            try {
                const path = GLib.build_filenamev([this._cpu_governor_paths[i], "scaling_governor"]);
                GLib.file_set_contents_full(path, governor, GLib.FileSetContentsFlags.NONE, 0o0660);
            }
            catch(e) { global.log(e); }
        }
    }

    get_available_governors() {
        var available_governors = [];
        for (let i = 0; i < this._cpu_governor_paths.length; i++) {
            const path = GLib.build_filenamev([this._cpu_governor_paths[i], "scaling_available_governors"]);
            const governors = String(GLib.file_get_contents(path)[1]).trim().split(' ');

            if(i === 0) {
                available_governors = governors;
            }
            else {
                for (let g_i = 0; g_i < available_governors.length; g_i++) {
                    const available_governor = available_governors[g_i];
                    if(governors.findIndex((v, i, o) => {return v === available_governor;}) === -1) {
                        available_governor.remove(available_governor);
                        g_i-=1;
                    }
                }
            }
        }
        return available_governors;
    }
}



const GovernorSection = class GovernorSection extends PopupMenu.PopupMenuSection {
    constructor(owner, available_governors, on_option_click) {
        super();
        this._signalManager = new SignalManager.SignalManager(null);

        this._governor_label = new PopupMenu.PopupIndicatorMenuItem("CPU Governor: ");
        this.addMenuItem(this._governor_label);

        this._separator = new PopupMenu.PopupSeparatorMenuItem();
        this.addMenuItem(this._separator);

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

        this.set_applet_icon_name("logo");
        this.set_applet_tooltip("Change CPU Governor");

        this._governor_manager = new CPUGovernorManager(() => {
            this.available_governors = this._governor_manager.get_available_governors();

            /********************
             * Setup Popup Menu *
             ********************/
            this._menu_manager = new PopupMenu.PopupMenuManager(this);
            this._menu = new Applet.AppletPopupMenu(this, orientation);
            this._menu_governor_section = new GovernorSection(this, this.available_governors, this.update_governor);
            this._menu.addMenuItem(this._menu_governor_section);
            this._menu_manager.addMenu(this._menu);
        });

    }

    check_governor_update() {
        const governor = this._governor_manager.get_governor();
        this._menu_governor_section.update_governor_label(governor);
        return governor;
    }

    on_applet_clicked() {
        this._menu.toggle();
        this.check_governor_update();
    }

    update_governor(_this, governor) {
        _this._governor_manager.set_governor(governor);
    }
}


function main(metadata, orientation, panel_height, instance_id) {
    return new CPUGovernor(orientation, panel_height, instance_id);
}