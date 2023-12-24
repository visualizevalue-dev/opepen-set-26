import { io } from './socket_io.js'
import { getWidth } from './helpers.js'
import { vvrite } from './vv0.js'
import WORDS, { LETTER_COUNTS_PER_EDITION, MIN_LETTER_COUNT } from './words.js'

export default class OpepenCharacters {
  // Application State
  words = []
  previosWords = []
  edition = 1
  id = 1
  socket = null

  // HTML elements
  opepenElement = null
  formElement   = null
  inputElement  = null

  // Other options
  width = getWidth()

  constructor ({
    charactersElement,
    opepenElement,
    inputElement,
    formElement,
    edition,
    id,
  }) {
    this.charactersElement = charactersElement
    this.opepenElement = opepenElement
    this.inputElement = inputElement
    this.formElement = formElement
    this.checkIcon = opepenElement.querySelector('#icon-check')
    this.uncheckIcon = opepenElement.querySelector('#icon-uncheck')
    this.vvriter = opepenElement.querySelector('#vvriter')

    this.edition = edition
    this.id = id


    this.initialize()
  }

  get empty () {
    return this.words.length === 0
  }

  get lastWord () {
    return this.words.at(-1)
  }

  get maxLetterCount () {
    return LETTER_COUNTS_PER_EDITION[this.edition]
  }

  get letters () {
    const arr = []

    this.words.forEach(word => word.split('').forEach(letter => {
      arr.push(letter)
    }))

    return arr
  }

  get currentLetterCount () {
    return this.letters.length
  }

  get availableLetterCount () {
    return this.maxLetterCount - this.currentLetterCount
  }

  initialize () {
    this.charactersElement.className = `edition-${this.edition}`

    // Event listeners
    window.addEventListener('resize', () => this.onResize())
    this.formElement.addEventListener('submit', (e) => this.onWordSubmit(e))
    this.inputElement.addEventListener('input', (e) => this.onInput(e))
    this.checkIcon.addEventListener('click', () => this.onWordSubmit())
    this.uncheckIcon.addEventListener('click', () => this.clearInput())

    // Initial render...
    this.render()

    // Watch for updates from the API
    this.connect()
  }

  async connect () {
    this.socket = io('//api.opepen.art/sets/026', {
      query: {
        edition: this.edition,
        id: this.id,
      }
    })

    this.socket.on(`opepen:load:${this.id}`,    ({ words }) => this.setWords(words, true))
    this.socket.on(`opepen:updated:${this.id}`, ({ words }) => this.setWords(words))
  }

  setWords (words, forceSetPrevious = false) {
    this.previosWords = forceSetPrevious ? words : [ ...this.words ]
    this.words = words
    this.render()
  }

  onResize () {
    this.width = getWidth()
    this.opepenElement.style.setProperty("--width", this.width + 'px')

    this.render()
  }

  onInput () {
    const input = this.inputElement.value
    const valid = this.validateInput(input)

    if (valid) {
      this.checkIcon.className.baseVal = 'shown success'
      this.uncheckIcon.className.baseVal = ''
    } else if (input) {
      this.checkIcon.className.baseVal = ''
      this.uncheckIcon.className.baseVal = 'shown'
    } else {
      this.checkIcon.className.baseVal = ''
      this.uncheckIcon.className.baseVal = ''
    }

    this.vvriter.innerHTML = vvrite(input)
  }

  onWordSubmit (e) {
    // Don't submit the page via a POST request...
    e?.preventDefault()

    // Get the word from our input element
    const word = this.inputElement.value

    if (word === 'clear') {
      this.words = []
      this.store()
      this.clearInput()
      return this.render()
    }

    // Clear input if it's invalid
    if (! this.validateInput(word)) return this.clearInput()

    // Setup our new words
    const words = [...this.words]

    // Add our new word
    words.unshift(word)

    // If we replace a word, remove the last item
    if ((this.availableLetterCount - word.length) < 0) words.pop()

    // Add our word to the wordlist
    this.setWords(words)

    // Notify our server
    this.store()

    // Clear our form
    this.clearInput()

    // Render the new word...
    this.render()
  }

  async store () {
    return await this.socket.emit(`opepen:update:${this.id}`, { words: this.words })
  }

  validateInput (word) {
    const availableLetterCountAfter = this.availableLetterCount - word.length

    // Word is not part of the BIP 39 wordlist, it's not valid
    if (! WORDS.includes(word)) return false

    // FIXME: Clean up...
    if (
      // Allow replacing the last word
      word.length !== this.lastWord?.length &&
      (
        // If the word is longer than the space we have left
        word.length > this.availableLetterCount ||
        // If what we're about to add results in
        // less than 3 available letters, skip
        (
          this.availableLetterCount !== 0 &&
          availableLetterCountAfter > 0 &&
          availableLetterCountAfter < MIN_LETTER_COUNT
        )
      )
    ) return false

    return true
  }

  clearInput () {
    this.inputElement.value = ''
    this.onInput()
  }

  render () {
    // Set dimensions
    this.opepenElement.style.width = this.width + 'px'
    this.opepenElement.style.height = this.width + 'px'

    // Clear existing content
    this.charactersElement.innerHTML = ''

    // Adjust the input color
    this.formElement.className = this.empty ? 'empty' : ''

    let dark = true

    // Find existing span elements (if they exist) and fill our default tiles
    let letterElements = this.charactersElement.querySelectorAll('& > span')
    if (letterElements.length !== this.maxLetterCount) {
      Array(this.maxLetterCount).fill('').forEach(() => {
        this.charactersElement.appendChild(document.createElement('span'))
      })
    }
    letterElements = this.charactersElement.querySelectorAll('& > span')

    // Fill letters
    let index = 0
    this.words.forEach((word, wordIndex) => {
      word.split('').forEach(letter => {
        const el = letterElements[index]

        el.innerHTML = vvrite(letter)
        el.className = dark ? 'dark' : 'light'

        if (wordIndex === 0 && word !== this.previosWords[0]) {
          el.classList.add('highlight')

          setTimeout(() => el.classList.remove('highlight'), 1000)
        }

        index ++
      })

      dark = !dark
    })
  }

}
