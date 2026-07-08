import {
	App,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
	getLanguage,
	normalizePath
} from "obsidian";

interface QuickTraySettings {
	closeToTray: boolean;
	quickNoteFolder: string;
	quickNoteNamePattern: string;
	openCreatedNote: boolean;
	customTrayIconPath: string;
	quickSearchMode: QuickSearchMode;
	trayClickAction: TrayClickAction;
	quickNoteHotkey: string;
	quickSearchHotkey: string;
	toggleObsidianHotkey: string;
}

type QuickSearchMode = "search" | "quick-switcher";
type TrayClickAction = "toggle-obsidian" | "quick-note" | "quick-search";
type SupportedLanguage = "en" | "ko";

const DEFAULT_SETTINGS: QuickTraySettings = {
	closeToTray: true,
	quickNoteFolder: "Quick Notes",
	quickNoteNamePattern: "{{date}} {{time}} - {{title}}",
	openCreatedNote: true,
	customTrayIconPath: "",
	quickSearchMode: "search",
	trayClickAction: "toggle-obsidian",
	quickNoteHotkey: "Ctrl+Shift+Q",
	quickSearchHotkey: "Ctrl+Shift+K",
	toggleObsidianHotkey: "Ctrl+Shift+O"
};

const TRANSLATIONS = {
	en: {
		commandCreateQuickNote: "Create quick note",
		commandOpenQuickSearch: "Open quick search",
		commandToggleObsidian: "Open or hide Obsidian",
		electronUnavailable: "Quick Tray: Electron APIs are unavailable. Commands are registered, but tray/global shortcuts are disabled.",
		coreCommandMissing: "Quick Tray: {mode} command was not found. Check that the core plugin is enabled.",
		obsidianWindowNotFound: "Quick Tray: Obsidian window was not found.",
		restartUnavailable: "Quick Tray: restart is unavailable in this Obsidian build.",
		trayIconFailed: "Quick Tray: failed to create tray icon. Check the custom icon path.",
		hotkeyRegisterFailed: "Quick Tray: could not register global shortcut {hotkey}.",
		invalidQuickNoteData: "Quick Tray: invalid quick note data.",
		quickNoteCreated: "Quick Tray: created {path}",
		quickNoteCreateFailed: "Quick Tray: failed to create quick note.",
		quickNote: "Quick note",
		quickSearch: "Quick search",
		openHideObsidian: "Open/hide Obsidian",
		restartObsidian: "Restart Obsidian",
		quitObsidian: "Quit Obsidian",
		search: "Search",
		quickSwitcher: "Quick switcher",
		quickNoteTitle: "Quick note",
		title: "Title",
		body: "Body",
		untitled: "Untitled",
		bodyPlaceholder: "Write your note here.",
		create: "Create",
		cancel: "Cancel",
		settingsTitle: "Quick Tray",
		closeToTrayName: "Hide to tray on close",
		closeToTrayDesc: "Hide the Obsidian window instead of quitting when it is closed.",
		quickNoteFolderName: "Quick note location",
		quickNoteFolderDesc: "Folder path relative to the vault.",
		quickNotePatternName: "Quick note filename pattern",
		quickNotePatternDesc: "Available tokens: {{date}}, {{time}}, {{timestamp}}, {{title}}",
		openCreatedNoteName: "Open created note",
		openCreatedNoteDesc: "Open the quick note in the editor after it is created.",
		trayIconName: "Tray icon image",
		trayIconDesc: "Leave blank to use the bundled icon. Enter an absolute ICO or PNG path.",
		trayClickActionName: "Tray icon click action",
		trayClickActionDesc: "Choose what happens when the tray icon is left-clicked.",
		quickSearchModeName: "Quick search action",
		quickSearchModeDesc: "Choose which Obsidian core feature the quick search menu and shortcut run.",
		globalHotkeys: "Global hotkeys",
		globalHotkeysHint: "OS-wide shortcuts only work in desktop builds where Electron global shortcut APIs are available."
	},
	ko: {
		commandCreateQuickNote: "빠른 노트 작성",
		commandOpenQuickSearch: "빠른 검색 열기",
		commandToggleObsidian: "옵시디언 열기/닫기",
		electronUnavailable: "Quick Tray: Electron API를 사용할 수 없습니다. 명령은 등록됐지만 트레이/전역 단축키는 비활성화됩니다.",
		coreCommandMissing: "Quick Tray: {mode} 명령을 찾을 수 없습니다. 해당 코어 플러그인이 켜져 있는지 확인하세요.",
		obsidianWindowNotFound: "Quick Tray: Obsidian 창을 찾을 수 없습니다.",
		restartUnavailable: "Quick Tray: 이 Obsidian 빌드에서는 재시작을 사용할 수 없습니다.",
		trayIconFailed: "Quick Tray: 트레이 아이콘 생성에 실패했습니다. 커스텀 아이콘 경로를 확인하세요.",
		hotkeyRegisterFailed: "Quick Tray: 전역 단축키 {hotkey} 등록에 실패했습니다.",
		invalidQuickNoteData: "Quick Tray: 빠른 노트 데이터가 올바르지 않습니다.",
		quickNoteCreated: "Quick Tray: {path} 생성됨",
		quickNoteCreateFailed: "Quick Tray: 빠른 노트 생성에 실패했습니다.",
		quickNote: "빠른 노트 작성",
		quickSearch: "빠른 검색",
		openHideObsidian: "옵시디언 열기/닫기",
		restartObsidian: "옵시디언 재실행",
		quitObsidian: "옵시디언 종료",
		search: "검색",
		quickSwitcher: "빠른 전환기",
		quickNoteTitle: "빠른 노트 작성",
		title: "제목",
		body: "내용",
		untitled: "Untitled",
		bodyPlaceholder: "메모 내용을 입력하세요.",
		create: "생성",
		cancel: "취소",
		settingsTitle: "Quick Tray",
		closeToTrayName: "닫을 때 트레이로 숨기기",
		closeToTrayDesc: "옵시디언 창을 닫으면 종료하지 않고 숨깁니다.",
		quickNoteFolderName: "빠른 노트 위치",
		quickNoteFolderDesc: "Vault 기준 폴더 경로입니다.",
		quickNotePatternName: "빠른 노트 이름 규칙",
		quickNotePatternDesc: "사용 가능 토큰: {{date}}, {{time}}, {{timestamp}}, {{title}}",
		openCreatedNoteName: "생성한 노트 열기",
		openCreatedNoteDesc: "빠른 노트 생성 후 편집 화면으로 엽니다.",
		trayIconName: "트레이 아이콘 이미지",
		trayIconDesc: "비워두면 내장 아이콘을 사용합니다. ICO 또는 PNG 절대 경로를 입력하세요.",
		trayClickActionName: "트레이 아이콘 클릭 동작",
		trayClickActionDesc: "트레이 아이콘을 왼쪽 클릭했을 때 실행할 동작을 선택합니다.",
		quickSearchModeName: "빠른 검색 동작",
		quickSearchModeDesc: "빠른 검색 메뉴와 단축키가 실행할 Obsidian 핵심 기능을 선택합니다.",
		globalHotkeys: "전역 단축키",
		globalHotkeysHint: "Electron 전역 단축키 API가 허용되는 데스크톱 빌드에서만 OS 전역으로 동작합니다."
	}
} as const;

