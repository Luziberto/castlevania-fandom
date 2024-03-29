class Slide {
    _image;
    _title;
    _description;
    _link;
    _template;
    
    constructor(slide) {
        this._image = slide.image
        this._title = slide.title
        this._description = slide.description
        this._link = slide.link
        this._template = slide.template
    }
}
class SlideGallery {
    #_root;
    _current = 1;
    _items;
    _config = {
        speed: 500,
        cssEase: 'linear'
    }

    constructor(root, slides, config, template) {
        this._items = slides.map(slide => new Slide({ ...slide, template }))
        this._config = {...this._config, ...config}
        this.#generate(root)
    }

    #generate(root) {
        let content = ''
        this._items.forEach((item) => {
            console.log(item)
            const contentitemTemplate = item._template.innerHTML
            content += contentitemTemplate.replace('{img_url}', item._image)
        })
        const el = root.querySelector('.carousel-content')
        el.innerHTML = content
        this.#_root = el
    }
    
    previous() {
        if (this._current === 1) return this.change(this._items.length)
        return this.change(this._current - 1)
    }

    next() {
        if (this._current === this._items.length) return this.change(1)
        return this.change(this._current + 1)
    }

    change(item) {
        this._current = item
        this.#move(item)
        return item
    }

    #move(item) {
        this.#_root.style.transitionDuration = `${this._config.speed}ms`
        this.#_root.style.transitionTimingFunction = this._config.cssEase
        this.#_root.style.transform = `translateX(calc(${-item + 1} * 100%))`
    }
}
class Carousel{
    _slideGallery;
    #_root;
    _currentItem = 1;
    #_templates;
    _config = {
        autoplay: true,
        autoplaySpeed: 5000,
        speed: 500,
        cssEase: 'linear'
    }
    
    #_elements = {
        content: null,
        overlay: {
            el: null,
            controllers: {
                previous: null,
                next: null
            },
            content: null,
            previewItems: null
        }
    }

    constructor(root, items, config, templates) {
        // super()
        this.#_root = root
        this._config = { ...this._config, ...config }
        this.#_templates = templates
        this.#initConfig(items)
        this.#start(items)
    }

    async #initConfig(items) {
        this.#generateRootHtml()
        this._slideGallery = new SlideGallery(this.#_root, items, { speed: this._config.speed, cssEase: this._config.cssEase }, this.#_templates.contentItem)
        this.#generatePreviewHtml()
        this.#setElements()
        this.#setEvents()
    }

    moveSlide(item) {
        this.#reload(item)
        this._slideGallery.change(item)
    }
    
    previous() {
        this.#reload(this._slideGallery.previous())
    }

    next() {
        this.#reload(this._slideGallery.next())
    }

    #start() {
        this.#_root.classList.add('carousel')
        this.#reload(1)
    }

    #setElements() {
        this.#_elements.overlay.el = this.#_root.querySelector(`.carousel-overlay`)
        this.#_elements.overlay.controllers.previous = this.#_root.querySelector(`.carousel-overlay-controller.carousel-overlay-controller-previous`)
        this.#_elements.overlay.controllers.next = this.#_root.querySelector(`.carousel-overlay-controller.carousel-overlay-controller-next`)
        this.#_elements.overlay.previewItems = this.#_root.querySelectorAll(`.carousel-overlay-preview-item`)
        this.#_elements.content = this.#_root.querySelector(`.carousel-content`)
        this.#_elements.overlay.content = this.#_root.querySelector(`.carousel-overlay-content`)
    }
    
    #setEvents() {
        this.#_root.addEventListener('mouseenter', () => this.#_elements.overlay.el.classList.add('carousel-overlay--hover'))
        this.#_root.addEventListener('mouseleave', () => this.#_elements.overlay.el.classList.remove('carousel-overlay--hover'))
        this.#_elements.overlay.controllers.previous.addEventListener('click', () => this.previous())
        this.#_elements.overlay.controllers.next.addEventListener('click', () => this.next())
        Array.from(this.#_elements.overlay.previewItems).forEach((preview, index) => preview.addEventListener('click', () => this.moveSlide(index + 1)))
        if (this._config.autoplay) setInterval(() => this._slideGallery.next(), this._config.autoplaySpeed)
    }
    
    #reload(item) {
        this.#changePreviewItem(item)
        this.#changeItemContent(item)
    }
    
    #changePreviewItem(item) {
        Array.from(this.#_elements.overlay.previewItems).forEach(el => el.classList.remove('active'))
        this.#_elements.overlay.previewItems[item - 1].classList.add('active')
    }
    
    #generateRootHtml() {
        const template = this.#_templates.carousel.content.cloneNode(true)
        this.#_root.appendChild(template)
    }

    #generatePreviewHtml() {
        let previewContent = ''
        this._slideGallery._items.forEach((item, index) => previewContent += this.#_templates.overlayPreviewItem.innerHTML.replace('{img_url}', item._image))
        this.#_root.querySelector('.carousel-overlay-preview').innerHTML = previewContent
    }
    
    #changeItemContent(item) {
        if (this._config.description?.hidden) return this.#_elements.overlay.content.classList.add('hidden')
        this.#_root.querySelector(`.carousel-overlay-content-inner`).innerHTML = this.#_templates.overlayContentInner.innerHTML
            .replace('{title}', this._slideGallery._items[item - 1]._title || '')
            .replace('{description}', this._slideGallery._items[item - 1]._description || '')
            .replace('{link}', this._slideGallery._items[item - 1]._link || '#')
    }
}

HTMLElement.prototype.carousel = function (items = [], config = {}) {
    if (!this.carouselInstance) Object.defineProperties(this, { carouselInstance: { value: new Carousel(this, items, config, initTemplates()), writable: false } })
    
    return this.carouselInstance
}

const initTemplates = () => {
    const mainEl = createTemplate(mainTemplate)
    const contentItemEl = createTemplate(contentItemTemplate)
    const overlayContentEl = createTemplate(overlayContentTemplate)
    const overlayPreviewItemEl = createTemplate(overlayPreviewItemTemplate)
    
    return {
        carousel: mainEl,
        contentItem: contentItemEl,
        overlayContentInner: overlayContentEl,
        overlayPreviewItem: overlayPreviewItemEl
    }
}

const createTemplate = (template) => {
    const el = document.createElement('template')
    el.innerHTML = template
    return el
}

const mainTemplate = `<div class="carousel-content"></div><div class="carousel-overlay"><div class="carousel-overlay-controllers"><div class="carousel-overlay-controller carousel-overlay-controller-previous"><img src="public/svg/arrow-tiny.svg"></div><div class="carousel-overlay-controller carousel-overlay-controller-next"><img src="public/svg/arrow-tiny.svg"></div></div><div class="carousel-overlay-info"><div class="carousel-overlay-content"><div class="carousel-overlay-content-inner"></div></div><div class="carousel-overlay-preview"></div></div></div>`
const contentItemTemplate = `<div class="carousel-content-item"><img src="{img_url}"></div>`
const overlayContentTemplate = `<h2><b>{title}</b></h2><p>{description}</p><a class="content-link" href="{link}">Read more ></a>`
const overlayPreviewItemTemplate = `<div class="carousel-overlay-preview-item"><img src="{img_url}"></div>`
