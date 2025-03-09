// This sentence will contain a large array of text objects
// that will be used to display a sentence.
// When we have words data we can then highlight words
// along with the audio the correct timing.

class UISentence extends UIItem{
    constructor(scene,options){
        super('sentence');
        this.wordWrap = options?.wordWrap || scene.cameras.main.width * 0.5; // Default to 80% of screen width if not provided
        this.wordsData = []
        this.words = [];
        this.x = null;
        this.y = null;
        // load 100 text fields that we can recycle
        // based on target sentence
        
        const fontStyle = {
            fontFamily: 'Noto Sans JP',
            fontSize: '32px',
            color: '#ffffff'
        }
        for (let i = 0; i < 100; i++) {
          this.words.push(scene.add.text(0, 0, '',fontStyle));
        }

        // Create a temporary text object to calculate line height
        const tempText = scene.add.text(0, 0, 'Tg', fontStyle);
        this.lineHeight = tempText.height * 1.2; // Use 120% of text height for line spacing
        tempText.destroy();
    }

    set(wordsData){
      this.wordsData = wordsData
      // clear existing sentence
      this.clear()
      // iterate through 
      let x = 0;
      let y = 0;
      let lineStartX = 0; // Starting position of the current line

      for (let i = 0; i < this.wordsData.length; i++) {
        const wordData = this.wordsData[i];
        const wordObject = this.words[i]
        wordObject.setText(wordData.word)
        wordObject.setVisible(true)
        // factor in wordWrap
        if (x > lineStartX && x + wordObject.width > this.wordWrap) {
          // Move to the next line
          x = lineStartX;
          y += this.lineHeight;
        }
        wordObject.setPosition(x,y)
        x += wordObject.width
      }
    }

    // iterate through all words and rest them.
    clear(){
      for (let i = 0; i < this.words.length; i++) {
        const word = this.words[i]
        word.setText('')
        word.setVisible(false)
      }
    }


}