type TranslationKey = keyof typeof TRANSLATIONS.en;

const DEFAULT_TRAY_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHZSURBVDhPlZKxTxRBFMa/XZcF7nIG7mjxjoRCwomJxgsFdhaASqzQxFDzB1AQKgstLGxIiBQGJBpiCCGx8h+wgYaGgAWNd0dyHofeEYVwt/PmOTMZV9aDIL/s5pvZvPfN9yaL/+HR3eXcypta0m4juFbP5GHuXc9IbunDFc9db/G81/ZzhDMN7g8td47mll4R5BfHwZN4LOaA+fHa259PbUmIYzWkt3e2NZNo3/V9v1vvU6kkstk+tLW3ItUVr/m+c3N8MlkwxYqmBFcbwUQQCNOcyVzDwEAWjuPi5DhAMV/tKOYPX5hCyz8Gz1zX5SmWjBvZfmTSaRBJkGAIoxJHv+pVW2yIGNxOJ8bUVNcFEWLxuG1ia6JercTbttwQTeDwPS0kCMXiXtgk/jQrFUw7ptYSMWApF40yo/ytjHq98fdk3ayVE+cn2CxMb6ruz9qAJKFUKoWza1VJSi/n0+ffgYHdWW2gHuxXymg0gjCB0sjpmiaDnkL3RzDyzLqBUKns2ztQqUR0fk2TwSrGSf1eczqF5vsPZRCQSSAFLk6gqctgQRkc6TWRQLV2YMYQki9OoNkqzFQ9r+WOGuW5CrJbOzyAlPKr6MSGLbkcDwbf35oY/jRkt6cAfgNwowruAMz9AgAAAABJRU5ErkJggg==";

type ElectronApi = {
	Tray?: new (image: unknown) => TrayLike;
	Menu?: MenuLike;
	nativeImage?: NativeImageLike;
	app?: ElectronAppLike;
	BrowserWindow?: BrowserWindowLike;
	globalShortcut?: GlobalShortcutLike;
	getCurrentWindow?: () => BrowserWindowInstanceLike;
};

type TrayLike = {
	setToolTip?: (tooltip: string) => void;
	setContextMenu?: (menu: unknown) => void;
	on?: (event: string, callback: () => void) => void;
	destroy?: () => void;
};

type MenuLike = {
	buildFromTemplate: (template: Array<Record<string, unknown>>) => unknown;
};

type NativeImageLike = {
	createFromPath: (path: string) => unknown;
	createFromDataURL: (dataUrl: string) => unknown;
};

