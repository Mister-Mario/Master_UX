"use strict";

class I18n {

    constructor() {
        this.currentLanguage = window.localStorage.getItem("language") || "es"
        this.translations = {}
        this.init()
    }

    async init() {
        await this.loadTranslations(this.currentLanguage)
        this.updateText()
        this.updateMetaData()
        this.registerLanguageSelect()
    }

    async switchLanguageTo(lang) {
        this.currentLanguage = lang;
        window.localStorage.setItem("language", lang);
        await this.loadTranslations(lang)
        this.updateText()
        this.updateMetaData()
    }

    async loadTranslations(lang) {
        try {

            const translationsDocument = await fetch(`js/i18n/${lang}.json`)
            this.translations = await translationsDocument.json();
        } catch (error) {
            console.error(`Error al cargar lenguaje ${lang}`)
            if (lang !== "es")
                await this.loadTranslations("es")
        }
    }

    updateMetaData() {
        const pageName = document.querySelector("h2[data-i18n]").getAttribute("data-i18n").split(".")[0]
        this.updateDocumentLang();
        this.updateTitle(pageName);
        this.updateDescription(pageName);
    }

    updateDocumentLang() {
        document.documentElement.lang = this.currentLang;
    }

    updateTitle(pageName) {
        document.title = this.getTranslationFor(`${pageName}.title`)
    }

    updateDescription(pageName) {
        document.querySelector('meta[name="description"]').textContent = this.getTranslationFor(`${pageName}.description`)
    }

    updateText() {
        document.querySelectorAll("[data-i18n]").forEach(element => {
            let key = element.getAttribute("data-i18n")
            element.innerHTML = this.getTranslationFor(key)
        })

        document.querySelectorAll("[data-i18n-aria]").forEach(element => {
            let key = element.getAttribute("data-i18n-aria");
            let traduccion = this.getTranslationFor(key);

            element.setAttribute("aria-label", traduccion);

            if (element.tagName.toLowerCase() === 'input') {
                element.setAttribute("placeholder", traduccion);
            }
        });
    }

    getTranslationFor(key) {
        let value = this.translations;
        key.split(".").forEach(splittedKeyValue => {
            value = value[splittedKeyValue]
        })
        return value;
    }

    registerLanguageSelect() {
        const select = document.querySelector("header select")

        select.addEventListener("change", (e) => {
            this.switchLanguageTo(e.target.value)
        })

        select.value = this.currentLanguage
    }

}

window.i18n = new I18n();