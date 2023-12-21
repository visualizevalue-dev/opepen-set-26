import WORDS, { LETTER_COUNTS_PER_EDITION } from './words.js'

export default class OpepenCharacters {
  // Application State
  words = []
  edition = 1
  id = 1

  // HTML elements
  opepenElement = null
  formElement   = null
  inputElement  = null

  constructor ({
    opepenElement,
    formElement,
    inputElement,
    edition,
    id,
  }) {
    this.opepenElement = opepenElement
    this.formElement = formElement
    this.inputElement = inputElement
    this.edition = edition
    this.id = id

    this.initialize()
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
    this.formElement.addEventListener('submit', (e) => this.onTextInput(e))


    console.log('AVAILABLE SLOTS', this.maxLetterCount)
  }

  onTextInput (e) {
    // Don't submit the page via a POST request...
    e.preventDefault()

    // Get the word from our input element
    const word = this.inputElement.value

    if (
      // Word is not part of the BIP 39 wordlist, clear the form
      ! WORDS.includes(word) ||
      word.length > this.availableLetterCount
    ) return this.clearInput()

    // Add our word to the wordlist
    this.words.push(word)

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
    // Clear existing content
    this.opepenElement.innerHTML = ''

    this.letters.forEach(letter => {
      const el = document.createElement('span')
      el.innerText = letter

      this.opepenElement.appendChild(el)
    })
  }

}