type ElectronAppLike = {
	relaunch?: () => void;
	exit?: (code?: number) => void;
	quit?: () => void;
	getPath?: (name: string) => string;
};

type BrowserWindowLike = {
	new (options: BrowserWindowOptionsLike): BrowserWindowInstanceLike;
	getFocusedWindow?: () => BrowserWindowInstanceLike | null;
	getAllWindows?: () => BrowserWindowInstanceLike[];
};

type BrowserWindowOptionsLike = {
	width?: number;
	height?: number;
	minWidth?: number;
	minHeight?: number;
	title?: string;
	show?: boolean;
	resizable?: boolean;
	minimizable?: boolean;
	maximizable?: boolean;
	fullscreenable?: boolean;
	autoHideMenuBar?: boolean;
	backgroundColor?: string;
	webPreferences?: Record<string, unknown>;
};

type BrowserWindowInstanceLike = {
	show?: () => void;
	hide?: () => void;
	focus?: () => void;
	close?: () => void;
	isVisible?: () => boolean;
	isMinimized?: () => boolean;
	isDestroyed?: () => boolean;
	restore?: () => void;
	loadURL?: (url: string) => Promise<void>;
	setMenu?: (menu: unknown) => void;
	on?: (event: string, callback: (...args: any[]) => void) => void;
	removeListener?: (event: string, callback: (...args: any[]) => void) => void;
	webContents?: WebContentsLike;
};

type WebContentsLike = {
	on?: (event: string, callback: (...args: any[]) => void) => void;
};

type GlobalShortcutLike = {
	register: (accelerator: string, callback: () => void) => boolean;
	unregister: (accelerator: string) => void;
};

export default class QuickTrayPlugin extends Plugin {
	settings!: QuickTraySettings;
	language: SupportedLanguage = "en";
	private electron: ElectronApi | null = null;
	private tray: TrayLike | null = null;
	private closeHandler: ((event: { preventDefault: () => void }) => void) | null = null;
	private beforeUnloadHandler: ((event: BeforeUnloadEvent) => void) | null = null;
	private registeredGlobalHotkeys: string[] = [];
	private failedGlobalHotkeys = new Set<string>();
	private quickNoteModal: QuickNoteModal | null = null;
	private quickNoteWindow: BrowserWindowInstanceLike | null = null;
	private isQuitting = false;

	async onload(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.language = detectLanguage();
		this.electron = getElectronApi();

		this.addCommand({
			id: "create-quick-note",
			name: this.t("commandCreateQuickNote"),
			callback: () => this.openQuickNoteModal()
		});

		this.addCommand({
			id: "open-quick-search",
			name: this.t("commandOpenQuickSearch"),
			callback: () => this.openQuickSearch()
		});

		this.addCommand({
			id: "toggle-obsidian-window",
			name: this.t("commandToggleObsidian"),
			callback: () => this.toggleObsidianWindow()
		});

		this.addSettingTab(new QuickTraySettingTab(this.app, this));
		this.installCloseToTrayHandler();
		this.createTray();
		this.registerGlobalHotkeys();

		if (!this.electron) {
			new Notice(this.t("electronUnavailable"));
		}
	}

	t(key: TranslationKey, replacements: Record<string, string> = {}): string {
		this.language = detectLanguage();
		let value: string = TRANSLATIONS[this.language][key] ?? TRANSLATIONS.en[key];
		for (const [name, replacement] of Object.entries(replacements)) {
			value = value.replaceAll(`{${name}}`, replacement);
		}
		return value;
	}

