import { getWidth } from './helpers.js'
import WORDS, { LETTER_COUNTS_PER_EDITION, MIN_LETTER_COUNT } from './words.js'

export default class OpepenCharacters {
  // Application State
  words = ['build', 'cube']
  edition = 1
  id = 1

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
    this.edition = edition
    this.id = id

    this.initialize()
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
    this.formElement.addEventListener('submit', (e) => this.onTextInput(e))

    // Initial render...
    this.render()

    console.log('AVAILABLE SLOTS', this.maxLetterCount)
  }

  onResize () {
    this.width = getWidth()
    this.opepenElement.style.setProperty("--width", this.width + 'px')

    this.render()
  }

  onTextInput (e) {
    // Don't submit the page via a POST request...
    e.preventDefault()

    // Get the word from our input element
    const word = this.inputElement.value
    const availableLetterCountAfter = this.availableLetterCount - word.length

    if (
      // Allow replacing the last word
      word.length !== this.lastWord.length &&
      (
        // Word is not part of the BIP 39 wordlist, clear the form
        ! WORDS.includes(word) ||
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

    ) return this.clearInput()

    // Add our word to the wordlist
    this.words.unshift(word)

    // If we replace a word, remove the last item
    if (this.availableLetterCount < 0) this.words.pop()

    // Clear our form
    this.clearInput()

    // Render the new word...
    this.render()

    console.log('current words', this.words)
    console.log('current letter count', this.currentLetterCount)
    console.log('available slots', this.maxLetterCount - this.currentLetterCount)
  }

  clearInput () {
    this.inputElement.value = ''
  }

  render () {
    // Set dimensions
    this.opepenElement.style.width = this.width + 'px'
    this.opepenElement.style.height = this.width + 'px'

    // Clear existing content
    this.charactersElement.innerHTML = ''

    let dark = true

    this.words.forEach(word => {
      word.split('').forEach(letter => {
        const el = document.createElement('span')
        el.innerText = letter
        el.className = dark ? 'dark' : 'light'

        this.charactersElement.appendChild(el)
      })

      dark = !dark
    })
  }

}