	onunload(): void {
		this.unregisterGlobalHotkeys();
		this.removeCloseToTrayHandler();
		this.destroyTray();
		this.quickNoteWindow?.close?.();
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	refreshDesktopIntegrations(showHotkeyNotices = false): void {
		this.unregisterGlobalHotkeys();
		this.destroyTray();
		this.removeCloseToTrayHandler();
		this.installCloseToTrayHandler();
		this.createTray();
		this.registerGlobalHotkeys(showHotkeyNotices);
	}

	openQuickNoteModal(): void {
		if (this.openDetachedQuickNoteWindow()) {
			return;
		}

		this.showWindow();
		if (this.quickNoteModal) {
			return;
		}

		this.quickNoteModal = new QuickNoteModal(this.app, this, () => {
			this.quickNoteModal = null;
		});
		this.quickNoteModal.open();
	}

	async createQuickNote(title: string, body: string): Promise<TFile> {
		const folder = normalizePath(this.settings.quickNoteFolder.trim());
		const fileName = this.buildQuickNoteName(title);
		const path = normalizePath(folder ? `${folder}/${fileName}.md` : `${fileName}.md`);

		if (folder) {
			await ensureFolder(this.app, folder);
		}

		const uniquePath = await this.createUniquePath(path);
		const content = buildNoteContent(title, body);
		const file = await this.app.vault.create(uniquePath, content);

		if (this.settings.openCreatedNote) {
			await this.app.workspace.getLeaf(false).openFile(file);
		}

		return file;
	}

	openQuickSearch(): void {
		this.showWindow();
		const commands = getCommandApi(this.app);
		const commandId = this.settings.quickSearchMode === "quick-switcher"
			? "switcher:open"
			: "global-search:open";

		if (commands.executeCommandById(commandId)) {
			return;
		}

		const modeName = this.settings.quickSearchMode === "quick-switcher" ? this.t("quickSwitcher") : this.t("search");
		new Notice(this.t("coreCommandMissing", { mode: modeName }));
	}

	toggleObsidianWindow(): void {
		const win = this.getWindow();
		if (!win) {
			new Notice(this.t("obsidianWindowNotFound"));
			return;
		}

		if (win.isVisible?.()) {
			win.hide?.();
		} else {
			this.showWindow();
		}
	}

	showWindow(): void {
		const win = this.getWindow();
		win?.show?.();
		if (win?.isMinimized?.()) {
			win.restore?.();
		}
		win?.focus?.();
	}

	hideWindow(): void {
		this.getWindow()?.hide?.();
	}

	restartObsidian(): void {
		const app = this.electron?.app;
		if (!app?.relaunch || !app.exit) {
			new Notice(this.t("restartUnavailable"));
			return;
		}
		this.isQuitting = true;
		app.relaunch();
		app.exit(0);
	}

	quitObsidian(): void {
		this.isQuitting = true;
		const app = this.electron?.app;
		if (app?.quit) {
			app.quit();
			return;
		}
		if (app?.exit) {
			app.exit(0);
		}
	}

	private installCloseToTrayHandler(): void {
		if (!this.settings.closeToTray || this.closeHandler) {
			return;
		}

		const win = this.getWindow();
		if (!win?.on) {
			return;
		}

		this.closeHandler = (event) => {
			if (this.isQuitting) {
				return;
			}
			event.preventDefault();
			win.hide?.();
		};

		this.beforeUnloadHandler = (event) => {
			if (this.isQuitting) {
				return;
			}
			event.preventDefault();
			event.stopImmediatePropagation();
			event.returnValue = "";
			this.hideWindow();
		};

		win.on("close", this.closeHandler);
		window.addEventListener("beforeunload", this.beforeUnloadHandler, true);
	}

	private removeCloseToTrayHandler(): void {
		const win = this.getWindow();
		if (this.closeHandler && win?.removeListener) {
			win.removeListener("close", this.closeHandler);
		}
		if (this.beforeUnloadHandler) {
			window.removeEventListener("beforeunload", this.beforeUnloadHandler, true);
		}
		this.closeHandler = null;
		this.beforeUnloadHandler = null;
	}

	private createTray(): void {
		const electron = this.electron;
		if (!electron?.Tray || !electron.Menu || !electron.nativeImage || this.tray) {
			return;
		}

		try {
			const image = this.createTrayImage(electron.nativeImage);
			this.tray = new electron.Tray(image);
			this.tray.setToolTip?.("Obsidian Quick Tray");
			this.tray.on?.("click", () => this.runTrayClickAction());
			this.updateTrayMenu();
		} catch (error) {
			console.error("Quick Tray: failed to create tray icon.", error);
			new Notice(this.t("trayIconFailed"));
		}
	}

	private destroyTray(): void {
		this.tray?.destroy?.();
		this.tray = null;
	}

	private updateTrayMenu(): void {
		if (!this.tray || !this.electron?.Menu) {
			return;
		}

		const menu = this.electron.Menu.buildFromTemplate([
			{ label: this.t("quickNote"), click: () => this.openQuickNoteModal() },
			{ label: this.t("quickSearch"), click: () => this.openQuickSearch() },
			{ type: "separator" },
			{ label: this.t("openHideObsidian"), click: () => this.toggleObsidianWindow() },
			{ label: this.t("restartObsidian"), click: () => this.restartObsidian() },
			{ type: "separator" },
			{ label: this.t("quitObsidian"), click: () => this.quitObsidian() }
		]);

		this.tray.setContextMenu?.(menu);
	}

	refreshLanguage(): void {
		const nextLanguage = detectLanguage();
		if (nextLanguage === this.language) {
			return;
		}
		this.language = nextLanguage;
		this.updateTrayMenu();
	}

	private runTrayClickAction(): void {
		switch (this.settings.trayClickAction) {
			case "quick-note":
				this.openQuickNoteModal();
				return;
			case "quick-search":
				this.openQuickSearch();
				return;
			case "toggle-obsidian":
				this.toggleObsidianWindow();
				return;
		}
	}

	private createTrayImage(nativeImage: NativeImageLike): unknown {
		const iconPath = this.settings.customTrayIconPath.trim();
		if (iconPath) {
			const customIcon = nativeImage.createFromPath(iconPath);
			if (customIcon) {
				return customIcon;
			}
		}
		return nativeImage.createFromDataURL(DEFAULT_TRAY_ICON);
	}

	private registerGlobalHotkeys(showNotices = true): void {
		const globalShortcut = this.electron?.globalShortcut;
		if (!globalShortcut) {
			return;
		}

		this.registerGlobalHotkey(this.settings.quickNoteHotkey, () => this.openQuickNoteModal(), showNotices);
		this.registerGlobalHotkey(this.settings.quickSearchHotkey, () => this.openQuickSearch(), showNotices);
		this.registerGlobalHotkey(this.settings.toggleObsidianHotkey, () => this.toggleObsidianWindow(), showNotices);
	}

	private registerGlobalHotkey(accelerator: string, callback: () => void, showNotices: boolean): void {
		const normalized = accelerator.trim();
		const globalShortcut = this.electron?.globalShortcut;
		if (!normalized || !globalShortcut) {
			return;
		}

		try {
			if (globalShortcut.register(normalized, callback)) {
				this.registeredGlobalHotkeys.push(normalized);
				this.failedGlobalHotkeys.delete(normalized);
			} else {
				this.notifyHotkeyFailure(normalized, showNotices);
			}
		} catch (error) {
			console.error(`Quick Tray: failed to register global shortcut ${normalized}.`, error);
			this.notifyHotkeyFailure(normalized, showNotices);
		}
	}

	private notifyHotkeyFailure(accelerator: string, showNotice: boolean): void {
		if (!showNotice || this.failedGlobalHotkeys.has(accelerator)) {
			return;
		}
		this.failedGlobalHotkeys.add(accelerator);
		new Notice(this.t("hotkeyRegisterFailed", { hotkey: accelerator }));
	}

	private unregisterGlobalHotkeys(): void {
		const globalShortcut = this.electron?.globalShortcut;
		if (!globalShortcut) {
			this.registeredGlobalHotkeys = [];
			return;
		}

		for (const hotkey of this.registeredGlobalHotkeys) {
			try {
				globalShortcut.unregister(hotkey);
			} catch (error) {
				console.error(`Quick Tray: failed to unregister global shortcut ${hotkey}.`, error);
			}
		}
		this.registeredGlobalHotkeys = [];
	}

	private getWindow(): BrowserWindowInstanceLike | null {
		const electron = this.electron;
		if (!electron) {
			return null;
		}

		if (electron.getCurrentWindow) {
			return electron.getCurrentWindow();
		}

		const focused = electron.BrowserWindow?.getFocusedWindow?.();
		if (focused) {
			return focused;
		}

		const windows = electron.BrowserWindow?.getAllWindows?.();
		return windows?.[0] ?? null;
	}

	private openDetachedQuickNoteWindow(): boolean {
		const BrowserWindow = this.electron?.BrowserWindow;
		if (!BrowserWindow) {
			return false;
		}

		if (this.quickNoteWindow && !this.quickNoteWindow.isDestroyed?.()) {
			this.quickNoteWindow.show?.();
			this.quickNoteWindow.focus?.();
			return true;
		}

		try {
			const win = new BrowserWindow({
				width: 640,
				height: 430,
				minWidth: 480,
				minHeight: 360,
				title: this.t("quickNoteTitle"),
				show: false,
				resizable: true,
				minimizable: false,
				maximizable: false,
				fullscreenable: false,
				autoHideMenuBar: true,
				backgroundColor: "#ffffff",
				webPreferences: {
					nodeIntegration: true,
					contextIsolation: false,
					sandbox: false
				}
			});

			this.quickNoteWindow = win;
			win.setMenu?.(null);
			win.on?.("closed", () => {
				this.quickNoteWindow = null;
			});
			win.webContents?.on?.("ipc-message", (_event, channel, payload) => {
				if (channel === "quick-tray-submit") {
					void this.submitDetachedQuickNote(payload, win);
				}
				if (channel === "quick-tray-cancel") {
					win.close?.();
				}
			});

			const loadPromise = win.loadURL?.(buildQuickNoteWindowUrl({
				quickNoteTitle: this.t("quickNoteTitle"),
				title: this.t("title"),
				body: this.t("body"),
				untitled: this.t("untitled"),
				bodyPlaceholder: this.t("bodyPlaceholder"),
				create: this.t("create"),
				cancel: this.t("cancel")
			}));
			if (!loadPromise) {
				win.close?.();
				this.quickNoteWindow = null;
				return false;
			}

			void loadPromise.then(() => {
				win.show?.();
				win.focus?.();
			});

			return true;
		} catch (error) {
			console.error("Quick Tray: failed to open detached quick note window.", error);
			this.quickNoteWindow = null;
			return false;
		}
	}

	private async submitDetachedQuickNote(payload: unknown, win: BrowserWindowInstanceLike): Promise<void> {
		if (!isQuickNotePayload(payload)) {
			new Notice(this.t("invalidQuickNoteData"));
			return;
		}

		try {
			const file = await this.createQuickNote(payload.title, payload.body);
			new Notice(this.t("quickNoteCreated", { path: file.path }));
			win.close?.();
		} catch (error) {
			console.error("Quick Tray: failed to create quick note.", error);
			new Notice(this.t("quickNoteCreateFailed"));
		}
	}

	private buildQuickNoteName(title: string): string {
		const now = new Date();
		const safeTitle = sanitizeFileName(title.trim() || this.t("untitled"), this.t("untitled"));
		const pattern = this.settings.quickNoteNamePattern.trim() || DEFAULT_SETTINGS.quickNoteNamePattern;

		return sanitizePathSegment(pattern
			.replaceAll("{{date}}", formatDate(now))
			.replaceAll("{{time}}", formatTime(now))
			.replaceAll("{{timestamp}}", formatTimestamp(now))
			.replaceAll("{{title}}", safeTitle));
	}

	private async createUniquePath(path: string): Promise<string> {
		const extIndex = path.lastIndexOf(".");
		const base = extIndex === -1 ? path : path.slice(0, extIndex);
		const extension = extIndex === -1 ? "" : path.slice(extIndex);

		let candidate = path;
		let suffix = 2;
		while (this.app.vault.getAbstractFileByPath(candidate)) {
			candidate = `${base} ${suffix}${extension}`;
			suffix += 1;
		}
		return candidate;
	}
}

class QuickNoteModal extends Modal {
	private titleInput!: HTMLInputElement;
	private bodyInput!: HTMLTextAreaElement;

	constructor(app: App, private plugin: QuickTrayPlugin, private onClosed: () => void) {
		super(app);
	}

	onOpen(): void {
		this.titleEl.setText(this.plugin.t("quickNoteTitle"));
		this.contentEl.addClass("quick-tray-note-modal");

		new Setting(this.contentEl)
			.setName(this.plugin.t("title"))
			.addText((text) => {
				this.titleInput = text.inputEl;
				text.setPlaceholder(this.plugin.t("untitled"));
			});

		new Setting(this.contentEl)
			.setName(this.plugin.t("body"))
			.addTextArea((text) => {
				this.bodyInput = text.inputEl;
				text.setPlaceholder(this.plugin.t("bodyPlaceholder"));
			});

		new Setting(this.contentEl)
			.addButton((button) => {
				button
					.setButtonText(this.plugin.t("create"))
					.setCta()
					.onClick(() => this.submit());
			})
			.addButton((button) => {
				button
					.setButtonText(this.plugin.t("cancel"))
					.onClick(() => this.close());
			});

		this.titleInput.focus();
	}

	onClose(): void {
		this.contentEl.empty();
		this.onClosed();
	}

	private async submit(): Promise<void> {
		const title = this.titleInput.value.trim() || this.plugin.t("untitled");
		const body = this.bodyInput.value.trim();

		try {
			const file = await this.plugin.createQuickNote(title, body);
			new Notice(this.plugin.t("quickNoteCreated", { path: file.path }));
			this.close();
		} catch (error) {
			console.error("Quick Tray: failed to create quick note.", error);
			new Notice(this.plugin.t("quickNoteCreateFailed"));
		}
	}
}

function isQuickNotePayload(value: unknown): value is { title: string; body: string } {
	if (!value || typeof value !== "object") {
		return false;
	}

	const payload = value as Record<string, unknown>;
	return typeof payload.title === "string" && typeof payload.body === "string";
}

function buildQuickNoteWindowUrl(labels: {
	quickNoteTitle: string;
	title: string;
	body: string;
	untitled: string;
	bodyPlaceholder: string;
	create: string;
	cancel: string;
}): string {
	const html = `<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<title>${escapeHtml(labels.quickNoteTitle)}</title>
	<style>
		:root {
			color-scheme: light dark;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		}
		* {
			box-sizing: border-box;
		}
		body {
			margin: 0;
			background: Canvas;
			color: CanvasText;
		}
		main {
			display: flex;
			flex-direction: column;
			gap: 14px;
			height: 100vh;
			padding: 18px;
		}
		h1 {
			margin: 0 0 2px;
			font-size: 20px;
			font-weight: 700;
			line-height: 1.3;
		}
		.field {
			display: grid;
			grid-template-columns: clamp(72px, 18%, 128px) minmax(0, 1fr);
			gap: 10px 14px;
			align-items: start;
		}
		label {
			padding-top: 6px;
			font-size: 14px;
			line-height: 1.4;
			overflow-wrap: anywhere;
		}
		input,
		textarea {
			width: 100%;
			border: 1px solid color-mix(in srgb, CanvasText 18%, Canvas);
			border-radius: 6px;
			background: Canvas;
			color: CanvasText;
			font: inherit;
			outline: none;
		}
		input {
			height: 32px;
			padding: 5px 9px;
		}
		textarea {
			min-height: 210px;
			flex: 1;
			padding: 8px 9px;
			resize: none;
		}
		input:focus,
		textarea:focus {
			border-color: #5b8def;
			box-shadow: 0 0 0 2px color-mix(in srgb, #5b8def 25%, transparent);
		}
		.body-field {
			flex: 1;
		}
		.actions {
			display: flex;
			justify-content: flex-end;
			gap: 8px;
		}
		button {
			min-width: 56px;
			height: 32px;
			border: 1px solid color-mix(in srgb, CanvasText 18%, Canvas);
			border-radius: 6px;
			background: Canvas;
			color: CanvasText;
			font: inherit;
		}
		button.primary {
			border-color: #4f7dd9;
			background: #4f7dd9;
			color: #ffffff;
		}
	</style>
</head>
<body>
	<main>
		<h1>${escapeHtml(labels.quickNoteTitle)}</h1>
		<div class="field">
			<label for="title">${escapeHtml(labels.title)}</label>
			<input id="title" placeholder="${escapeHtml(labels.untitled)}" autocomplete="off">
		</div>
		<div class="field body-field">
			<label for="body">${escapeHtml(labels.body)}</label>
			<textarea id="body" placeholder="${escapeHtml(labels.bodyPlaceholder)}"></textarea>
		</div>
		<div class="actions">
			<button id="submit" class="primary">${escapeHtml(labels.create)}</button>
			<button id="cancel">${escapeHtml(labels.cancel)}</button>
		</div>
	</main>
	<script>
		const { ipcRenderer } = require("electron");
		const title = document.getElementById("title");
		const body = document.getElementById("body");
		const submit = () => {
			ipcRenderer.send("quick-tray-submit", {
				title: title.value.trim() || ${JSON.stringify(labels.untitled)},
				body: body.value.trim()
			});
		};
		document.getElementById("submit").addEventListener("click", submit);
		document.getElementById("cancel").addEventListener("click", () => ipcRenderer.send("quick-tray-cancel"));
		document.addEventListener("keydown", (event) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "Enter") submit();
			if (event.key === "Escape") ipcRenderer.send("quick-tray-cancel");
		});
		title.focus();
	</script>
</body>
</html>`;

	return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

class QuickTraySettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: QuickTrayPlugin) {
		super(app, plugin);
	}

	display(): void {
		this.plugin.refreshLanguage();
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: this.plugin.t("settingsTitle") });

		new Setting(containerEl)
			.setName(this.plugin.t("closeToTrayName"))
			.setDesc(this.plugin.t("closeToTrayDesc"))
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.closeToTray)
					.onChange(async (value) => {
						this.plugin.settings.closeToTray = value;
						await this.plugin.saveSettings();
						this.plugin.refreshDesktopIntegrations(false);
					});
			});

		new Setting(containerEl)
			.setName(this.plugin.t("quickNoteFolderName"))
			.setDesc(this.plugin.t("quickNoteFolderDesc"))
			.addText((text) => {
				text
					.setPlaceholder("Quick Notes")
					.setValue(this.plugin.settings.quickNoteFolder)
					.onChange(async (value) => {
						this.plugin.settings.quickNoteFolder = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName(this.plugin.t("quickNotePatternName"))
			.setDesc(this.plugin.t("quickNotePatternDesc"))
			.addText((text) => {
				text
					.setPlaceholder(DEFAULT_SETTINGS.quickNoteNamePattern)
					.setValue(this.plugin.settings.quickNoteNamePattern)
					.onChange(async (value) => {
						this.plugin.settings.quickNoteNamePattern = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName(this.plugin.t("openCreatedNoteName"))
			.setDesc(this.plugin.t("openCreatedNoteDesc"))
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.openCreatedNote)
					.onChange(async (value) => {
						this.plugin.settings.openCreatedNote = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName(this.plugin.t("trayIconName"))
			.setDesc(this.plugin.t("trayIconDesc"))
			.addText((text) => {
				text
					.setPlaceholder("C:\\Path\\To\\icon.ico")
					.setValue(this.plugin.settings.customTrayIconPath)
					.onChange(async (value) => {
						this.plugin.settings.customTrayIconPath = value;
						await this.plugin.saveSettings();
						this.plugin.refreshDesktopIntegrations(false);
					});
			});

		new Setting(containerEl)
			.setName(this.plugin.t("trayClickActionName"))
			.setDesc(this.plugin.t("trayClickActionDesc"))
			.addDropdown((dropdown) => {
				dropdown
					.addOption("toggle-obsidian", this.plugin.t("openHideObsidian"))
					.addOption("quick-note", this.plugin.t("quickNote"))
					.addOption("quick-search", this.plugin.t("quickSearch"))
					.setValue(this.plugin.settings.trayClickAction)
					.onChange(async (value) => {
						this.plugin.settings.trayClickAction = value as TrayClickAction;
						await this.plugin.saveSettings();
						this.plugin.refreshDesktopIntegrations(false);
					});
			});

		new Setting(containerEl)
			.setName(this.plugin.t("quickSearchModeName"))
			.setDesc(this.plugin.t("quickSearchModeDesc"))
			.addDropdown((dropdown) => {
				dropdown
					.addOption("search", this.plugin.t("search"))
					.addOption("quick-switcher", this.plugin.t("quickSwitcher"))
					.setValue(this.plugin.settings.quickSearchMode)
					.onChange(async (value) => {
						this.plugin.settings.quickSearchMode = value as QuickSearchMode;
						await this.plugin.saveSettings();
					});
			});

		containerEl.createEl("h3", { text: this.plugin.t("globalHotkeys") });
		containerEl.createDiv({
			cls: "quick-tray-setting-hint",
			text: this.plugin.t("globalHotkeysHint")
		});

		this.addHotkeySetting(this.plugin.t("quickNote"), "quickNoteHotkey");
		this.addHotkeySetting(this.plugin.t("quickSearch"), "quickSearchHotkey");
		this.addHotkeySetting(this.plugin.t("openHideObsidian"), "toggleObsidianHotkey");
	}

	private addHotkeySetting(name: string, key: keyof Pick<QuickTraySettings, "quickNoteHotkey" | "quickSearchHotkey" | "toggleObsidianHotkey">): void {
		new Setting(this.containerEl)
			.setName(name)
			.addText((text) => {
				text
					.setPlaceholder("Ctrl+Shift+Q")
					.setValue(this.plugin.settings[key])
					.onChange(async (value) => {
						this.plugin.settings[key] = value;
						await this.plugin.saveSettings();
						this.plugin.refreshDesktopIntegrations(false);
					});
			});
	}
}

function getElectronApi(): ElectronApi | null {
	const req = getRequire();
	if (!req) {
		return null;
	}

	try {
		const electron = req("electron") as Record<string, unknown>;
		const remote = (electron.remote ?? tryRequire(req, "@electron/remote")) as Record<string, unknown> | null;
		const source = remote ?? electron;

		return {
			Tray: source.Tray as ElectronApi["Tray"],
			Menu: source.Menu as MenuLike | undefined,
			nativeImage: source.nativeImage as NativeImageLike | undefined,
			app: source.app as ElectronAppLike | undefined,
			BrowserWindow: source.BrowserWindow as BrowserWindowLike | undefined,
			globalShortcut: source.globalShortcut as GlobalShortcutLike | undefined,
			getCurrentWindow: typeof source.getCurrentWindow === "function"
				? source.getCurrentWindow as () => BrowserWindowInstanceLike
				: undefined
		};
	} catch (error) {
		console.error("Quick Tray: Electron API lookup failed.", error);
		return null;
	}
}

function detectLanguage(): SupportedLanguage {
	const language = getLanguage().toLowerCase();
	return language === "ko" || language.startsWith("ko-") ? "ko" : "en";
}

function getRequire(): ((id: string) => unknown) | null {
	const candidate = (window as Window & { require?: (id: string) => unknown }).require;
	return typeof candidate === "function" ? candidate : null;
}

function tryRequire(req: (id: string) => unknown, id: string): unknown | null {
	try {
		return req(id);
	} catch {
		return null;
	}
}

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll("\"", "&quot;");
}

function getCommandApi(app: App): { executeCommandById: (id: string) => boolean } {
	const commands = (app as App & {
		commands?: {
			executeCommandById?: (id: string) => boolean;
		};
	}).commands;

	return {
		executeCommandById: (id: string) => Boolean(commands?.executeCommandById?.(id))
	};
}

async function ensureFolder(app: App, folder: string): Promise<void> {
	const parts = normalizePath(folder).split("/").filter(Boolean);
	let current = "";

	for (const part of parts) {
		current = current ? `${current}/${part}` : part;
		if (!app.vault.getAbstractFileByPath(current)) {
			await app.vault.createFolder(current);
		}
	}
}

function buildNoteContent(title: string, body: string): string {
	const lines = [`# ${title}`, ""];
	if (body.trim()) {
		lines.push(body.trim(), "");
	}
	return lines.join("\n");
}

function sanitizeFileName(value: string, fallback = "Untitled"): string {
	return value.replace(/[\\/:*?"<>|#^[\]]/g, " ").replace(/\s+/g, " ").trim() || fallback;
}

function sanitizePathSegment(value: string): string {
	return value.replace(/[\\:*?"<>|#^[\]]/g, " ").replace(/\s+/g, " ").trim() || "Untitled";
}

function formatDate(date: Date): string {
	return [
		date.getFullYear(),
		pad(date.getMonth() + 1),
		pad(date.getDate())
	].join("-");
}

function formatTime(date: Date): string {
	return [pad(date.getHours()), pad(date.getMinutes())].join("-");
}

function formatTimestamp(date: Date): string {
	return [
		date.getFullYear(),
		pad(date.getMonth() + 1),
		pad(date.getDate()),
		pad(date.getHours()),
		pad(date.getMinutes()),
		pad(date.getSeconds())
	].join("");
}

function pad(value: number): string {
	return value.toString().padStart(2, "0");
}
